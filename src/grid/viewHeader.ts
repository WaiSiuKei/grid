import { Datum, IGridColumnDefinition } from 'src/grid/grid';
import { IDisposable } from 'src/base/common/lifecycle';
import { addClass } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';

export class ViewHeaderCell implements IDisposable {
  public width: number;
  public left: number;
  public right: number;

  private domNode: HTMLElement;
  private host: HTMLElement;
  constructor(container: HTMLElement, cell: number, col: IGridColumnDefinition, left: number) {
    this.host = container;

    let el = document.createElement('div');
    el.className = 'nila-grid-cell';
    el.innerText = col.name;
    this.width = col.width || 80;
    el.style.width = `${this.width}px`;
    el.style.left = left + 'px';
    this.left = left;
    this.right = this.left + this.width;
    this.domNode = el;
  }

  mount() {
    this.host.appendChild(this.domNode);
  }

  unmount() {
    this.host.removeChild(this.domNode);
  }

  dispose() {
    this.domNode.remove();
  }
}

export class ViewHeaderRow implements IDisposable {
  cells: ViewHeaderCell[] = [];
  domNode: HTMLElement;

  host: HTMLElement;

  private lastRenderLeft: number = 0;
  private lastRenderWidth: number = 0;

  constructor(columnDefinations: IGridColumnDefinition[]) {
    let container = document.createElement('div');
    addClass(container, 'nila-grid-header');
    this.domNode = container;

    let left = 0;
    for (let i = 0, len = columnDefinations.length; i < len; i++) {
      let col = columnDefinations[i];
      let c = new ViewHeaderCell(container, i, col, left);
      this.cells.push(c);
      left += c.width;
    }
  }

  // mount() {
  //   this.host.appendChild(this.domNode);
  // }

  render(scrollLeft: number, viewWidth: number): CellToModify {
    // console.log(scrollLeft, viewWidth);
    // this.cells.forEach(c => c.mount());

    let i: number;
    let stop: number;

    let renderLeft = scrollLeft;
    let renderRight = scrollLeft + viewWidth;
    let thisRenderRight = this.lastRenderLeft + this.lastRenderWidth;

    let toInsert: number[] = [];
    let toRemove: number[] = [];

    // when view scrolls down, start rendering from the renderBottom
    for (i = this.indexAfter(renderRight) - 1, stop = this.indexAt(Math.max(thisRenderRight, renderLeft)); i >= stop; i--) {
      // this.insertItemInDOM(i);
      toInsert.push(i);
    }

    // when view scrolls up, start rendering from either this.renderTop or renderBottom
    for (i = Math.min(this.indexAt(this.lastRenderLeft), this.indexAfter(renderRight)) - 1, stop = this.indexAt(renderLeft); i >= stop; i--) {
      // this.insertItemInDOM(i);
      toInsert.push(i);
    }

    // when view scrolls down, start unrendering from renderTop
    for (i = this.indexAt(this.lastRenderLeft), stop = Math.min(this.indexAt(renderLeft), this.indexAfter(thisRenderRight)); i < stop; i++) {
      // this.removeItemFromDOM(i);
      toRemove.push(i);
    }

    // when view scrolls up, start unrendering from either renderBottom this.renderTop
    for (i = Math.max(this.indexAfter(renderRight), this.indexAt(this.lastRenderLeft)), stop = this.indexAfter(thisRenderRight); i < stop; i++) {
      // this.removeItemFromDOM(i);
      toRemove.push(i);
    }

    let leftItem = this.indexAt(renderLeft);

    let c = this.cells[leftItem];
    let t = (c.left - renderLeft);

    let margin = clamp(t, c.width, -c.width);
    this.domNode.style.top = margin + 'px';

    this.lastRenderLeft = renderLeft;
    this.lastRenderWidth = renderRight - renderLeft;

    return {
      toInsert,
      toRemove,
      margin
    };
  }

  public indexAt(position: number): number {
    let left = 0;
    let right = this.cells.length - 1;
    let center: number;

    // Binary search
    while (left < right) {
      center = Math.floor((left + right) / 2);

      let leftPosition = this.cells[center].left;
      if (position < leftPosition) {
        right = center;
      } else if (position >= this.cells[center].right) {
        if (left === center) {
          break;
        }
        left = center;
      } else {
        return center;
      }
    }

    return this.cells.length - 1;
  }

  public indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.cells.length);
  }

  dispose() {
    this.domNode.remove();
  }
}

export interface CellToModify {
  toInsert: number[]
  toRemove: number[]
  margin: number
}
