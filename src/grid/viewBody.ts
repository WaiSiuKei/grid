import { CellFormatter, InternalGridColumnDefinition } from 'src/grid/grid';
import { IDisposable } from 'src/base/common/lifecycle';
import { addClass, removeClass } from 'src/base/browser/dom';
import { GridContext } from 'src/grid/girdContext';
import { ReactDOM } from '../rax';
import { Datum, defaultGroupTotalFormatter, Formatter, Group, GroupingSetting, GroupTotals } from 'src/data/data';
import { Iterator } from 'src/base/common/iterator';

interface IViewCell {
  domNode: HTMLElement
  mounted: boolean
}

abstract class ViewCell implements IDisposable, IViewCell {
  domNode: HTMLElement;
  mounted: boolean = false;

  prevSlibing: ViewCell = null;
  nextSlibing: ViewCell = null;

  constructor(protected host: HTMLElement | DocumentFragment, protected width: number) {

    let el = document.createElement('div');
    el.className = 'nila-grid-cell';

    el.style.width = `${this.width}px`;
    this.domNode = el;
  }

  mountBefore(slibing: ViewCell = null) {
    this.nextSlibing = slibing;
    if (slibing) {
      slibing.prevSlibing = this;
      this.host.insertBefore(this.domNode, slibing.domNode);
    } else {
      this.host.appendChild(this.domNode);
    }
    this.mounted = true;
    this.render();
  }

  mountAfter(slibing: ViewCell = null) {
    this.prevSlibing = slibing;
    if (slibing) {
      slibing.nextSlibing = this;
      let next = slibing.domNode.nextElementSibling;
      if (next) {
        this.host.insertBefore(this.domNode, next);
      } else {
        this.host.appendChild(this.domNode);
      }
    } else {
      this.host.appendChild(this.domNode);
    }

    this.mounted = true;
    this.render();
  }

  private _active: boolean = false;
  setActive(val: boolean) {
    if (this._active === val) return;
    this._active = val;
    if (val) {
      addClass(this.domNode, 'active');
    } else {
      removeClass(this.domNode, 'active');
    }
  }

  private render() {
    let component = this.getComponent();
    if (component) ReactDOM.render(component, this.domNode);
  }

  abstract getComponent(): Function

  dispose() {
    this.mounted = false;
    ReactDOM.unmountComponentAtNode(this.domNode);
    this.domNode.remove();
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

export class ViewEmptyCell extends ViewCell implements IDisposable {
  constructor(host: HTMLElement, width: number,) {
    super(host, width);

    addClass(this.domNode, 'empty-cell');
  }

  getComponent(): Function {
    return null;
  }
}

export class ViewDataCell extends ViewCell implements IDisposable {
  private value: any;
  private formatter: CellFormatter;

  constructor(host: HTMLElement | DocumentFragment, width: number, private datum: Datum, private col: InternalGridColumnDefinition) {
    super(host, width);
    this.value = datum[col.field];
    this.formatter = col.formatter;

    addClass(this.domNode, 'data-cell');
    if (col.cssClass) {
      addClass(this.domNode, col.cssClass);
    }
  }

  getComponent(): Function {
    return this.formatter(this.value, this.col, this.datum);
  }
}

export class ViewAggregationCell extends ViewCell implements IDisposable {
  constructor(host: HTMLElement, width: number, private key: string, private value: number, private type: string) {
    super(host, width);
    addClass(this.domNode, 'aggregation-cell');
  }

  getComponent(): Function {
    return defaultGroupTotalFormatter(this.key, this.value, this.type);
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

  hasActive: boolean = false;

  constructor(protected host: HTMLElement, protected ctx: GridContext) {
    let container = document.createElement('div');
    addClass(container, 'nila-grid-row');
    this.domNode = container;
    if (this.ctx.options.rowHeight) {
      this.domNode.style.height = this.ctx.options.rowHeight + 'px';
    }
  }

  updateRowIndex(idx: number | string) {
    this.domNode.dataset.index = idx.toString();
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

  mount() {
    this.mounted = true;
    this.host.appendChild(this.domNode);
  }

  unmount() {
    this.prevSlibing = null;
    this.nextSlibing = null;
    this.host.removeChild(this.domNode);
    this.mounted = false;
  }

  setActiveCells(fromCol: number, toCol: number) {
    console.log(fromCol, toCol);
  }

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
  private keyOfMounted: string[] = [];
  private mountedCells: ViewCell[] = [];

  constructor(host: HTMLElement, ctx: GridContext, private data: Datum) {
    super(host, ctx);
  }

  updateCell(headerMounted: string[], margin: number): void {
    let common = headerMounted.filter(h => this.keyOfMounted.indexOf(h) > -1);
    if (common.length) {
      let firstToKeep = common[0];
      let lastToKeep = common[common.length - 1];
      let firstMayMount = headerMounted[0];
      let lastMayMount = headerMounted[headerMounted.length - 1];
      let len = headerMounted.length;
      if (firstToKeep === firstMayMount) {
        // 删除👈，👉填充
        let idxToStopDeletion = this.keyOfMounted.indexOf(firstToKeep);
        let idxToDel = 0;
        while (idxToDel < idxToStopDeletion) {
          this.mountedCells.shift().dispose();
          idxToDel++;
        }
        let idxToFill = common.length; // idxToStartFilling
        while (idxToFill < len) {
          let col = this.ctx.columns[headerMounted[idxToFill]];
          let c = new ViewDataCell(this.domNode, col.width, this.data, col);
          c.mountAfter(this.mountedCells[this.mountedCells.length - 1]);
          this.mountedCells.push(c);
          idxToFill++;
        }
      } else if (lastToKeep === lastMayMount) {
        // 删除👉，👈填充
        let idxToStopDeletion = this.keyOfMounted.indexOf(lastToKeep);
        let idxToDel = this.mountedCells.length - 1;
        while (idxToDel > idxToStopDeletion) {
          this.mountedCells.pop().dispose();
          idxToDel--;
        }
        let idxToFill = len - common.length - 1;// idxToStartFilling
        while (idxToFill >= 0) {
          let col = this.ctx.columns[headerMounted[idxToFill]];
          let c = new ViewDataCell(this.domNode, col.width, this.data, col);
          c.mountBefore(this.mountedCells[0]);
          this.mountedCells.unshift(c);
          idxToFill--;
        }
      }
    } else {
      while (this.mountedCells.length) {
        this.mountedCells.pop().dispose();
      }
      for (let i = 0, len = headerMounted.length; i < len; i++) {
        let col = this.ctx.columns[headerMounted[i]];
        let c = new ViewDataCell(this.domNode, col.width, this.data, col);
        c.mountAfter(this.mountedCells[this.mountedCells.length - 1]);
        this.mountedCells.push(c);
      }
    }
    this.keyOfMounted = headerMounted.slice();

    this.setActiveCells(this.activeFrom, this.activeTo);
  }

  invalidate(): void {
    while (this.mountedCells.length) {
      this.mountedCells.pop().dispose();
    }
    this.keyOfMounted.length = 0;
  }

  private activeFrom: number = -1;
  private activeTo: number = -1;
  setActiveCells(from: number, to: number) {
    this.activeFrom = from;
    this.activeTo = to;
    if (from === -1 && to === -1) {
      this.hasActive = false;
      for (let c of this.mountedCells) {
        c.setActive(false);
      }
    } else {
      this.hasActive = true;
      for (let i = 0, len = this.keyOfMounted.length; i < len; i++) {
        let k = this.keyOfMounted[i];
        let val = parseInt(k);
        if (val >= from && val <= to) {
          this.mountedCells[i].setActive(true);
        } else {
          this.mountedCells[i].setActive(false);
        }
      }
    }
  }

  toString() {
    return JSON.stringify(this.data);
  }

  dispose() {
    super.dispose();
    this.invalidate();
  }
}

export type ViewGroupCell = ViewMergedCell<Group, GroupingSetting>

export class ViewGroupRow extends ViewRow {
  private cell: ViewGroupCell;
  constructor(host: HTMLElement, ctx: GridContext, private group: Group) {
    super(host, ctx);
  }
  updateCell(headerMounted: string[], margin: number): void {
    if (headerMounted.indexOf('0') > -1) {
      if (!this.cell) {
        let config = this.ctx.model.getGrouping(this.group.level);
        this.cell = new ViewMergedCell<Group, GroupingSetting>(this.domNode, -1, this.group, config.formatter, config);
        this.cell.mountAfter(null);
      }
    } else {
      if (this.cell) {
        this.cell.dispose();
        this.cell = null;
      }
    }
  }

  invalidate(): void {
    if (this.cell) {
      this.cell.dispose();
      this.cell = null;
    }
  }
}

export class ViewGroupTotalsRow extends ViewRow {
  private keyOfMounted: string[] = [];
  private mountedCells: ViewCell[] = [];

  constructor(host: HTMLElement, ctx: GridContext, private groupTotals: GroupTotals) {
    super(host, ctx);
  }

  updateCell(headerMounted: string[], margin: number): void {
    let common = headerMounted.filter(h => this.keyOfMounted.indexOf(h) > -1);
    if (common.length) {
      let firstToKeep = common[0];
      let lastToKeep = common[common.length - 1];
      let firstMayMount = headerMounted[0];
      let lastMayMount = headerMounted[headerMounted.length - 1];
      let len = headerMounted.length;
      if (firstToKeep === firstMayMount) {
        // 删除👈，👉填充
        let idxToStopDeletion = this.keyOfMounted.indexOf(firstToKeep);
        let idxToDel = 0;
        while (idxToDel < idxToStopDeletion) {
          this.mountedCells.shift().dispose();
          idxToDel++;
        }
        let idxToFill = common.length; // idxToStartFilling
        while (idxToFill < len) {
          let col = this.ctx.columns[headerMounted[idxToFill]];
          let a = this.groupTotals.getByField(col.field);
          let c: ViewCell;
          if (a) {
            c = new ViewAggregationCell(this.domNode, col.width, a.field, a.value, a.type);
          } else {
            c = new ViewEmptyCell(this.domNode, col.width);
          }
          c.mountAfter(this.mountedCells[this.mountedCells.length - 1]);
          this.mountedCells.push(c);
          idxToFill++;
        }
      } else if (lastToKeep === lastMayMount) {
        // 删除👉，👈填充
        let idxToStopDeletion = this.keyOfMounted.indexOf(lastToKeep);
        let idxToDel = this.mountedCells.length - 1;
        while (idxToDel > idxToStopDeletion) {
          this.mountedCells.pop().dispose();
          idxToDel--;
        }
        let idxToFill = len - common.length - 1;// idxToStartFilling
        while (idxToFill >= 0) {
          let col = this.ctx.columns[headerMounted[idxToFill]];
          let a = this.groupTotals.getByField(col.field);
          let c: ViewCell;
          if (a) {
            c = new ViewAggregationCell(this.domNode, col.width, a.field, a.value, a.type);
          } else {
            c = new ViewEmptyCell(this.domNode, col.width);
          }
          c.mountBefore(this.mountedCells[0]);
          this.mountedCells.unshift(c);
          idxToFill--;
        }
      }
    } else {
      while (this.mountedCells.length) {
        this.mountedCells.pop().dispose();
      }
      for (let i = 0, len = headerMounted.length; i < len; i++) {
        let col = this.ctx.columns[headerMounted[i]];
        let a = this.groupTotals.getByField(col.field);
        let c: ViewCell;
        if (a) {
          c = new ViewAggregationCell(this.domNode, col.width, a.field, a.value, a.type);
        } else {
          c = new ViewEmptyCell(this.domNode, col.width);
        }
        c.mountAfter(this.mountedCells[this.mountedCells.length - 1]);
        this.mountedCells.push(c);
      }
    }
    this.keyOfMounted = headerMounted.slice();
  }

  invalidate(): void {
    while (this.mountedCells.length) {
      this.mountedCells.pop().dispose();
    }
    this.keyOfMounted.length = 0;
  }

  dispose() {
    super.dispose();
    this.invalidate();
  }
}

export class ViewVirtualRow extends ViewRow {
  updateCell(headerMounted: string[], margin: number): void {
    // noop
  }
  invalidate(): void {
    // noop
  }
}

export type ViewBodyCell = ViewCell | ViewEmptyCell | ViewDataCell
export type ViewBodyRow = ViewDataRow | ViewGroupRow | ViewGroupTotalsRow | ViewVirtualRow
