import { Fiber } from 'src/react/ReactFiber';
import { FunctionComponent as FC, HostRoot, HostText } from 'src/react/ReactWorkTags';
import { PerformedWork, Placement } from 'src/react/ReactSideEffectTags';
import { FunctionComponent } from './def';
import { mountChildFibers, reconcileChildFibers } from 'src/react/ReactChildFiber';

export function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
): Fiber | null {
  switch (workInProgress.tag) {
    case FC: {
      const Component = workInProgress.type;
      const resolvedProps = workInProgress.pendingProps;

      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
      );
    }
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    // case HostComponent:
    //   return updateHostComponent(current, workInProgress, renderExpirationTime);
    case HostText:
      return updateHostText(current, workInProgress);

    default:
      throw new Error('unknown');
  }
}

function updateFunctionComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: FunctionComponent<any>,
  nextProps: any,
): Fiber | null {
  let nextChildren;
  nextChildren = Component(nextProps, {});

  // React DevTools reads this flag.
  workInProgress.effectTag |= PerformedWork;
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,
  );
  return workInProgress.child;
}

function updateHostText(current: Fiber | null, workInProgress: Fiber): Fiber | null {
  if (current === null) {
    workInProgress.effectTag |= Placement;
  }
  // Nothing to do here. This is terminal. We'll do the completion step
  // immediately after.
  return null;
}

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,
) {
  if (current === null) {
    // If this is a fresh new component that hasn't been rendered yet, we
    // won't update its child set by applying minimal side-effects. Instead,
    // we will add them all to the child before it gets rendered. That means
    // we can optimize this reconciliation pass by not tracking side-effects.
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
    );
  } else {
    // If the current child is the same as the work in progress, it means that
    // we haven't yet started any work on these children. Therefore, we use
    // the clone algorithm to create a copy of all the current children.

    // If we had any progressed work already, that is invalid at this point so
    // let's throw it out.
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,
    );
  }
}
