import { pushError } from './ErrorBoundary';
import { BuintinType, typeOf } from 'src/base/common/types';

//fix 0.14对此方法的改动，之前refs里面保存的是虚拟DOM

function getDOMNode() {
  return this;
}

export let Refs = {
  // errorHook: string,//发生错误的生命周期钩子
  // errorInfo: [],    //已经构建好的错误信息
  // doctors: null     //医生节点
  // error: null       //第一个捕捉到的错误
  fireRef(fiber, dom) {
    let ref = fiber.ref;
    let owner = fiber._owner;
    try {
      refStrategy[typeOf(ref)](owner, ref, dom);
      if (owner && owner.__isStateless) {
        delete fiber.ref;
        fiber.deleteRef = true;
      }

    } catch (e) {
      pushError(fiber, 'ref', e);
    }
  },
};

const refStrategy = {
  [BuintinType.string]: function (owner, ref, dom) {
    //string
    if (dom === null) {
      delete owner.refs[ref];
    } else {
      if (dom.nodeType) {
        dom.getDOMNode = getDOMNode;
      }
      owner.refs[ref] = dom;
    }
  },
  [BuintinType.function]: function (owner, ref, dom) {
    ref(dom);
  },
  [BuintinType.object]: function (owner, ref, dom) {
    ref.current = dom;
  },
};
