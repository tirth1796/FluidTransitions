import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Animated, findNodeHandle } from 'react-native';

import TransitionItem from './TransitionItem';
import * as Constants from './TransitionConstants';
import { createAnimatedWrapper, createAnimated } from './Utils';

const uniqueBaseId: string = 'tcid';
let uuidCount: number = 0;
let zIndex = 1;

type TransitionProps = {
  appear: ?boolean,
  disappear: ?boolean,
  shared: ?string,
  delay: ?boolean,
  animated: ?string,
  anchor: ?string,
  children: Array<any>,  
}

class Transition extends React.Component<TransitionProps> {
  static contextTypes = {
    register: PropTypes.func,
    unregister: PropTypes.func,
    route: PropTypes.string,
    getTransitionProgress: PropTypes.func,
    getDirectionForRoute: PropTypes.func,
    getDirection: PropTypes.func,
    getIndex: PropTypes.func,
    getIsPartOfSharedTransition: PropTypes.func,    
    getIsPartOfTransition: PropTypes.func,    
    getIsAnchored: PropTypes.func   
  }

  constructor(props: TransitionProps, context: any) {
    super(props, context);
    this._name = `${uniqueBaseId}-${uuidCount++}`;
    this._animatedComponent = null;    
  }

  _name: string
  _route: string
  _isMounted: boolean;
  _viewRef: any;
  _animatedComponent: any;
  _outerAnimatedComponent: any;

  componentDidMount() {
    const { register } = this.context;
    if (register) {
      this._route = this.context.route;
      register(new TransitionItem(
        this._getName(), this.context.route,
        this, this.props.shared !== undefined, this.props.appear,
        this.props.disappear, this.props.delay === undefined?false : this.props.delay,
        zIndex++, this.props.anchor, this.props.animated
      ));
    }
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    const { unregister } = this.context;
    if (unregister) {
      unregister(this._getName(), this._route);
    }
  }

  getNodeHandle(): number {
    return findNodeHandle(this._viewRef);
  }

  getViewRef(): any {
    return this._viewRef;
  }

  _getName(): string {
    if (this.props.shared) { return this.props.shared; }
    if (this.props.name) { return this.props.name; }
    return this._name;
  }

  render() {
    let element = React.Children.only(this.props.children);
    if (!element) { return null; }

    if (!this._animatedComponent) { this._animatedComponent = createAnimated(); }
    if (!this._outerAnimatedComponent) { this._outerAnimatedComponent = createAnimated(); }

    const visibilityStyle = this.getVisibilityStyle();
    const key = `${this._getName()}-${this._route}`;
    
    element = React.createElement(element.type, { ...element.props, key, ref: this.setViewRef });
    return createAnimatedWrapper({
      component: element,
      nativeStyles: [visibilityStyle, styles.transition],
      nativeCached: this._outerAnimatedComponent,
      cached: this._animatedComponent,
      log: true,
      logPrefix: "TV " + this._getName() + "/" + this._route
    });
  }
  
  setViewRef = (ref: any) => {
    this._viewRef = ref;
  }

  getVisibilityStyle() {
    const { getTransitionProgress, getIndex, getIsAnchored,
      getIsPartOfSharedTransition, getIsPartOfTransition } = this.context;
    if (!getTransitionProgress || !getIndex || !getIsAnchored ||
      !getIsPartOfSharedTransition || !getIsPartOfTransition) return {};
      
    const progress = getTransitionProgress();
    const index = getIndex();
    if (!progress || index === undefined) return { };

    const inputRange = [index - 1, (index-1) + Constants.OP, index - Constants.OP, index,index + Constants.OP, index + 1 - Constants.OP, index+1];
    const outputRange = [1, 0, 0, 1, 0 , 0, 1];
    
    const isPartOfSharedTransition = getIsPartOfSharedTransition(this._getName(), this._route);        
    const isPartOfTransition = getIsPartOfTransition(this._getName(), this._route);
    const isAnchored = getIsAnchored(this._getName(), this._route);
    const visibilityProgress = progress.interpolate({ inputRange, outputRange });

    if (isPartOfSharedTransition || isPartOfTransition || isAnchored) {
      return { opacity: visibilityProgress };          
    }  
    return {};
  }
}

const styles = StyleSheet.create({
  transition: {
    // backgroundColor: '#0000EF22',
    // borderColor: '#FF0000',
    // borderWidth: 1,
  },
});

export default Transition;
