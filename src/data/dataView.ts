import { Event, Emitter } from 'src/base/common/event';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { Datum, IDataView } from 'src/data/data';
import { isArray, isUndefinedOrNull } from 'src/base/common/types';
import { deepClone } from 'src/base/common/objects';
import { hash } from 'src/base/common/hash';
import { getPatch, PatchChange, PatchItem } from 'src/base/common/patch';

export type RowsPatch = PatchItem<Datum>[]

function defaultHashAlgo(prev: Datum): string {
  return JSON.stringify(prev);
}

export interface DatumComparer {
  (prev: Datum, next: Datum): boolean
}

export interface IDataViewOptions {
  hasher(d: Datum): string
  fullUpdateThreshold: number
}

export const DEFAULTS: Partial<IDataViewOptions> = {
  fullUpdateThreshold: 1000,
  hasher: defaultHashAlgo
};

export class DataView implements IDataView, IDisposable {
  private options: IDataViewOptions;

  private suspend: boolean = false;

  private hashes: number[] = [];

  // 原始数据
  private items: Datum[] = [];
  private memorizedItems: Datum[] = [];
  // 给Grid显示的数据，包括grouped rows / aggregated rows

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

  public getItems(): Datum[] {
    return this.items.slice();
  }

  public setItems(data: Datum[]) {
    if (!isArray(data)) {
      throw new Error('Expect an array');
    }
    this.memorizedItems = this.items;
    this.items = data.slice();
    this.refresh();
  }

  public push(...data: Datum[]) {
    if (!this.suspend) {
      this.memorizedItems = this.items.slice();
      this.items.push(...data);
      this.refresh();
    } else {
      this.items.push(...data);
    }
  }

  public pop() {
    if (!this.suspend) {
      this.memorizedItems = this.items.slice();
      this.items.pop();
      this.refresh();
    } else {
      this.items.pop();
    }
  }

  public unshift(...data: Datum[]) {
    if (!this.suspend) {
      this.memorizedItems = this.items.slice();
      this.items.unshift(...data);
      this.refresh();
    } else {
      this.items.unshift(...data);
    }

  }

  public shift() {
    if (!this.suspend) {
      this.memorizedItems = this.items.slice();
      this.items.shift();
      this.refresh();
    } else {
      this.items.shift();
    }
  }

  public splice(start: number, deleteCount: number, ...items: Datum[]) {
    if (!this.suspend) {
      this.memorizedItems = this.items.slice();
      this.items.splice(start, deleteCount, ...items);
      this.refresh();
    } else {
      this.items.splice(start, deleteCount, ...items);
    }
  }

  public beginUpdate() {
    this.suspend = true;
    this.memorizedItems = this.items.slice();
  }

  public endUpdate() {
    this.suspend = false;
    this.refresh();
  }

  private calulateDiff(prev: Datum[], next: Datum[]): RowsPatch {
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

    let newHashed = next.map(d => hash(d));
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

  private refresh() {
    if (this.suspend) {
      return;
    }

    let patch = this.calulateDiff(this.memorizedItems, this.items);
    this._onRowsChanged.fire(patch);
  }

  dispose() {
    dispose(this.toDispose);
    this.toDispose.length = 0;
    this.memorizedItems.length = 0;
    this.items.length = 0;
    this.hashes.length = 0;
  }
}
