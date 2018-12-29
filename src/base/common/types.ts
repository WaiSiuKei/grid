/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export enum Typeof {
  number = 'number',
  string = 'string',
  undefined = 'undefined',
  object = 'object',
  function = 'function',
  null = 'null',
  class = 'class'
}

export function isArray(array: any): array is any[] {
  if (Array.isArray) {
    return Array.isArray(array);
  }

  if (array && typeof (array.length) === Typeof.number && array.constructor === Array) {
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
  return typeof obj === Typeof.object
    && obj !== null
    && !Array.isArray(obj)
    && !(obj instanceof RegExp)
    && !(obj instanceof Date);
}

/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export function isNumber(obj: any): obj is number {
  if ((typeof (obj) === Typeof.number || obj instanceof Number) && !isNaN(obj)) {
    return true;
  }

  return false;
}
