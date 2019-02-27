import { IGridColumnDefinition } from 'src/grid/grid';
import { React } from 'src/rax';

export interface Datum {
  [key: string]: any
}

export interface IDataView {
  length: number
  getItem(idx: number): Datum
  scheduleUpdate(): void
}

export enum DataViewRowsChangeReason {
  Add = 'add',
  Remove = 'remove'
}

export type IDataSet = Datum[] | IDataView

export function defaultGroupFormatter(group: Group, setting: GroupingSetting): any {
  return function () {
    return React.createElement('div', null, (group.key.toString()).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  };
}

// function defaultGroupTotalFormatter(value: any, rows: Datum[]): any {
//   return function () {
//
//     return React.createElement('div', null, (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
//   };
// }

export interface Formatter<D, C> {
  (group: D, setting: C): Function
}

export interface DataAccessor {
  (d: Datum): any
}

interface Grouping<T> {
  accessor: T
  comparer: (a: any, b: any) => number,
  formatter: Formatter<Group, GroupingSetting>
  displayTotalsRow: boolean
}

export interface InternalGroupingSetting extends Grouping<DataAccessor> {
  level: number
}

export type GroupingSetting = Grouping<string | DataAccessor>

// var groupingInfoDefaults = {
//   getter: null,
//   formatter: null,
//   comparer: function(a, b) {
//     return (a.value === b.value ? 0 :
//         (a.value > b.value ? 1 : -1)
//     );
//   },
//   predefinedValues: [],
//   aggregators: [],
//   aggregateEmpty: false,
//   aggregateCollapsed: false,
//   aggregateChildGroups: false,
//   collapsed: false,
//   displayTotalsRow: true,
//   lazyTotalsCalculation: false
// };

export enum SortingDirection {
  Asc,
  Desc,
}

export interface SortingSetting {
  accessor: string | DataAccessor
  comparer: (a: any, b: any) => number,
  direction: SortingDirection
  priority: number
}

export class NonDataItem {

}

export class GroupTotals extends NonDataItem {
  parent: Group;
}

export class Group extends NonDataItem {
  level: number;
  rows: Datum[] = [];
  _collapsed: boolean = false;
  totals: GroupTotals;
  subGroups: Group[];
  key: any;
  $$hash: string;

  constructor(private ds: IDataView) {
    super();
  }

  get collapsed() {
    return this._collapsed;
  }

  set collapsed(val: boolean) {
    this._collapsed = val;
    this.ds.scheduleUpdate();
  }
}

export type Row = Datum | Group | GroupTotals
