import { returnFalse, get } from './util';
import { Renderer } from './createRenderer';
import { ReactCurrentOwner } from 'src/react/ReactCurrentOwner';


export const fakeObject = {
  enqueueSetState: returnFalse,
};

/**
 *组件的基类
 *
 * @param {any} props
 * @param {any} context
 */

export class Component {
  constructor(props, context) {
    //防止用户在构造器生成JSX

    ReactCurrentOwner.current = this;
    this.context = context;
    this.props = props;
    this.refs = {};
    this.updater = fakeObject;
    this.state = null;
  }

  setState(state, cb) {
    this.updater.enqueueSetState(get(this), state, cb);
  }

  forceUpdate(cb) {
    this.updater.enqueueSetState(get(this), true, cb);
  }

  render() {
    throw 'must implement render';
  }
}
