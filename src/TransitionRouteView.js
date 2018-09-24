import React from 'react';
import PropTypes from 'prop-types';
import { Animated } from 'react-native';

type TransitionRouteViewProps = {
  children: Array<any>,
  style: ?any,
  route: string,
  sceneKey: ?string,
}

class TransitionRouteView extends React.Component<TransitionRouteViewProps> {
  static childContextTypes = {
    route: PropTypes.string,
  };

  static contextTypes = {
    onSceneReady: PropTypes.func,
  };

  getChildContext() {
    return {
      route: this.props.route,
    };
  }

  componentDidMount() {
    const { onSceneReady } = this.context;
    if (!onSceneReady || !this.props.sceneKey) return;
    onSceneReady(this.props.sceneKey);
  }

  render() {
    return (
      <Animated.View style={this.props.style}>
        {this.props.children}
      </Animated.View>
    );
  }
}

export default TransitionRouteView;
