export interface Datum {
  [key: string]: any
}

export interface IDataView {
  length: number
  getItem(idx: number): Datum
}

export type IDataSet = Datum[] | IDataView
