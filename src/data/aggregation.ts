import { Datum, GroupTotals, IAggregator } from 'src/data/data';

export class AvgAggregator implements IAggregator {
  public type = 'avg';
  constructor(public field: string) {
  }

  accumulate(items: Datum[]): number {
    let count = 0;
    let nonNullCount = 0;
    let sum = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];

      let val = item[this.field];
      count++;
      if (val != null && val !== '' && !isNaN(val)) {
        nonNullCount++;
        sum += parseFloat(val);
      }
    }

    if (nonNullCount != 0) {
      return sum / nonNullCount;
    }
    return NaN;
  };
}

export class MinAggregator implements IAggregator {
  public type = 'max';

  constructor(public field: string) {
  }

  accumulate(items: Datum[]) {
    let min = NaN;
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];
      let val = item[this.field];
      if (isFinite(val)) {
        if (isNaN(min)) min = val;
        else min = Math.min(min, val);
      }
    }
    return min;
  };
}

export class MaxAggregator implements IAggregator {
  public type = 'max';

  constructor(public field: string) {
  }

  accumulate(items: Datum[]) {
    let max = NaN;
    for (let i = 0, len = items.length; i < len; i++) {
      let item = items[i];
      let val = item[this.field];
      if (isFinite(val)) {
        if (isNaN(max)) max = val;
        else max = Math.max(max, val);
      }
    }
    return max;
  };
}

export class SumAggregator implements IAggregator {
  public type = 'sum';

  constructor(public field: string) {
  }

  accumulate(items: Datum[]) {
    let sum = 0;
    for (let i = 0, len = items.length; i < len; i++) {
      let val = items[i][this.field];
      if (isFinite(val)) {
        sum += val;
      }
    }
    return sum;
  };
}

export class CountAggregator implements IAggregator {
  public type = 'count';

  constructor(public field: string) {
  }

  accumulate(item: Datum[]): number {
    return item.length;
  };
}
