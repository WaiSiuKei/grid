import { miniCreateClass } from 'src/react/core/util';
import { Component } from 'src/react/core/Component';

export var Unbatch = miniCreateClass(
  function Unbatch(props) {
    this.state = {
      child: props.child
    };
  },
  Component,
  {
    render() {
      return this.state.child;
    }
  }
);
