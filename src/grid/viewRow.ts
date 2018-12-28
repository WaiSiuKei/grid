import { Datum, IGridColumnDefinition } from 'src/grid/grid';
import { IDisposable } from 'src/base/common/lifecycle';
import { addClass } from 'src/base/browser/dom';
import { VirtualNode } from 'src/virtual-dom/vnode';
import { h } from 'src/virtual-dom/h';
import { createElement } from 'src/virtual-dom/create-element';

function defaultFormatter(row: number, cell: number, value: any, columnDef: IGridColumnDefinition, dataContext: Datum): VirtualNode {
  return h('div', { innerText: (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') });
}

export class ViewCell implements IDisposable {
  public width: number;

  private value: any;
  private domNode: HTMLElement;
  private host: HTMLElement;

  mounted: boolean = false;

  constructor(container: HTMLElement, row: number, cell: number, datum: Datum, col: IGridColumnDefinition) {
    this.value = datum[col.field];
    let formatter = col.formatter || defaultFormatter;

    this.host = container;

    let el = document.createElement('div');
    el.className = 'nila-grid-cell';
    let content = createElement(formatter(row, cell, this.value, col, datum));
    el.appendChild(content);
    this.width = col.width || 80;
    el.style.width = `${this.width}px`;
    this.domNode = el;
  }

  mount(slibing?: ViewCell) {
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

export class ViewRow implements IDisposable {
  cells: ViewCell[] = [];
  domNode: HTMLElement;

  mounted: boolean = false;
  host: HTMLElement;

  constructor(host: HTMLElement, rowIndex: number, data: Datum, columnDefinations: IGridColumnDefinition[]) {
    let container = document.createElement('div');
    addClass(container, 'nila-grid-row');
    this.domNode = container;
    this.host = host;

    for (let i = 0, len = columnDefinations.length; i < len; i++) {
      let col = columnDefinations[i];
      let c = new ViewCell(container, rowIndex, i, data, col);
      this.cells.push(c);
    }
  }

  mount(slibing?: ViewRow) {
    this.mounted = true;
    if (slibing) {
      this.host.insertBefore(this.domNode, slibing.domNode);
    } else {
      this.host.appendChild(this.domNode);
    }
  }

  private mountCell(index: number): boolean {
    let cell = this.cells[index];
    if (cell.mounted) return false;

    this.cells[index].mount(this.cells[index + 1]);
    return true;
  }

  private unmountCell(index: number): boolean {
    let c = this.cells[index];
    if (!c.mounted) return false;
    this.cells[index].unmount();

    return true;
  }

  updateCell(toInsert: number[], toRemove: number[], mounted: number[], margin: number) {
    for (let i of mounted) {
      this.mountCell(i);
    }
    for (let i of toRemove) {
      this.unmountCell(i);
    }

    this.domNode.style.left = margin + 'px';
  }

  dispose() {
    this.mounted = false;
    this.domNode.remove();
  }
}
