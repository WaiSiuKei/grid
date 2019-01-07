import { createHostRootFiber, Fiber } from 'src/react/ReactFiber';

export interface FiberRoot {
  // The currently active root fiber. This is the mutable root of the tree.
  containerInfo: any,
  current: Fiber,
  context: Object | null,
  didError: boolean
  finishedWork: Fiber | null,
}

export function createFiberRoot(containerInfo: any,): FiberRoot {
  // Cyclic construction. This cheats the type system right now because
  // stateNode is any.
  const uninitializedFiber = createHostRootFiber();
  return {
    containerInfo,
    current: uninitializedFiber,
    context: null,

    didError: false,
    finishedWork: null
  };
}
