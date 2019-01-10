import { Event, Emitter } from 'src/base/common/event';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { Datum, IDataView } from 'src/data/data';
import { isArray } from 'src/base/common/types';
import { deepClone } from 'src/base/common/objects';
import { hash } from 'src/base/common/hash';
import { getPatch, PatchItem } from 'src/base/common/patch';

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

  getItem(idx: number): Datum {
    return this.items[idx];
  }

  setItems(data: Datum[], all = false) {
    if (!isArray(data)) {
      throw new Error('Expect an array');
    }
    this.memorizedItems = this.items;
    this.items = data.map(d => deepClone(d));
    this.refresh();
  }

  private calulateDiff(prev: Datum[], next: Datum[]): RowsPatch {
    let rowPatch: RowsPatch = [];

    if (prev.length > this.options.fullUpdateThreshold || next.length > this.options.fullUpdateThreshold) {
      this.hashes.length = 0;
      if (prev.length) {
        rowPatch.push({
          type: 'remove',
          oldPos: 0,
          newPos: 0,
          items: prev
        });
      }
      if (next.length) {
        rowPatch.push({
          type: 'add',
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
      if (p.type === 'add') {
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
  }
}
