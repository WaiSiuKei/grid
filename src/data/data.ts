import { React } from '../rax';

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

export function defaultGroupTotalFormatter(key: string, value: any, type: string): any {
  return function () {
    return React.createElement('div', null, `${type}: ${value}`);
  };
}

export interface Formatter<D, C> {
  (group: D, setting: C): Function
}

export interface DataAccessor {
  (d: Datum): any
}

export interface IAggregator {
  type: string
  field: string
  accumulate(item: Datum): number
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

export interface SortingSetting {
  accessor: string | DataAccessor
  comparer: (a: any, b: any) => number,
}

export interface IAggregation {
  type: string
  field: string
  value: number
}

export class GroupTotals {
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

  getByField(field: string): IAggregation {
    return this.aggregations.find(a => a.field === field);
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

export interface IFilter {
  (d: Datum): boolean
}
