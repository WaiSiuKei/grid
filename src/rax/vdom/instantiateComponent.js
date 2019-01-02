import EmptyComponent from './empty';
import FragmentComponent from './fragment';
import NativeComponent from './native';
import CompositeComponent from './composite';
import TextComponent from './text';

function instantiateComponent(element) {
  let instance;

  if (element === undefined || element === null || element === false || element === true) {
    instance = new EmptyComponent();
  } else if (Array.isArray(element)) {
    instance = new FragmentComponent(element);
  } else if (typeof element === 'object' && element.type) {
    // Special case string values
    if (typeof element.type === 'string') {
      instance = new NativeComponent(element);
    } else {
      instance = new CompositeComponent(element);
    }
  } else if (typeof element === 'string' || typeof element === 'number') {
    instance = new TextComponent(element);
  } else {
    throw new Error(`Invalid element type: ${element}. (current: ${typeof element === 'object' && Object.keys(element) || typeof element})`);
  }

  instance._mountIndex = 0;

  return instance;
}

export default instantiateComponent;
