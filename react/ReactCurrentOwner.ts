import { ReactElement } from 'src/react/def';
import { DispatcherWithoutHooks } from 'src/react/ReactFiberDispatcher';

const currentDispatcher = DispatcherWithoutHooks;
const current: ReactElement<any> = null;
export const ReactCurrentOwner = {
  current,
  currentDispatcher
};
