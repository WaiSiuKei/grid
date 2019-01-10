/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export enum BuintinType {
  number = 'number',
  string = 'string',
  undefined = 'undefined',
  object = 'object',
  function = 'function',
  null = 'null',
  class = 'class',
  boolean = 'boolean',
  symbol = 'symbol',
  array = 'array'
}

export function isArray(array: any): array is any[] {
  if (Array.isArray) {
    return Array.isArray(array);
  }

  if (array && typeof (array.length) === BuintinType.number && array.constructor === Array) {
    return true;
  }

  return false;
}

/**
 *
 * @returns whether the provided parameter is of type `object` but **not**
 *  `null`, an `array`, a `regexp`, nor a `date`.
 */
export function isObject(obj: any): boolean {
  // The method can't do a type cast since there are type (like strings) which
  // are subclasses of any put not positvely matched by the function. Hence type
  // narrowing results in wrong results.
  return typeof obj === BuintinType.object
    && obj !== null
    && !Array.isArray(obj)
    && !(obj instanceof RegExp)
    && !(obj instanceof Date);
}

export function isString(str: any): str is string {
  if (typeof (str) === BuintinType.string || str instanceof String) {
    return true;
  }

  return false;
}

/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export function isNumber(obj: any): obj is number {
  if ((typeof (obj) === BuintinType.number || obj instanceof Number) && !isNaN(obj)) {
    return true;
  }

  return false;
}

export function isFunction(obj: any): obj is Function {
  return typeof obj === BuintinType.function;
}

export function isUndefinedOrNull(obj: any): obj is undefined | null {
  return obj === void 0 || obj === null;
}

export function isClass(v: any): boolean {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

let __type = Object.prototype.toString;

let numberMap = {
  //null undefined IE6-8这里会返回[object Object]
  '[object Boolean]': BuintinType.boolean,
  '[object Number]': BuintinType.number,
  '[object String]': BuintinType.string,
  '[object Function]': BuintinType.function,
  '[object Symbol]': BuintinType.symbol,
  '[object Array]': BuintinType.array,
};

export function typeOf(obj: any): BuintinType {
  if (obj === null) {
    return BuintinType.null;
  }
  if (obj === void 666) {
    return BuintinType.undefined;
  }
  return numberMap[__type.call(obj)] || BuintinType.object;
}
