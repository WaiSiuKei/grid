import { Event, Emitter } from 'src/base/common/event';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { DataAccessor, Datum, defaultGroupFormatter, Group, GroupingSetting, GroupTotals, IAggregator, IDataView, InternalGroupingSetting, Row, SortingDirection, SortingSetting } from 'src/data/data';
import { isArray, isFunction, isUndefinedOrNull } from 'src/base/common/types';
import { hash } from 'src/base/common/hash';
import { getPatch, PatchChange, PatchItem } from 'src/base/common/patch';

export type RowsPatch = PatchItem<Row>[]

function defaultHashAlgo(prev: Datum): string {
  return JSON.stringify(prev);
}

export interface IDataViewOptions {
  hasher(d: Datum): string
  key: string
  fullUpdateThreshold: number
}

export const DEFAULTS: Partial<IDataViewOptions> = {
  fullUpdateThreshold: 1000,
  hasher: defaultHashAlgo
};

function functor(acc: string | Function) {
  return isFunction(acc) ? acc : (d: any) => d[acc as string];
}

export class DataView implements IDataView, IDisposable {
  private options: IDataViewOptions;

  private suspend: boolean = false;

  private hashes: number[] = [];

  // 原始数据
  private items: Datum[] = [];

  // 给Grid显示的数据，包括grouped rows / aggregated rows
  private rows: Datum[] = [];
  private memorizedRows: Datum[] = [];

  private collapsedGroups: string[] = [];

  private groupingSettings: InternalGroupingSetting[];
  private sortingSettings: SortingSetting[];
  private filteringSettings: any;

  private _onRowsChanged = new Emitter<RowsPatch>();
  public get onRowsChanged() { return this._onRowsChanged.event; }

  private toDispose: IDisposable[] = [];
  constructor(options: Partial<IDataViewOptions> = {}) {
    this.options = { ...options, ...DEFAULTS } as IDataViewOptions;
    this.toDispose.push(this._onRowsChanged);
  }

  public get length(): number {
    return this.items.length;
  }

  public getItem(idx: number): Datum {
    return this.items[idx];
  }

  public getRow(idx: number): Row {
    return this.rows[idx];
  }

  public getItems(): Datum[] {
    return this.items.slice();
  }

  public setItems(data: Datum[]) {
    if (!isArray(data)) {
      throw new Error('Expect an array');
    }
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items = data.slice();
      this.refresh();
    } else {
      this.items = data.slice();
    }
  }

  public push(...data: Datum[]) {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items.push(...data);
      this.refresh();
    } else {
      this.items.push(...data);
    }
  }

  public pop() {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items.pop();
      this.refresh();
    } else {
      this.items.pop();
    }
  }

  public unshift(...data: Datum[]) {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items.unshift(...data);
      this.refresh();
    } else {
      this.items.unshift(...data);
    }

  }

  public shift() {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items.shift();
      this.refresh();
    } else {
      this.items.shift();
    }
  }

  public splice(start: number, deleteCount: number, ...items: Datum[]) {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items.splice(start, deleteCount, ...items);
      this.refresh();
    } else {
      this.items.splice(start, deleteCount, ...items);
    }
  }

  public sort(compareFunction: (a: Datum, b: Datum) => number): Datum[] {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      let ret = this.items.sort(compareFunction);
      this.refresh();
      return ret;
    } else {
      return this.items.sort(compareFunction);
    }
  }

  public reverse() {
    if (!this.suspend) {
      this.memorizedRows = this.rows.slice();
      this.items.reverse();
      this.refresh();
    } else {
      this.items.reverse();
    }
  }

  public setGrouping(gps: Array<Partial<GroupingSetting>> | null) {
    this.groupingSettings = [];
    this.collapsedGroups.length = 0;
    if (isArray(gps) && gps.length) {
      this.groupingSettings = gps.map((gp, i) => {
        let g: InternalGroupingSetting = Object.create(null);
        g.accessor = functor(gp.accessor) as DataAccessor;
        g.formatter = gp.formatter || defaultGroupFormatter;
        g.comparer = gp.comparer;
        g.level = i;
        g.aggregators = gp.aggregators || [];
        return g;
      });
    }
    this.scheduleUpdate();
  }

  public getGrouping(level: number): InternalGroupingSetting {
    if (isUndefinedOrNull(level)) return null;
    return this.groupingSettings[level];
  }

  public getGroupings(): InternalGroupingSetting[] {
    return this.groupingSettings.slice();
  }

  public beginUpdate() {
    this.suspend = true;
    this.memorizedRows = this.rows.slice();
  }

  public endUpdate() {
    this.suspend = false;
    this.refresh();
  }

  public collapseGroup(group: Group) {
    let h = group['$$hash'];
    let prevOne = this.collapsedGroups.indexOf(h);
    if (prevOne === -1) {
      this.collapsedGroups.push(h);
      this.scheduleUpdate();
    }
  }

  public expandGroup(group: Group) {
    let h = group['$$hash'];
    let prevOne = this.collapsedGroups.indexOf(h);
    if (prevOne !== -1) {
      this.collapsedGroups.splice(prevOne, 1);
      this.scheduleUpdate();
    }
  }

  private prevFrame: number;
  public scheduleUpdate() {
    if (this.prevFrame && cancelAnimationFrame) cancelAnimationFrame(this.prevFrame);
    this.prevFrame = requestAnimationFrame(() => this.refresh());
  }

  private calulateDiff(prev: Row[], next: Row[]): RowsPatch {
    let rowPatch: RowsPatch = [];

    if (prev.length > this.options.fullUpdateThreshold || next.length > this.options.fullUpdateThreshold) {
      this.hashes.length = 0;
      if (prev.length) {
        rowPatch.push({
          type: PatchChange.Remove,
          oldPos: 0,
          newPos: 0,
          items: prev
        });
      }
      if (next.length) {
        rowPatch.push({
          type: PatchChange.Add,
          oldPos: prev.length,
          newPos: 0,
          items: next
        });
      }

      return rowPatch;
    }

    let newHashed = next.map(d => isUndefinedOrNull(d['$$hash']) ? this.options.key ? d[this.options.key] : hash(d) : d['$$hash']);
    let patch = getPatch(this.hashes, newHashed);

    rowPatch = patch.map((p: PatchItem<number>) => {
      if (p.type === PatchChange.Remove) {
        return {
          ...p,
          items: p.items.map(i => prev[this.hashes.indexOf(i)])
        };
      } else {
        return {
          ...p,
          items: p.items.map(i => next[newHashed.indexOf(i)])
        };
      }
    });

    this.hashes = newHashed;
    return rowPatch;
  }

  private extractGroups(rows: Datum[], groupingSetting?: InternalGroupingSetting): Group[] {
    if (!groupingSetting) {
      if (!this.groupingSettings.length) return [];
      return this.extractGroups(rows, this.groupingSettings[0]);
    }

    let groupsByVal = new Map<any, Group>();
    let groups: Group[] = [];
    let level = groupingSetting.level;

    for (let i = 0, len = rows.length; i < len; i++) {
      let row = rows[i];
      let val = groupingSetting.accessor(row);

      let group = groupsByVal.get(val);
      if (!group) {
        let h = `?grouping='${hash(val)}&level=${level}`;
        let prevOne = this.collapsedGroups.indexOf(h) > -1;

        group = new Group(this);
        group['$$hash'] = h;
        group.key = val;
        group.level = level;
        group._collapsed = prevOne;
        groupsByVal.set(val, group);
        groups.push(group);
      }

      group.rows.push(row);
    }

    if (groupingSetting.level < this.groupingSettings.length - 1) {
      let settingOfSubGroup = this.groupingSettings[groupingSetting.level + 1];
      for (let i = 0; i < groups.length; i++) {
        let group = groups[i];
        group.subGroups = this.extractGroups(group.rows, settingOfSubGroup);
      }
    }

    groups.sort((a, b) => groupingSetting.comparer(a.key, b.key));

    return groups;
  }

  private flattenGroupedRows(groups: Group[], level: number = 0) {
    let groupedRows: Row[] = [];
    for (let i = 0, l = groups.length; i < l; i++) {
      let group = groups[i];
      groupedRows.push(group);

      if (!group.collapsed) {
        let rows = group.subGroups ? this.flattenGroupedRows(group.subGroups, level + 1) : group.rows;
        groupedRows.push(...rows);
      }

      if (group.totals && (!group.collapsed)) {
        groupedRows.push(group.totals);
      }
    }
    return groupedRows;
  }

  private calulateRows(items: Datum[]): Row[] {
    if (isArray(this.groupingSettings) && this.groupingSettings.length) {
      let groups: Group[] = this.extractGroups(items);
      let groupHashed = new Set();
      for (let i = 0, len = groups.length; i < len; i++) {
        let group = groups[i];
        let h = group['$$hash'];
        if (!group.collapsed) {
          this.doAggregation(group);
        }
        groupHashed.add(h);
      }
      this.collapsedGroups = this.collapsedGroups.filter(h => groupHashed.has(h));

      if (groups.length) {
        return this.flattenGroupedRows(groups);
      }
    }

    return items;
  }

  private doAggregation(group: Group) {
    // TODO: aggregateChildGroups

    let totals = new GroupTotals(group);
    totals['$$hash'] = `${group}&total=true`;
    group.totals = totals;

    let conf = this.groupingSettings[group.level];
    for (let i = 0, len = conf.aggregators.length; i < len; i++) {
      let agg = conf.aggregators[i];
      totals.store(agg.type, agg.field, agg.accumulate(group.rows));
    }
  }

  public refresh() {
    if (this.suspend) {
      return;
    }

    this.rows = this.calulateRows(this.items);
    let patch = this.calulateDiff(this.memorizedRows, this.rows);
    console.log('patch', patch);
    if (patch.length) {
      this._onRowsChanged.fire(patch);
    }
  }

  dispose() {
    dispose(this.toDispose);
    this.toDispose.length = 0;
    this.memorizedRows.length = 0;
    this.items.length = 0;
    this.hashes.length = 0;
    this.groupingSettings.length = 0;
    this.sortingSettings.length = 0;
  }
}
