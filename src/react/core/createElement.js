import {
  hasSymbol,
  REACT_ELEMENT_TYPE,
  hasOwnProperty
} from './util';
import { Component } from './Component';
import { BuintinType, isFunction } from 'src/base/common/types';
import { ReactCurrentOwner } from '../ReactCurrentOwner';
import { typeOf } from 'src/base/common/types';

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

function makeProps(type, config, props, children, len) {
  // Remaining properties override existing props
  let propName;
  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }
  if (len === 1) {
    props.children = children[0];
  } else if (len > 1) {
    props.children = children;
  }

  return props;
}

function hasValidRef(config) {
  return config.ref !== undefined;
}

function hasValidKey(config) {
  return config.key !== undefined;
}

/**
 * 虚拟DOM工厂
 *
 * @param {string|function|Component} type
 * @param {object} props
 * @param {array} ...children
 * @returns
 */

export function createElement(type, config, ...children) {
  let props = {},
    tag = BuintinType.function,
    key = null,
    ref = null,
    argsLen = children.length;

  if (isFunction(type)) {
    tag = type.prototype && type.prototype.render ? BuintinType.class : BuintinType.null;
  }

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = config.key.toString();
    }
  }
  props = makeProps(type, config || {}, props, children, argsLen);

  return ReactElement(type, tag, props, key, ref, ReactCurrentOwner.current);
}

function ReactElement(type, tag, props, key, ref, owner) {
  var ret = {
    type,
    tag,
    props
  };
  if (tag !== BuintinType.symbol) {
    ret.$$typeof = REACT_ELEMENT_TYPE;
    ret.key = key || null;
    switch (typeOf(ref)) {
      case BuintinType.null:
      case BuintinType.undefined:
        ret.ref = null;
        break;
      case BuintinType.number:
      case BuintinType.boolean:
        ret.ref = ref.toString();
        break;
      default:
        ret.ref = ref;
        break;
    }
    ret._owner = owner;
  }
  return ret;
}

export function createVText(text) {
  return ReactElement('#text', 6, text + '');
}

function escape(key) {
  const escapeRegex = /[=:]/g;
  const escaperLookup = {
    '=': '=0',
    ':': '=2'
  };
  const escapedString = ('' + key).replace(escapeRegex, function (match) {
    return escaperLookup[match];
  });

  return '$' + escapedString;
}

let lastText, flattenIndex, flattenObject;

function flattenCb(context, child, key, childType) {
  if (child === null) {
    lastText = null;
    return;
  }
  if (childType === BuintinType.number || childType === BuintinType.string) {
    if (lastText) {
      lastText.props += child;
      return;
    }
    lastText = child = createVText(child);
  } else {
    lastText = null;
  }
  if (!flattenObject[key]) {
    flattenObject[key] = child;
  } else {
    key = '.' + flattenIndex;
    flattenObject[key] = child;
  }
  flattenIndex++;
}

export function fiberizeChildren(children, fiber) {
  flattenObject = {};
  flattenIndex = 0;
  if (children !== void 666) {
    lastText = null; //c 为fiber.props.children
    traverseAllChildren(children, '', flattenCb);
  }
  flattenIndex = 0;
  return (fiber.children = flattenObject);
}

function getComponentKey(component, index) {
  // Do some typechecking here since we call this blindly. We want to ensure
  // that we don't block potential future ES APIs.
  if (
    typeof component === 'object' &&
    component !== null &&
    component.key != null
  ) {
    // Explicit key
    return escape(component.key);
  }
  // Implicit key determined by the index in the set
  return index.toString(36);
}

const SEPARATOR = '.';
const SUBSEPARATOR = ':';

//operateChildren有着复杂的逻辑，如果第一层是可遍历对象，那么
export function traverseAllChildren(
  children,
  nameSoFar,
  callback,
  bookKeeping
) {
  let childType = typeOf(children);
  let invokeCallback = false;
  switch (childType) {
    case BuintinType.undefined: //undefined
    case BuintinType.null: //null
    case BuintinType.boolean: //boolean
    case BuintinType.function: //function
    case BuintinType.symbol: //symbol
      children = null;
      invokeCallback = true;
      break;
    case BuintinType.string: //string
    case BuintinType.number: //number
      invokeCallback = true;
      break;
    // 7 array
    case BuintinType.object: //object
      if (children.$$typeof || children instanceof Component) {
        invokeCallback = true;
      } else if (children.hasOwnProperty('toString')) {
        children = children + '';
        invokeCallback = true;
        childType = BuintinType.number;
      }
      break;
  }

  if (invokeCallback) {
    callback(
      bookKeeping,
      children,
      // If it's the only child, treat the name as if it was wrapped in an array
      // so that it's consistent if the number of children grows.
      nameSoFar === ''
        ? SEPARATOR + getComponentKey(children, 0)
        : nameSoFar,
      childType
    );
    return BuintinType.null;
  }

  let subtreeCount = 0; // Count of children found in the current subtree.
  const nextNamePrefix =
    nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;
  if (children.forEach) {
    //数组，Map, Set
    children.forEach(function (child, i) {
      let nextName = nextNamePrefix + getComponentKey(child, i);
      subtreeCount += traverseAllChildren(
        child,
        nextName,
        callback,
        bookKeeping
      );
    });
    return subtreeCount;
  }
  const iteratorFn = getIteractor(children);
  if (iteratorFn) {
    let iterator = iteratorFn.call(children),
      child,
      ii = 0,
      step,
      nextName;

    while (!(step = iterator.next()).done) {
      child = step.value;
      nextName = nextNamePrefix + getComponentKey(child, ii++);
      subtreeCount += traverseAllChildren(
        child,
        nextName,
        callback,
        bookKeeping
      );
    }
    return subtreeCount;
  }
  throw 'children: type is invalid.';
}

let REAL_SYMBOL = hasSymbol && Symbol.iterator;
let FAKE_SYMBOL = '@@iterator';

function getIteractor(a) {
  let iteratorFn = (REAL_SYMBOL && a[REAL_SYMBOL]) || a[FAKE_SYMBOL];
  if (iteratorFn && iteratorFn.call) {
    return iteratorFn;
  }
}
