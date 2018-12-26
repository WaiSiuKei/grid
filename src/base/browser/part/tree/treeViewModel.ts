/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Item } from './treeModel';
import { ArrayIterator, INextIterator } from 'src/base/common/iterator';

export interface IViewItem {
  model: Item;
  top: number;
  height: number;
  width: number;
}

export class HeightMap {

  private heightMap: IViewItem[];
  private indexes: { [item: string]: number; };

  constructor() {
    this.heightMap = [];
    this.indexes = {};
  }

  public getContentHeight(): number {
    var last = this.heightMap[this.heightMap.length - 1];
    return !last ? 0 : last.top + last.height;
  }

  public onRefreshItemSet(items: Item[]): void {
    var sortedItems = items.sort((a, b) => this.indexes[a.id] - this.indexes[b.id]);
    this.onRefreshItems(new ArrayIterator(sortedItems));
  }

  // Ordered, but not necessarily contiguous items
  public onRefreshItems(iterator: INextIterator<Item>): void {
    var item: Item;
    var viewItem: IViewItem;
    var newHeight: number;
    var i: number, j: number | null = null;
    var cummDiff = 0;

    while (item = iterator.next()) {
      i = this.indexes[item.id];

      for (; cummDiff !== 0 && j !== null && j < i; j++) {
        viewItem = this.heightMap[j];
        viewItem.top += cummDiff;
        this.onRefreshItem(viewItem);
      }

      viewItem = this.heightMap[i];
      newHeight = item.getHeight();
      viewItem.top += cummDiff;
      cummDiff += newHeight - viewItem.height;
      viewItem.height = newHeight;
      this.onRefreshItem(viewItem, true);

      j = i + 1;
    }

    if (cummDiff !== 0 && j !== null) {
      for (; j < this.heightMap.length; j++) {
        viewItem = this.heightMap[j];
        viewItem.top += cummDiff;
        this.onRefreshItem(viewItem);
      }
    }
  }

  public onRefreshItem(item: IViewItem, needsRender: boolean = false): void {
    // noop
  }

  public itemsCount(): number {
    return this.heightMap.length;
  }

  public itemAt(position: number): string {
    return this.heightMap[this.indexAt(position)].model.id;
  }


  public indexAt(position: number): number {
    var left = 0;
    var right = this.heightMap.length;
    var center: number;
    var item: IViewItem;

    // Binary search
    while (left < right) {
      center = Math.floor((left + right) / 2);
      item = this.heightMap[center];

      if (position < item.top) {
        right = center;
      } else if (position >= item.top + item.height) {
        if (left === center) {
          break;
        }
        left = center;
      } else {
        return center;
      }
    }

    return this.heightMap.length;
  }

  public indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.heightMap.length);
  }

  public itemAtIndex(index: number): IViewItem {
    return this.heightMap[index];
  }

  public itemAfter(item: IViewItem): IViewItem {
    return this.heightMap[this.indexes[item.model.id] + 1] || null;
  }

  protected createViewItem(item: Item): IViewItem {
    throw new Error('not implemented');
  }

  public dispose(): void {
    this.heightMap = null;
    this.indexes = null;
  }
}
