import { Datum, IDataSet } from 'src/data/data';
import { DataView } from 'src/data/dataView';
import { isArray } from 'src/base/common/types';

export class GridModel {
  items: Datum[] = [];
  ds: DataView;

  constructor(ds: IDataSet) {
    if (ds instanceof DataView) {
      this.ds = ds;
    } else if (isArray(ds)) {
      this.items = ds.slice() as Datum[];
    } else {
      throw new Error('Unsupport ds type');
    }
  }

  get length(): number {
    return this.ds ? this.ds.length : this.items.length;
  }

  get(idx: number): Datum {
    return this.ds ? this.ds.getItem(idx) : this.items[idx];
  }
}
