import { IGridColumnDefinition } from 'src/grid/grid';
import { IDisposable } from 'src/base/common/lifecycle';
import { addClass, getContentWidth } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';
import { GridContext } from 'src/grid/girdContext';

export class ViewHeaderCell implements IDisposable {
  public width: number;
  public left: number;
  public right: number;

  private domNode: HTMLElement;
  private host: HTMLElement;

  mounted: boolean = false;
  constructor(container: HTMLElement, cell: number, col: IGridColumnDefinition, left: number) {
    this.host = container;

    let el = document.createElement('div');
    el.className = 'nila-grid-header-cell';
    el.innerText = col.name;
    this.width = col.width;
    el.style.width = `${this.width}px`;
    this.left = left;
    this.right = this.left + this.width;
    this.domNode = el;
  }

  mount(slibing?: ViewHeaderCell) {
    this.mounted = true;
    if (slibing && slibing.mounted) {
      this.host.insertBefore(this.domNode, slibing.domNode);
    } else {
      this.host.appendChild(this.domNode);
    }
  }

  unmount() {
    this.mounted = false;
    this.host.removeChild(this.domNode);
  }

  dispose() {
    this.mounted = false;
    this.domNode.remove();
  }
}

export class ViewHeaderRow implements IDisposable {
  domNode: HTMLElement;

  private cellCache: { [index: number]: ViewHeaderCell } = Object.create(null);

  private lastRenderLeft: number = 0;
  private lastRenderWidth: number = 0;

  constructor(private ctx: GridContext) {
    let container = document.createElement('div');
    addClass(container, 'nila-grid-header');
    this.domNode = container;
    if (!this.ctx.options.showHeaderRow) {
      this.domNode.style.visibility = 'hidden';
      this.domNode.style.display = 'none';
    } else if (this.ctx.options.headerRowHeight) {
      this.domNode.style.height = this.ctx.options.headerRowHeight + 'px';
    }
  }

  render(scrollLeft: number, viewWidth: number): CellToModify {
    if (!viewWidth) {
      return {
        mounted: [],
        margin: 0,
      };
    }

    let i: number;
    let stop: number;

    let renderLeft = scrollLeft;
    let renderRight = scrollLeft + viewWidth;
    let thisRenderRight = this.lastRenderLeft + this.lastRenderWidth;

    // when view scrolls right, start rendering from the renderRight
    for (i = this.indexAfter(renderRight) - 1, stop = this.indexAt(Math.max(thisRenderRight, renderLeft)); i >= stop; i--) {
      this.mountCell(i);
    }

    // when view scrolls left, start rendering from either this.renderLeft or renderright
    for (i = Math.min(this.indexAt(this.lastRenderLeft), this.indexAfter(renderRight)) - 1, stop = this.indexAt(renderLeft); i >= stop; i--) {
      this.mountCell(i);
    }

    // when view scrolls down, start unrendering from renderTop
    for (i = this.indexAt(this.lastRenderLeft), stop = Math.min(this.indexAt(renderLeft), this.indexAfter(thisRenderRight)); i < stop; i++) {
      this.unmountCell(i);
    }

    // when view scrolls up, start unrendering from either renderBottom this.renderTop
    for (i = Math.max(this.indexAfter(renderRight), this.indexAt(this.lastRenderLeft)), stop = this.indexAfter(thisRenderRight); i < stop; i++) {
      this.unmountCell(i);
    }

    let leftItem = this.indexAt(renderLeft);

    let c = this.cellCache[leftItem];
    let t = (c.left - renderLeft);

    let margin = clamp(t, c.width, -c.width);
    this.domNode.style.left = margin + 'px';

    this.lastRenderLeft = renderLeft;
    this.lastRenderWidth = renderRight - renderLeft;

    let mounted = Object.keys(this.cellCache);

    return {
      mounted,
      margin
    };
  }

  public mountTo(container: HTMLElement): void {
    let w = getContentWidth(container);
    container.appendChild(this.domNode);
    this.render(0, w);
  }

  public invalidate(): void {
    Object.keys(this.cellCache).forEach(k => {
      this.unmountCell(k);
    });
    this.cellCache = Object.create(null);
    this.lastRenderWidth = 0;
    this.lastRenderWidth = 0;
  }

  private getItemLeft(index: number): number {
    if (index === 0) return 0;
    let sum = 0;
    for (let i = 0; i < index; i++) {
      sum += this.ctx.columns[i].width;
    }
    return sum;
  }

  private mountCell(index: number): boolean {
    let cell = this.cellCache[index];
    if (!cell) {
      cell = new ViewHeaderCell(this.domNode, index, this.ctx.columns[index], this.getItemLeft(index));
      this.cellCache[index] = cell;
    }
    if (cell.mounted) return false;

    if (this.ctx.options.showHeaderRow) cell.mount(this.cellCache[index + 1]);
    return true;
  }

  private unmountCell(index: number | string): boolean {
    let cell = this.cellCache[index];
    if (cell) {
      cell.dispose();
      delete this.cellCache[index];
    }

    return true;
  }

  private indexAt(position: number): number {
    let left = 0;
    let right = this.ctx.columns.length - 1;
    let center: number;

    // Binary search
    while (left < right) {
      center = Math.floor((left + right) / 2);

      let leftPosition = this.getItemLeft(center);
      if (position < leftPosition) {
        right = center;
      } else if (position >= leftPosition + this.ctx.columns[center].width) {
        if (left === center) {
          break;
        }
        left = center;
      } else {
        return center;
      }
    }

    return this.ctx.columns.length - 1;
  }

  private indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.ctx.columns.length);
  }

  dispose() {
    this.domNode.remove();
  }
}

export interface CellToModify {
  mounted: string[]
  margin: number
}
