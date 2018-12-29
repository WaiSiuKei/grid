import Component from '../component';

let rootCounter = 1;

class Root extends Component {
  constructor(...args) {
    super(...args);
    this.rootID = rootCounter++;
  }

  isRootComponent() {}

  render() {
    return this.props.children;
  }

  getPublicInstance() {
    return this.getRenderedComponent().getPublicInstance();
  }

  getRenderedComponent() {
    return this._internal._renderedComponent;
  }
}

export default Root;
