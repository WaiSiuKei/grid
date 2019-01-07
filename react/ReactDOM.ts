import { ReactChild, ReactComponent, ReactElement, ReactNodeList } from 'src/react/def';
import { createContainer, getPublicRootInstance, updateContainer } from 'src/react/ReactFiberReconciler';
import { FiberRoot } from 'src/react/ReactFiberRoot';

export function render(
  element: ReactElement<any>,
  container: DOMContainer,
) {
  return legacyRenderSubtreeIntoContainer(
    element,
    container,
  );
}

export interface Root {
  render(children: ReactNodeList): void,
  // unmount(callback: ?() => mixed): Work,
  // legacy_renderSubtreeIntoContainer(
  //   parentComponent: ?React$Component<any, any>,
  // children: ReactNodeList,
  // callback?: () => mixed,): Work,
  // createBatch(): Batch,
  //
  _internalRoot: FiberRoot,
}

export type DOMContainer = (HTMLElement & { _reactRootContainer: Root, })

class ReactRoot {
  _internalRoot: any;
  constructor(container: DOMContainer) {
    this._internalRoot = createContainer(container);
  }

  render(children: ReactNodeList) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }

  unmount() {
    const root = this._internalRoot;
    updateContainer(null, root);
  }

  legacy_renderSubtreeIntoContainer(children: ReactNodeList) {
    const root = this._internalRoot;
    updateContainer(children, root);
  }
}

export function unmountComponentAtNode(container: DOMContainer) {
  if (container._reactRootContainer) {
    legacyRenderSubtreeIntoContainer(null, container,);
    container._reactRootContainer = null;
    return true;
  } else {
    return false;
  }
}

function legacyRenderSubtreeIntoContainer(
  children: ReactNodeList,
  container: DOMContainer,
) {

  let root: Root = container._reactRootContainer;
  if (!root) {
    // Initial mount
    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }

    // Legacy roots are not async by default.
    root = container._reactRootContainer = new ReactRoot(container);
    root.render(children);
  } else {
    // Update
    root.render(children);
  }
  return getPublicRootInstance(root._internalRoot);
}
