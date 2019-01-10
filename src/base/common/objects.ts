import { isArray, isObject } from 'src/base/common/types';

/**
 * Copies all properties of source into destination. The optional parameter "overwrite" allows to control
 * if existing properties on the destination should be overwritten or not. Defaults to true (overwrite).
 */
export function mixin(destination: any, source: any, overwrite: boolean = true): any {
  if (!isObject(destination)) {
    return source;
  }

  if (isObject(source)) {
    Object.keys(source).forEach(key => {
      if (key in destination) {
        if (overwrite) {
          if (isObject(destination[key]) && isObject(source[key])) {
            mixin(destination[key], source[key], overwrite);
          } else {
            destination[key] = source[key];
          }
        }
      } else {
        destination[key] = source[key];
      }
    });
  }
  return destination;
}

export function deepClone<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof RegExp) {
    // See https://github.com/Microsoft/TypeScript/issues/10990
    return obj as any;
  }
  const result: any = isArray(obj) ? [] : {};
  Object.keys(obj).forEach((key: string) => {
    if (obj[key] && typeof obj[key] === 'object') {
      result[key] = deepClone(obj[key]);
    } else {
      result[key] = obj[key];
    }
  });
  return result;
}
