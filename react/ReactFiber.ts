import { HostRoot, WorkTag } from 'src/react/ReactWorkTags';
import { NoEffect, SideEffectTag } from 'src/react/ReactSideEffectTags';
import { NoContext } from 'src/react/ReactTypeOfMode';

export function createHostRootFiber() {
  return createFiber(HostRoot, null, null, NoContext);
}

export class Fiber {
  elementType: any = null;
  type: any = null;
  stateNode: any = null;

  // Conceptual aliases
  // parent : Instance -> return The parent happens to be the same as the
  // return fiber since we've merged the fiber and instance.

  // Remaining fields belong to Fiber

  // The Fiber to return to after finishing processing this one.
  // This is effectively the parent, but there can be multiple parents (two)
  // so this is only the parent of the thing we're currently processing.
  // It is conceptually the same as the return address of a stack frame.
  return: Fiber | null = null;

  // Singly Linked List Tree Structure.
  child: Fiber | null = null;
  sibling: Fiber | null = null;
  index: number = 0;

  memoizedProps: any = null;
  memoizedState: any = null;

  updateQueue: any = []

  ref: any = null;

  effectTag: SideEffectTag = NoEffect;
  nextEffect: Fiber = null;

  firstEffect: Fiber = null;
  lastEffect: Fiber = null;

  // This is a pooled version of a Fiber. Every fiber that gets updated will
  // eventually have a pair. There are cases when we can clean up pairs to save
  // memory if we need to.
  alternate: Fiber | null = null;

  constructor(public tag: WorkTag, public pendingProps: any, public key: null | string, public mode: number) {

  }
}

export interface Fiber {

}

const createFiber = function (
  tag: WorkTag,
  pendingProps: any,
  key: null | string,
  mode: number,
): any {
  return new Fiber(tag, pendingProps, key, mode);
};

// This is used to create an alternate fiber to do work on.
export function createWorkInProgress(
  current: Fiber,
  pendingProps: any,
): Fiber {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    // We use a double buffering pooling technique because we know that we'll
    // only ever need at most two versions of a tree. We pool the "other" unused
    // node that we're free to reuse. This is lazily created to avoid allocating
    // extra objects for things that are never updated. It also allow us to
    // reclaim the extra memory if needed.
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;

    // We already have an alternate.
    // Reset the effect tag.
    workInProgress.effectTag = NoEffect;

    // The effect list is no longer valid.
    workInProgress.nextEffect = null;
    workInProgress.firstEffect = null;
    workInProgress.lastEffect = null;
  }

  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;

  // These will be overridden during the parent's reconciliation
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  workInProgress.ref = current.ref;

  return workInProgress;
}

