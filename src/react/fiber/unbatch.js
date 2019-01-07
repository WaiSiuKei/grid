import { Component } from 'src/react/core/Component';

export class Unbatch extends Component {
  constructor(props) {
    super();

    this.state = {
      child: props.child
    };
  }

  render() {
    return this.state.child;
  }
}
