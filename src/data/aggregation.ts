import { Datum, GroupTotals, IAggregator } from 'src/data/data';

class AvgAggregator implements IAggregator {
  private count: number = 0;
  private nonNullCount: number = 0;
  private sum: number = 0;
  constructor(public field: string) {
  }

  accumulate(item: Datum) {
    let val = item[this.field];
    this.count++;
    if (val != null && val !== '' && !isNaN(val)) {
      this.nonNullCount++;
      this.sum += parseFloat(val);
    }
  };

  get result(): number {
    if (this.nonNullCount != 0) {
      return this.sum / this.nonNullCount;
    }
    return null;
  }
}

class MinAggregator implements IAggregator {
  private min: number = -NaN;
  constructor(public field: string) {
  }

  accumulate(item: Datum) {
    let val = item[this.field];
    if (isFinite(val)) {
      if (isNaN(this.min)) this.min = val;
      else this.min = Math.min(this.min, val);
    }
  };

  get result(): number {
    return this.min;
  }
}

class MaxAggregator implements IAggregator {
  private max: number = NaN;
  constructor(public field: string) {
  }

  accumulate(item: Datum) {
    let val = item[this.field];
    if (isFinite(val)) {
      if (isNaN(this.max)) this.max = val;
      else this.max = Math.min(this.max, val);
    }
  };

  get result(): number {
    return this.max;
  }
}

class SumAggregator implements IAggregator {
  private sum: number = 0;
  constructor(public field: string) {
  }

  accumulate(item: Datum) {
    let val = item[this.field];
    if (isFinite(val)) {
      this.sum += val;
    }
  };

  get result(): number {
    return this.sum;
  }
}
