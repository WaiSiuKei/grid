import { Fiber } from 'src/react/ReactFiber';
import { HostComponent, HostRoot } from 'src/react/ReactWorkTags';
import { DidCapture, ShouldCapture } from 'src/react/ReactSideEffectTags';

export function unwindWork(
  workInProgress: Fiber,
) {
  switch (workInProgress.tag) {
    case HostRoot: {
      popHostContainer(workInProgress);
      const effectTag = workInProgress.effectTag;

      workInProgress.effectTag = (effectTag & ~ShouldCapture) | DidCapture;
      return workInProgress;
    }
    default:
      return null;
  }
}

export function unwindInterruptedWork(interruptedWork: Fiber) {
  switch (interruptedWork.tag) {
    // case ClassComponent: {
    //   const childContextTypes = interruptedWork.type.childContextTypes;
    //   if (childContextTypes !== null && childContextTypes !== undefined) {
    //     popLegacyContext(interruptedWork);
    //   }
    //   break;
    // }
    case HostRoot: {
      popHostContainer(interruptedWork);
      break;
    }
    case HostComponent: {
      break;
    }
    // case HostPortal:
    //   popHostContainer(interruptedWork);
    //   break;
    // case ContextProvider:
    //   popProvider(interruptedWork);
    //   break;
    default:
      break;
  }
}
