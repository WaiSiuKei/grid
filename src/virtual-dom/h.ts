import { VirtualNode, VirtualText } from 'src/virtual-dom/vnode';
import { isArray } from 'src/base/common/types';
import { parseTag } from 'src/virtual-dom/parse-tag';

function _h(tagName: string, properties: { [key: string]: any }, children?: VirtualNode[]): VirtualNode
// function _h(tagName: string, children: VirtualNode[]): VirtualNode
function _h(tagName: string, arg1?: any, arg2?: any): VirtualNode {
  let childNodes: VirtualNode[] = [];

  let children: VirtualNode[] = [];
  let props: { [key: string]: any };

  if (!arg2 && isArray(arg1)) {
    children = arg1 || [];
    props = {};
  } else {
    children = arg2 || [];
    props = arg1 || {};
  }

  let tag = parseTag(tagName, props);

  let key: string;
  // support keys
  if (props.hasOwnProperty('key')) {
    key = props.key;
    props.key = undefined;
  }

  if (children !== undefined && children !== null) {
    addChild(children, childNodes, tag, props);
  }

  return new VirtualNode(tag, props, childNodes, key);
}

function addChild(c: VirtualNode | VirtualNode[] | string | number, childNodes: VirtualNode[], tag: string, props: { [key: string]: any }) {
  if (typeof c === 'string') {
    childNodes.push(new VirtualText(c as string));
  } else if (typeof c === 'number') {
    childNodes.push(new VirtualText(String(c)));
  } else if (isChild(c)) {
    childNodes.push(c as VirtualNode);
  } else if (isArray(c)) {
    for (let i = 0; i < c.length; i++) {
      addChild(c[i] as VirtualNode, childNodes, tag, props);
    }
  } else if (c === null || c === undefined) {
    return;
  } else {
    throw UnexpectedVirtualElement({
      foreignObject: c,
      parentVnode: {
        tagName: tag,
        properties: props
      }
    });
  }
}

function isChild(x: any) {
  return x instanceof VirtualNode || x instanceof VirtualText;
}

function UnexpectedVirtualElement(data: any) {
  var err = new Error();

  // err.type = 'virtual-hyperscript.unexpected.virtual-element';
  err.message = 'Unexpected virtual child passed to h().\n' +
    'Expected a VNode / Vthunk / VWidget / string but:\n' +
    'got:\n' +
    errorString(data.foreignObject) +
    '.\n' +
    'The parent vnode is:\n' +
    errorString(data.parentVnode);
  '\n' +
  'Suggested fix: change your `h(..., [ ... ])` callsite.';
  // err.foreignObject = data.foreignObject;
  // err.parentVnode = data.parentVnode;

  return err;
}

function UnsupportedValueType(data: any) {
  var err = new Error();

  // err.type = 'virtual-hyperscript.unsupported.value-type';
  err.message = 'Unexpected value type for input passed to h().\n' +
    'Expected a ' +
    errorString(data.expected) +
    ' but got:\n' +
    errorString(data.received) +
    '.\n' +
    'The vnode is:\n' +
    errorString(data.Vnode);
  '\n' +
  'Suggested fix: Cast the value passed to h() to a string using String(value).';

  return err;
}

function errorString(obj: any) {
  try {
    return JSON.stringify(obj, null, '    ');
  } catch (e) {
    return String(obj);
  }
}

export const h = _h;
