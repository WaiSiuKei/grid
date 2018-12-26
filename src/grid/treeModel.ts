import { Datum, IDataSource } from 'src/grid/tree';

export class Item {
  public id: string;
  public data: Datum;

  constructor(id: string, data: Datum) {
    this.id = id;
    this.data = data;
  }
}

export class TreeModel {
  items: Item[];

  constructor(ds: IDataSource) {

    this.items = ds.items.map((i, idx) => new Item(idx.toString(), i));
  }
}
