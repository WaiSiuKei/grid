import { Datum, IDataSource } from 'src/grid/grid';

export class Item {
  public id: string;
  public data: Datum;

  constructor(id: string, data: Datum) {
    this.id = id;
    this.data = data;
  }
}

export class GridModel {
  items: Item[];

  constructor(ds: IDataSource) {

    this.items = ds.map((i, idx) => new Item(idx.toString(), i));
  }
}
