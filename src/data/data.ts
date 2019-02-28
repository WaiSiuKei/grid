import { IGridColumnDefinition } from 'src/grid/grid';
import { React } from 'src/rax';

export interface Datum {
  [key: string]: any
}

export interface IDataView {
  length: number
  getItem(idx: number): Datum
  collapseGroup(group: Group): void
  expandGroup(group: Group): void
  scheduleUpdate(): void
}

export type IDataSet = Datum[] | IDataView

export function defaultGroupFormatter(group: Group, setting: GroupingSetting): any {
  return function () {
    return React.createElement('div', null, (group.key.toString()).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  };
}

function defaultGroupTotalFormatter(key: string, value: any, totals: GroupTotals, setting: GroupingSetting): any {
  return function () {

    return React.createElement('div', null, `totals: ${value}`);
  };
}

export interface Formatter<D, C> {
  (group: D, setting: C): Function
}

export interface DataAccessor {
  (d: Datum): any
}

export interface IAggregator {
  accumulate(item: Datum): void
  result: number
}

interface Grouping<T> {
  accessor: T
  comparer: (a: any, b: any) => number,
  formatter: Formatter<Group, GroupingSetting>
  aggregators: IAggregator[]
}

export interface InternalGroupingSetting extends Grouping<DataAccessor> {
  level: number
  displayTotalsRow: boolean
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

export interface IAggregation {
  type: string
  field: string
  value: number
}

export class GroupTotals implements Datum {
  key: string;
  value: any;
  aggregations: IAggregation[] = [];

  constructor(private group: Group) {
  }

  get rows() {
    return this.group.rows;
  }

  store(type: string, field: string, value: number) {
    this.aggregations.push({
      type,
      field,
      value
    });
  }
}

export class Group {
  level: number;
  rows: Datum[] = [];
  _collapsed: boolean = false;
  totals: GroupTotals;
  subGroups: Group[];
  key: any; // any used as the key of a Map
  $$hash: string;

  constructor(private ds: IDataView) {
  }

  get collapsed() {
    return this._collapsed;
  }

  set collapsed(val: boolean) {
    this._collapsed = val;
    if (val) {
      this.ds.collapseGroup(this);
    } else {
      this.ds.expandGroup(this);
    }
  }
}

export type Row = Datum | Group | GroupTotals
