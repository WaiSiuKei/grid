import { isVirtualNode, isVirtualText, VirtualNode, VirtualText } from 'src/virtual-dom/vnode';
import { isObject } from 'src/base/common/types';

export function createElement(vnode: VirtualNode) {
  if (isVirtualText(vnode)) {
    return document.createTextNode((<VirtualText>vnode).text);
  } else if (!isVirtualNode(vnode)) {
    console.warn('Item is not a valid virtual dom node', vnode);
    return null;
  }

  let node = document.createElement(vnode.tagName);

  let props = vnode.properties;
  applyProperties(node, props);

  let children = vnode.children;

  for (let i = 0; i < children.length; i++) {
    let childNode = createElement(children[i]);
    if (childNode) {
      node.appendChild(childNode);
    }
  }

  return node;
}

function applyProperties(node: HTMLElement, props: { [key: string]: any } = Object.create(null), previous: { [key: string]: any } = {}) {
  for (let propName in props) {
    let propValue = props[propName] as any;

    if (propValue === undefined) {
      removeProperty(node, propName, propValue, previous);
    } else {
      if (isObject(propValue)) {
        patchObject(node, props, previous, propName, propValue);
      } else {
        node[propName] = propValue;
      }
    }
  }
}

function removeProperty(node: HTMLElement, propName: string, propValue: any, previous: { [key: string]: any }) {
  if (previous) {
    let previousValue = previous[propName];

    if (propName === 'attributes') {
      for (let attrName in previousValue) {
        node.removeAttribute(attrName);
      }
    } else if (propName === 'style') {
      for (let i in previousValue) {
        node.style[i] = '';
      }
    } else if (typeof previousValue === 'string') {
      node[propName] = '';
    } else {
      node[propName] = null;
    }
  }
}

function patchObject(node: HTMLElement, props: { [key: string]: any }, previous: { [key: string]: any }, propName: string, propValue: any) {
  let previousValue = previous ? previous[propName] : undefined;

  // Set attributes
  if (propName === 'attributes') {
    for (let attrName in propValue) {
      let attrValue = propValue[attrName];

      if (attrValue === undefined) {
        node.removeAttribute(attrName);
      } else {
        node.setAttribute(attrName, attrValue);
      }
    }

    return;
  }

  if (previousValue && isObject(previousValue) &&
    getPrototype(previousValue) !== getPrototype(propValue)) {
    node[propName] = propValue;
    return;
  }

  if (!isObject(node[propName])) {
    node[propName] = {};
  }

  let replacer = propName === 'style' ? '' : undefined;

  for (let k in propValue) {
    let value = propValue[k];
    node[propName][k] = (value === undefined) ? replacer : value;
  }
}

function getPrototype(value: any) {
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(value);
  } else if (value.__proto__) {
    return value.__proto__;
  } else if (value.constructor) {
    return value.constructor.prototype;
  }
}
