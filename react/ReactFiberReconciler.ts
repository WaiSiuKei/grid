import { ReactComponent, ReactNodeList } from 'src/react/def';
import { HostComponent } from 'src/react/ReactWorkTags';
import { createFiberRoot, FiberRoot } from 'src/react/ReactFiberRoot';
import { DOMContainer } from 'src/react/ReactDOM';
import { Fiber } from 'src/react/ReactFiber';
import { createUpdate, enqueueUpdate } from 'src/react/ReactUpdateQueue';
import { performWorkOnRoot, renderRoot } from 'src/react/ReactFiberScheduler';

export function getPublicRootInstance(container: FiberRoot): ReactComponent<any, any> | null {
  const containerFiber = container.current;
  if (!containerFiber.child) {
    return null;
  }
  switch (containerFiber.child.tag) {
    case HostComponent:
      return containerFiber.child.stateNode;
    default:
      return containerFiber.child.stateNode;
  }
}

export function updateContainer(element: ReactNodeList, container: FiberRoot): void {
  const current = container.current;

  const update = createUpdate();
  update.payload = { element };

  // flushPassiveEffects();
  enqueueUpdate(current, update);
  performWorkOnRoot(container);
}

export function createContainer(containerInfo: DOMContainer): FiberRoot {
  return createFiberRoot(containerInfo);
}
