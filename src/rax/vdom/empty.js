import dom from './dom';

/**
 * Empty Component
 */
class EmptyComponent {
  constructor() {
    this._currentElement = null;
  }

  mountComponent(parent, parentInstance, context, childMounter) {
    this._parent = parent;
    this._parentInstance = parentInstance;
    this._context = context;

    let instance = {
      _internal: this
    };

    let nativeNode = this.getNativeNode();
    if (childMounter) {
      childMounter(nativeNode, parent);
    } else {
      dom.appendChild(nativeNode, parent);
    }

    return instance;
  }

  unmountComponent(notRemoveChild) {
    if (this._nativeNode && !notRemoveChild) {
      dom.removeChild(this._nativeNode, this._parent);
    }

    this._nativeNode = null;
    this._parent = null;
    this._parentInstance = null;
    this._context = null;
  }

  updateComponent() {
    // Noop
  }

  getNativeNode() {
    // Weex native node
    if (this._nativeNode == null) {
      this._nativeNode = dom.createEmpty();
    }

    return this._nativeNode;
  }
}

export default EmptyComponent;
