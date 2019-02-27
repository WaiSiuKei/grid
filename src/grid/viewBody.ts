import { CellFormatter, IGridColumnDefinition } from 'src/grid/grid';
import { IDisposable } from 'src/base/common/lifecycle';
import { addClass } from 'src/base/browser/dom';
import { GridContext } from 'src/grid/girdContext';
import { React, ReactDOM } from '../rax';
import { Datum, Formatter, Group, GroupingSetting, GroupTotals } from 'src/data/data';
import { isFunction, isNumber, isString, isUndefinedOrNull } from 'src/base/common/types';

interface IViewCell {
  domNode: HTMLElement
  mounted: boolean
}

abstract class ViewCell implements IDisposable, IViewCell {
  domNode: HTMLElement;
  mounted: boolean = false;

  constructor(protected host: HTMLElement, protected width: number) {

    let el = document.createElement('div');
    el.className = 'nila-grid-cell';

    el.style.width = `${this.width}px`;
    this.domNode = el;
  }

  mount(slibing?: IViewCell) {
    this.mounted = true;
    if (slibing && slibing.mounted) {
      this.host.insertBefore(this.domNode, slibing.domNode);
    } else {
      this.host.appendChild(this.domNode);
    }
    ReactDOM.render(React.createElement(this.getComponent()), this.domNode);
  }

  abstract getComponent(): Function

  unmount() {
    this.mounted = false;
    ReactDOM.unmountComponentAtNode(this.domNode);
    this.host.removeChild(this.domNode);
  }

  dispose() {
    this.mounted = false;
    ReactDOM.unmountComponentAtNode(this.domNode);
    this.domNode.remove();
  }
}

export class ViewDataCell extends ViewCell implements IDisposable {
  private value: any;
  private formatter: CellFormatter;

  mounted: boolean = false;

  constructor(host: HTMLElement, width: number, private datum: Datum, private col: IGridColumnDefinition) {
    super(host, width);
    this.value = datum[col.field];
    this.formatter = col.formatter;

    addClass(this.domNode, 'single-cell');
  }

  getComponent(): Function {
    return this.formatter(this.value, this.col, this.datum);
  }
}

export class ViewMergedCell<D, C> extends ViewCell {
  mounted: boolean = false;

  constructor(host: HTMLElement, width: number, private data: D, private formatter: Formatter<D, C>, private config: C) {
    super(host, width);
    addClass(this.domNode, 'merged-cell');
  }

  getComponent(): Function {
    return this.formatter(this.data, this.config);
  }
}

abstract class ViewRow implements IDisposable {
  domNode: HTMLElement;

  mounted: boolean = false;

  prevSlibing: ViewRow = null;
  nextSlibing: ViewRow = null;

  constructor(protected host: HTMLElement, protected ctx: GridContext) {
    let container = document.createElement('div');
    addClass(container, 'nila-grid-row');
    this.domNode = container;
    if (this.ctx.options.rowHeight) {
      this.domNode.style.height = this.ctx.options.rowHeight + 'px';
    }
  }

  mountBefore(slibing: ViewRow = null) {
    this.nextSlibing = slibing;
    if (slibing) {
      slibing.prevSlibing = this;
      this.host.insertBefore(this.domNode, slibing.domNode);
    } else {
      this.host.appendChild(this.domNode);
    }
    this.mounted = true;
  }

  mountAfter(slibing: ViewRow) {
    this.prevSlibing = slibing;
    slibing.nextSlibing = this;
    let next = slibing.domNode.nextElementSibling;
    if (next) {
      this.host.insertBefore(this.domNode, next);
    } else {
      this.host.appendChild(this.domNode);
    }
    this.mounted = true;
  }

  abstract invalidate(): void

  abstract updateCell(headerMounted: string[], margin: number): void

  dispose() {
    this.mounted = false;

    if (this.prevSlibing) {
      this.prevSlibing.nextSlibing = this.nextSlibing;
    }
    if (this.nextSlibing) {
      this.nextSlibing.prevSlibing = this.prevSlibing;
    }
    this.nextSlibing = null;
    this.prevSlibing = null;

    this.domNode.remove();
  }
}

export class ViewDataRow extends ViewRow {
  protected cellCache: { [key: string]: ViewCell } = Object.create(null);

  constructor(host: HTMLElement, ctx: GridContext, private data: Datum) {
    super(host, ctx);
  }

  private mountCell(index: number): boolean {
    let cell: ViewCell = this.cellCache[index];
    if (!cell) {
      let col = this.ctx.columns[index];
      cell = new ViewDataCell(this.domNode, col.width, this.data, col);
      this.cellCache[index] = cell;
    }
    if (cell.mounted) return false;

    cell.mount(this.cellCache[index + 1]);
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

  updateCell(headerMounted: string[], margin: number): void {
    let thisMounted = Object.keys(this.cellCache);
    let h = {};
    for (let i = 0, len = headerMounted.length; i < len; i++) {
      h[headerMounted[i]] = true;
      this.mountCell(parseInt(headerMounted[i]));
    }
    for (let i = 0, len = thisMounted.length; i < len; i++) {
      if (!h[thisMounted[i]]) this.unmountCell(parseInt(thisMounted[i]));
    }

    this.domNode.style.left = margin + 'px';
  }

  invalidate(): void {
    Object.keys(this.cellCache).forEach(k => {
      this.unmountCell(k);
    });
    this.cellCache = Object.create(null);
  }

  dispose() {
    super.dispose();
    Object.keys(this.cellCache).forEach(i => {
      this.cellCache[i].dispose();
      delete this.cellCache[i];
    });

  }
}

export type ViewGroupCell = ViewMergedCell<Group, GroupingSetting>

export class ViewGroupRow extends ViewRow {
  private cell: ViewGroupCell;
  constructor(host: HTMLElement, ctx: GridContext, private group: Group) {
    super(host, ctx);
  }
  updateCell(headerMounted: string[], margin: number): void {
    if (!this.cell) {
      let config = this.ctx.model.getGrouping(this.group.level);
      this.cell = new ViewMergedCell<Group, GroupingSetting>(this.domNode, -1, this.group, config.formatter, config);
      this.cell.mount();
    }
    this.domNode.style.left = margin + 'px';
  }

  invalidate(): void {
    if (this.cell) {
      this.cell.dispose();
      this.cell = null;
    }
  }
}

export class ViewGroupTotalsRow extends ViewRow {
  constructor(host: HTMLElement, ctx: GridContext, private groupTotals: GroupTotals) {
    super(host, ctx);
  }
  updateCell(headerMounted: string[], margin: number): void {
    // fixme
    this.domNode.style.left = margin + 'px';
  }
  invalidate(): void {

  }
}

export type ViewBodyRow = ViewDataRow | ViewGroupRow | ViewGroupTotalsRow
