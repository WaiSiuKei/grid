export interface Datum {
  [key: string]: any
}

export interface IDataView {
  length: number
  getItem(idx: number): Datum
}

export enum DataViewRowsChangeReason {
  Add = 'add',
  Remove = 'remove'
}

export type IDataSet = Datum[] | IDataView
