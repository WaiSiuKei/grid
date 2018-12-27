import { Datum, IDataSource } from 'src/grid/grid';

export class GridModel {
  items: Datum[];

  constructor(ds: IDataSource) {

    this.items = ds.map((i, idx) => ({ ...i, _gridId: idx }));
  }
}
