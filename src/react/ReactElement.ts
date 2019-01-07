import { Attributes, FunctionComponent, FunctionComponentElement, Key, ReactElement, ReactNode } from './def';
import { ReactCurrentOwner } from './ReactCurrentOwner';
import { REACT_ELEMENT_TYPE } from './ReactSymbols';

const hasOwnProperty = Object.prototype.hasOwnProperty;

const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

export interface InternalExtendedAttributes {
  key?: Key;
  children: ReactNode[]
}

function hasValidRef(config: Attributes): boolean {
  return config.ref !== undefined;
}

function hasValidKey(config: Attributes): boolean {
  return config.key !== undefined;
}

export function createElement<P extends {}>(type: FunctionComponent<P>, config: Attributes & P | null, ...children: ReactNode[]): FunctionComponentElement<P> {
  let propName;

  // Reserved names are extracted
  const props: InternalExtendedAttributes = Object.create(null);

  let key = null;
  let ref: any = null;
  let self = null;
  let source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = config.key.toString();
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return CreateReactElement(
    type,
    key,
    ref,
    ReactCurrentOwner.current,
    props,
  );
}

export interface InternalReactElement<P> extends FunctionComponentElement<P> {
  $$typeof: Symbol | number

  _owner: ReactElement<any>
}

function CreateReactElement(type: FunctionComponent<any>, key: string, ref: any, owner: ReactElement<any>, props: InternalExtendedAttributes): InternalReactElement<any> {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };

  return element;
}
