import { diffProps } from './props';
import { NAMESPACE } from './browser';
import {
  noop,
  emptyObject,
  topNodes,
  topFibers
} from 'src/react/core/util';
import { Renderer, createRenderer } from 'src/react/core/createRenderer';
import { render, createContainer } from 'src/react/fiber/scheduleWork';
import { duplexAction, fireDuplex } from './duplex';

const reuseTextNodes = []; //文本节点不能加属性，样式与事件，重用没有副作用
export function createElement(vnode) {
  let p = vnode.return;
  let { type, props, ns } = vnode;
  switch (type) {
    case '#text':
      //只重复利用文本节点
      var node = reuseTextNodes.pop();
      if (node) {
        node.nodeValue = props;
        return node;
      }
      return document.createTextNode(props);
    case '#comment':
      return document.createComment(props);

    case 'svg':
      ns = NAMESPACE.svg;
      break;
    case 'math':
      ns = NAMESPACE.math;
      break;

    default:
      do {
        var s =
          p.name == 'AnuPortal'
            ? p.props.parent
            : p.tag === 5
            ? p.stateNode
            : null;
        if (s) {
          ns = s.namespaceURI;
          if (p.type === 'foreignObject' || ns === NAMESPACE.xhtml) {
            ns = '';
          }
          break;
        }
      } while ((p = p.return));

      break;
  }
  try {
    if (ns) {
      vnode.namespaceURI = ns;
      return document.createElementNS(ns, type);
    }
    //eslint-disable-next-line
  } catch (e1) {
    /*skip*/
  }
  let elem = document.createElement(type);
  let inputType = props && props.type; //IE6-8下立即设置type属性
  if (inputType && elem.uniqueID) {
    try {
      elem = document.createElement(
        '<' + type + ' type=\'' + inputType + '\'/>'
      );
    } catch (e2) {
      /*skip*/
    }
  }
  return elem;
}

let hyperspace = document.createElement('div');

function emptyElement(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

Renderer.middleware({
  begin: noop,
  end: fireDuplex
});

export function removeElement(node) {
  if (!node) {
    return;
  }
  let nodeType = node.nodeType;
  if (nodeType === 1 && node.__events) {
    node.__events = null;
  } else if (nodeType === 3 && reuseTextNodes.length < 100) {
    reuseTextNodes.push(node);
  }
  hyperspace.appendChild(node);
  hyperspace.removeChild(node);
}

function safeActiveElement() {
  try {  //在IE9中获取iframe中的activeElemet时会抛出异常
    return document.activeElement;
  } catch (e) {}
}

function insertElement(fiber) {
  let { stateNode: dom, parent } = fiber;

  try {
    let insertPoint = fiber.forwardFiber
      ? fiber.forwardFiber.stateNode
      : null;
    let after = insertPoint ? insertPoint.nextSibling : parent.firstChild;
    if (after == dom) {
      return;
    }
    if (after === null && dom === parent.lastChild) {
      return;
    }
    //插入**元素节点**会引发焦点丢失，触发body focus事件
    Renderer.inserting = fiber.tag === 5 && safeActiveElement();
    parent.insertBefore(dom, after);
    Renderer.inserting = null;
  } catch (e) {
    throw e;
  }
}

//其他Renderer也要实现这些方法
render.Render = Renderer;

export const DOMRenderer = createRenderer({
  render,
  updateAttribute(fiber) {
    let { props, lastProps, stateNode } = fiber;
    diffProps(stateNode, lastProps || emptyObject, props, fiber);
  },
  updateContent(fiber) {
    fiber.stateNode.nodeValue = fiber.props;
  },
  updateControlled: duplexAction,
  createElement,
  insertElement,
  emptyElement(fiber) {
    emptyElement(fiber.stateNode);
  },

  // [Top API] ReactDOM.unmountComponentAtNode
  unmountComponentAtNode(root) {
    let container = createContainer(root, true);
    let fiber = Object(container).child;
    if (fiber) {
      Renderer.updateComponent(
        fiber,
        {
          child: null
        },
        function () {
          removeTop(root);
        },
        true
      );
      return true;
    }
    return false;
  },
  removeElement(fiber) {
    let dom = fiber.stateNode;
    if (dom) {
      removeElement(dom);
      delete fiber.stateNode;
      if (dom._reactInternalFiber) {
        removeTop(dom);
      }
    }
  }
});

function removeTop(dom) {
  let j = topNodes.indexOf(dom);
  if (j !== -1) {
    topFibers.splice(j, 1);
    topNodes.splice(j, 1);
  }
  dom._reactInternalFiber = null;
}
