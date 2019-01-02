import Host from './host';
import Ref from './ref';
import instantiateComponent from './instantiateComponent';
import shouldUpdateComponent from './shouldUpdateComponent';
import getElementKeyName from './getElementKeyName';
import instance from './instance';
import dom from './dom';

const STYLE = 'style';
const CHILDREN = 'children';
const TREE = 'tree';
const EVENT_PREFIX_REGEXP = /^on[A-Z]/;

/**
 * Native Component
 */
class NativeComponent {
  constructor(element) {
    this._currentElement = element;
  }

  mountComponent(parent, parentInstance, context, childMounter) {
    // Parent native element
    this._parent = parent;
    this._parentInstance = parentInstance;
    this._context = context;
    this._mountID = Host.mountID++;

    let props = this._currentElement.props;
    let type = this._currentElement.type;
    let instance = {
      _internal: this,
      type,
      props,
    };
    let appendType = props.append; // Default is node

    this._instance = instance;

    // Clone a copy for style diff
    this._prevStyleCopy = Object.assign({}, props.style);

    let nativeNode = this.getNativeNode();

    if (appendType !== TREE) {
      if (childMounter) {
        childMounter(nativeNode, parent);
      } else {
        dom.appendChild(nativeNode, parent);
      }
    }

    if (this._currentElement && this._currentElement.ref) {
      Ref.attach(this._currentElement._owner, this._currentElement.ref, this);
    }

    // Process children
    let children = props.children;
    if (children != null) {
      this.mountChildren(children, context);
    }

    if (appendType === TREE) {
      if (childMounter) {
        childMounter(nativeNode, parent);
      } else {
        dom.appendChild(nativeNode, parent);
      }
    }


    return instance;
  }

  mountChildren(children, context) {
    if (!Array.isArray(children)) {
      children = [children];
    }

    let renderedChildren = this._renderedChildren = {};

    let renderedChildrenImage = children.map((element, index) => {
      let renderedChild = instantiateComponent(element);
      let name = getElementKeyName(renderedChildren, element, index);
      renderedChildren[name] = renderedChild;
      renderedChild._mountIndex = index;
      // Mount
      let mountImage = renderedChild.mountComponent(this.getNativeNode(),
        this._instance, context, null);
      return mountImage;
    });

    return renderedChildrenImage;
  }

  unmountChildren(notRemoveChild) {
    let renderedChildren = this._renderedChildren;

    if (renderedChildren) {
      for (let name in renderedChildren) {
        let renderedChild = renderedChildren[name];
        renderedChild.unmountComponent(notRemoveChild);
      }
      this._renderedChildren = null;
    }
  }

  unmountComponent(notRemoveChild) {
    if (this._nativeNode) {
      let ref = this._currentElement.ref;
      if (ref) {
        Ref.detach(this._currentElement._owner, ref, this);
      }

      instance.remove(this._nativeNode);
      if (!notRemoveChild) {
        dom.removeChild(this._nativeNode, this._parent);
      }
      dom.removeAllEventListeners(this._nativeNode);
    }

    this.unmountChildren(notRemoveChild);


    this._currentElement = null;
    this._nativeNode = null;
    this._parent = null;
    this._parentInstance = null;
    this._context = null;
    this._instance = null;
    this._prevStyleCopy = null;
  }

  updateComponent(prevElement, nextElement, prevContext, nextContext) {
    // Replace current element
    this._currentElement = nextElement;

    Ref.update(prevElement, nextElement, this);

    let prevProps = prevElement.props;
    let nextProps = nextElement.props;

    this.updateProperties(prevProps, nextProps);
    this.updateChildren(nextProps.children, nextContext);

  }

  updateProperties(prevProps, nextProps) {
    let propKey;
    let styleName;
    let styleUpdates;
    for (propKey in prevProps) {
      if (propKey === CHILDREN ||
        nextProps.hasOwnProperty(propKey) ||
        !prevProps.hasOwnProperty(propKey) ||
        prevProps[propKey] == null) {
        continue;
      }
      if (propKey === STYLE) {
        let lastStyle = this._prevStyleCopy;
        for (styleName in lastStyle) {
          if (lastStyle.hasOwnProperty(styleName)) {
            styleUpdates = styleUpdates || {};
            styleUpdates[styleName] = '';
          }
        }
        this._prevStyleCopy = null;
      } else if (EVENT_PREFIX_REGEXP.test(propKey)) {
        if (typeof prevProps[propKey] === 'function') {
          dom.removeEventListener(this.getNativeNode(), propKey.slice(
            2).toLowerCase(), prevProps[propKey]);
        }
      } else {
        dom.removeAttribute(this.getNativeNode(), propKey, prevProps[
          propKey]);
      }
    }

    for (propKey in nextProps) {
      let nextProp = nextProps[propKey];
      let prevProp =
        propKey === STYLE ? this._prevStyleCopy :
          prevProps != null ? prevProps[propKey] : undefined;
      if (propKey === CHILDREN ||
        !nextProps.hasOwnProperty(propKey) ||
        nextProp === prevProp ||
        nextProp == null && prevProp == null) {
        continue;
      }
      // Update style
      if (propKey === STYLE) {
        if (nextProp) {
          // Clone property
          nextProp = this._prevStyleCopy = Object.assign({}, nextProp);
        } else {
          this._prevStyleCopy = null;
        }

        if (prevProp != null) {
          // Unset styles on `prevProp` but not on `nextProp`.
          for (styleName in prevProp) {
            if (prevProp.hasOwnProperty(styleName) &&
              (!nextProp || !nextProp.hasOwnProperty(styleName))) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = '';
            }
          }
          // Update styles that changed since `prevProp`.
          for (styleName in nextProp) {
            if (nextProp.hasOwnProperty(styleName) &&
              prevProp[styleName] !== nextProp[styleName]) {
              styleUpdates = styleUpdates || {};
              styleUpdates[styleName] = nextProp[styleName];
            }
          }
        } else {
          // Assign next prop when prev style is null
          styleUpdates = nextProp;
        }
      } else if (EVENT_PREFIX_REGEXP.test(propKey)) {
        // Update event binding
        let eventName = propKey.slice(2).toLowerCase();

        if (typeof prevProp === 'function') {
          dom.removeEventListener(this.getNativeNode(), eventName, prevProp, nextProps);
        }

        if (typeof nextProp === 'function') {
          dom.addEventListener(this.getNativeNode(), eventName, nextProp, nextProps);
        }
      } else {
        // Update other property
        let payload = {};
        payload[propKey] = nextProp;
        if (nextProp != null) {
          dom.setAttribute(this.getNativeNode(), propKey, nextProp);
        } else {
          dom.removeAttribute(this.getNativeNode(), propKey,
            prevProps[propKey]);
        }
      }
    }

    if (styleUpdates) {
      dom.setStyles(this.getNativeNode(), styleUpdates);
    }
  }

  updateChildren(nextChildrenElements, context) {
    // prev rendered children
    let prevChildren = this._renderedChildren;

    if (nextChildrenElements == null && prevChildren == null) {
      return;
    }

    let nextChildren = {};
    let oldNodes = {};

    if (nextChildrenElements != null) {
      if (!Array.isArray(nextChildrenElements)) {
        nextChildrenElements = [nextChildrenElements];
      }

      // Update next children elements
      for (let index = 0, length = nextChildrenElements.length; index <
      length; index++) {
        let nextElement = nextChildrenElements[index];
        let name = getElementKeyName(nextChildren, nextElement, index);
        let prevChild = prevChildren && prevChildren[name];
        let prevElement = prevChild && prevChild._currentElement;
        let prevContext = prevChild && prevChild._context;

        if (prevChild != null && shouldUpdateComponent(prevElement,
          nextElement)) {
          if (prevElement !== nextElement || prevContext !== context) {
            // Pass the same context when updating chidren
            prevChild.updateComponent(prevElement, nextElement, context,
              context);
          }

          nextChildren[name] = prevChild;
        } else {
          // Unmount the prevChild when nextChild is different element type.
          if (prevChild) {
            let oldNativeNode = prevChild.getNativeNode();
            // Delay remove child
            prevChild.unmountComponent(true);
            oldNodes[name] = oldNativeNode;
          }
          // The child must be instantiated before it's mounted.
          nextChildren[name] = instantiateComponent(nextElement);
        }
      }
    }

    let firstPrevChild;
    let delayRemoveFirstPrevChild;
    // Unmount children that are no longer present.
    if (prevChildren != null) {
      for (let name in prevChildren) {
        if (!prevChildren.hasOwnProperty(name)) {
          continue;
        }

        let prevChild = prevChildren[name];
        let shouldRemove = !nextChildren[name];

        // Store old first child ref for append node ahead and maybe delay remove it
        if (!firstPrevChild) {
          firstPrevChild = prevChild;
          delayRemoveFirstPrevChild = shouldRemove;
        } else if (shouldRemove) {
          prevChild.unmountComponent();
        }
      }
    }

    if (nextChildren != null) {
      // `nextIndex` will increment for each child in `nextChildren`, but
      // `lastIndex` will be the last index visited in `prevChildren`.
      let lastIndex = 0;
      let nextIndex = 0;
      let lastPlacedNode = null;
      let nextNativeNode = [];

      for (let name in nextChildren) {
        if (!nextChildren.hasOwnProperty(name)) {
          continue;
        }

        let nextChild = nextChildren[name];
        let prevChild = prevChildren && prevChildren[name];

        if (prevChild === nextChild) {
          let prevChildNativeNode = prevChild.getNativeNode();
          // Convert to array type
          if (!Array.isArray(prevChildNativeNode)) {
            prevChildNativeNode = [prevChildNativeNode];
          }

          // If the index of `child` is less than `lastIndex`, then it needs to
          // be moved. Otherwise, we do not need to move it because a child will be
          // inserted or moved before `child`.
          if (prevChild._mountIndex < lastIndex) {
            // Get the last child
            if (Array.isArray(lastPlacedNode)) {
              lastPlacedNode = lastPlacedNode[lastPlacedNode.length - 1];
            }

            for (let i = prevChildNativeNode.length - 1; i >= 0; i--) {
              dom.insertAfter(prevChildNativeNode[i], lastPlacedNode);
            }
          }

          nextNativeNode = nextNativeNode.concat(prevChildNativeNode);

          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          // Update to the latest mount order
          prevChild._mountIndex = nextIndex;
        } else {
          if (prevChild != null) {
            // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
            lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          }

          let parent = this.getNativeNode();
          // Fragment extended native component, so if parent is fragment should get this._parent
          if (Array.isArray(parent)) {
            parent = this._parent;
          }

          nextChild.mountComponent(
            parent,
            this._instance,
            context, (newChild, parent) => {
              // TODO: Rework the duplicate code
              let oldChild = oldNodes[name];
              if (!Array.isArray(newChild)) {
                newChild = [newChild];
              }

              function insertNewChild(newChild) {
                // Get the last child
                if (Array.isArray(lastPlacedNode)) {
                  lastPlacedNode = lastPlacedNode[lastPlacedNode.length - 1];
                }

                let prevFirstNativeNode;

                if (firstPrevChild && !lastPlacedNode) {
                  prevFirstNativeNode = firstPrevChild.getNativeNode();
                  if (Array.isArray(prevFirstNativeNode)) {
                    prevFirstNativeNode = prevFirstNativeNode[0];
                  }
                }

                if (lastPlacedNode) {
                  // Should reverse order when insert new child after lastPlacedNode:
                  // [lastPlacedNode, *newChild1, *newChild2]
                  for (let i = newChild.length - 1; i >= 0; i--) {
                    dom.insertAfter(newChild[i], lastPlacedNode);
                  }
                } else if (prevFirstNativeNode) {
                  // [*newChild1, *newChild2, prevFirstNativeNode]
                  for (let i = 0; i < newChild.length; i++) {
                    dom.insertBefore(newChild[i], prevFirstNativeNode);
                  }
                } else {
                  // [*newChild1, *newChild2]
                  for (let i = 0; i < newChild.length; i++) {
                    dom.appendChild(newChild[i], parent);
                  }
                }
              }

              if (oldChild) {
                // The oldChild or newChild all maybe fragment
                if (!Array.isArray(oldChild)) {
                  oldChild = [oldChild];
                }

                if (prevChild._mountIndex < lastIndex) {
                  for (let i = 0; i < oldChild.length; i++) {
                    dom.removeChild(oldChild[i]);
                  }

                  insertNewChild(newChild);
                } else {
                  // If newChild count large then oldChild:
                  // [oldChild1, oldChild2] => [newChild1, newChild2, newChild3]
                  let lastNewChild;
                  for (let i = 0; i < newChild.length; i++) {
                    let child = newChild[i];
                    if (oldChild[i]) {
                      dom.replaceChild(child, oldChild[i]);
                    } else {
                      dom.insertAfter(child, lastNewChild);
                    }
                    lastNewChild = child;
                  }

                  // If newChild count less then oldChild
                  // [oldChild1, oldChild2, oldChild3] => [newChild1, newChild2]
                  if (newChild.length < oldChild.length) {
                    for (let i = newChild.length; i < oldChild.length; i++) {
                      dom.removeChild(oldChild[i]);
                    }
                  }
                }
              } else {
                // Insert child at a specific index
                insertNewChild(newChild);
              }

              nextNativeNode = nextNativeNode.concat(newChild);
            }
          );
          // Update to the latest mount order
          nextChild._mountIndex = nextIndex;
        }

        nextIndex++;
        lastPlacedNode = nextChild.getNativeNode();
      }

      // Sync update native refs
      if (Array.isArray(this._nativeNode)) {
        // Clear all and push the new array
        this._nativeNode.splice(0, this._nativeNode.length);
        for (let i = 0; i < nextNativeNode.length; i++) {
          this._nativeNode.push(nextNativeNode[i]);
        }
      }
    }

    if (delayRemoveFirstPrevChild) {
      firstPrevChild.unmountComponent();
    }

    this._renderedChildren = nextChildren;
  }

  getNativeNode() {
    if (this._nativeNode == null) {
      this._nativeNode = dom.createElement(this._instance);
      instance.set(this._nativeNode, this._instance);
    }

    return this._nativeNode;
  }

  getPublicInstance() {
    return this.getNativeNode();
  }

  getName() {
    return this._currentElement.type;
  }
}

export default NativeComponent;
