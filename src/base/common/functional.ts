export function once<T extends Function>(this: any, fn: T): T {
  const _this = this;
  let didCall = false;
  let result: any;

  return function () {
    if (didCall) {
      return result;
    }

    didCall = true;
    result = fn.apply(_this, arguments);

    return result;
  } as any as T;
}

export function sumBy<P extends {}>(arr: P[], key: string): number {
  return arr.reduce((acc, item) => {
    return acc + item[key];
  }, 0);
}

export function sum(arr: number[]): number {
  return arr.reduce((acc, item) => {
    return acc + item;
  }, 0);
}

export function mapBy<P extends {}, S>(arr: P[], key: string): S[] {
  return arr.map(i => i[key]);
}

export function find<T>(from: Array<T>, predicate: (val: T) => boolean): T {
  for (let i = 0, len = from.length; i < len; i++) {
    let v = from[i];
    if (predicate(v)) return v;
  }
  return void 0;
}

export function indexOf<T>(from: Array<T>, predicate: (val: T) => boolean): number {
  for (let i = 0, len = from.length; i < len; i++) {
    let v = from[i];
    if (predicate(v)) return i;
  }
  return -1;
}
