import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import ShallowRenderer from './Utils/shallowRenderer';
import { Metrics } from './Types/Metrics';
import { getRotationFromStyle, getBoundingBox, getOriginalRect } from './Utils';

type Size = {
  x: number,
  y: number
}

const getDegreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const getRotationRad = (ri) => {
  if (ri.type === 'deg') return getDegreesToRadians(ri.value);
  return ri.value;
};

const getRadiansToDegrees = (rad: number): number => (rad * 180) / Math.PI;

// eslint-disable-next-line no-unused-vars
const getRotationDeg = (ri) => {
  if (ri.type === 'rad') return getRadiansToDegrees(ri.value);
  return ri.value;
};

export default class TransitionItem {
  constructor(
    name: string, route: string, reactElement: Object,
    shared: boolean, appear: string, disappear: string,
    delay: boolean, index: number, anchor: string, animated: string
  ) {
    this.name = name;
    this.route = route;
    this.reactElement = reactElement;
    this.shared = shared;
    this.appear = appear;
    this.disappear = disappear;
    this.delay = delay;
    this.index = index;
    this.anchor = anchor;
    this.animated = animated;
  }

  name: string;
  route: string;
  reactElement: Object;
  metrics: Metrics;
  shared: boolean;
  appear: string | Function;
  disappear: string | Function;
  delay: boolean;
  layoutReady: boolean;
  flattenedStyle: ?any;
  boundingBoxMetrics: Metrics;
  index: number;
  anchor: string;
  animated: string;
  _rotation: any;
  _testRenderer: any;

  getNodeHandle() {
    return this.reactElement.getNodeHandle();
  }

  getViewRef() {
    return this.reactElement.getViewRef();
  }

  getFlattenedStyle(refresh = false) {
    if (refresh || !this.flattenedStyle) {
      const element = React.Children.only(this.reactElement.props.children);
      if (!element) { return null; }

      // Shallow renderer should not need to be used for views we know does
      // not create any magic inner styles. The following test is needed
      // when running in production mode.
      const shouldRenderRenderElement = element.type !== 'RCTView';
      let { style } = element.props;

      if (shouldRenderRenderElement) {
        if (!this._testRenderer) {
          this._testRenderer = ShallowRenderer.createRenderer();
        }
        const tree = this._testRenderer.render(element);
        // eslint-disable-next-line prefer-destructuring
        style = tree.props.style;
      }

      if (!style) return null;
      this.flattenedStyle = StyleSheet.flatten(style);
    }

    return this.flattenedStyle;
  }

  updateMetrics(viewMetrics: Metrics, itemMetrics: Metrics) {
    const {
      x, y, width, height
    } = itemMetrics;

    const ri = this.getRotation();
    const t = getRotationRad(ri);

    if (t !== 0) {
      const r = getOriginalRect({
        boundingBox: {
          x, y, width, height
        },
        theta: t,
        skipWidth: Platform.OS !== 'ios',
      });

      this.metrics = {
        x: r.x - viewMetrics.x,
        y: r.y - viewMetrics.y,
        width: r.width,
        height: r.height,
      };

      this.boundingBoxMetrics = getBoundingBox({ rect: this.metrics, theta: t });
    } else {
      this.metrics = {
        x: x - viewMetrics.x, y: y - viewMetrics.y, width, height
      };
      this.boundingBoxMetrics = this.metrics;
    }

    // console.log(this.name  + "/" + this.route + "-" + this.metrics.x + "," + this.metrics.y + " - " + this.metrics.width + "," + this.metrics.height);
  }

  getRotation() {
    if (!this._rotation) {
      const ri = getRotationFromStyle(this.getFlattenedStyle());
      let retVal = { type: 'unknown', value: 0 };
      if (ri.rotate) {
        if (ri.rotate.rotate) {
          const rotation: String = ri.rotate.rotate;
          if (rotation.endsWith('deg')) {
            retVal = { type: 'deg', value: parseInt(rotation.substring(0, rotation.length - 3), 10) };
          } else if (rotation.endsWith('rad')) {
            retVal = { type: 'rad', value: parseInt(rotation.substring(0, rotation.length - 3), 10) };
          }
        }
      }
      this._rotation = retVal;
    }
    return this._rotation;
  }

  scaleRelativeTo(other: TransitionItem): Size {
    const validate = (i) => {
      if (!i.metrics) {
        throw new Error(`No metrics in ${i.name}:${i.containerRouteName}`);
      }
    };
    validate(this);
    validate(other);
    return {
      x: this.metrics.width / other.metrics.width,
      y: this.metrics.height / other.metrics.height,
    };
  }
}
