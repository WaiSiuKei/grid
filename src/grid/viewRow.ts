import { Datum, IGridColumnDefinition } from 'src/grid/grid';
import { IDisposable } from 'src/base/common/lifecycle';
import { addClass } from 'src/base/browser/dom';
import { VirtualNode } from 'src/virtual-dom/vnode';
import { h } from 'src/virtual-dom/h';
import { createElement } from 'src/virtual-dom/create-element';

function defaultFormatter(row: number, cell: number, value: any, columnDef: IGridColumnDefinition, dataContext: Datum): VirtualNode {
  if (value == null) {
    return null;
  } else {
    return h('div', { innerText: value + '' });
    // return (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

export class ViewCell implements IDisposable {
  private value: any;
  public width: number;
  private domNode: HTMLElement;
  private host: HTMLElement;
  constructor(container: HTMLElement, row: number, cell: number, datum: Datum, col: IGridColumnDefinition, left: number) {
    this.value = datum[col.field];
    let formatter = col.formatter || defaultFormatter;

    this.host = container;

    let el = document.createElement('div');
    el.className = 'nila-grid-cell';
    let content = createElement(formatter(row, cell, this.value, col, datum));
    el.appendChild(content);
    this.width = col.width || 80;
    el.style.width = `${this.width}px`;
    el.style.left = left + 'px';
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

export class ViewRow implements IDisposable {
  cells: ViewCell[];
  domNode: HTMLElement;

  mounted: boolean = false;
  host: HTMLElement;

  constructor(host: HTMLElement, rowIndex: number, data: Datum, columnDefinations: IGridColumnDefinition[]) {
    let container = document.createElement('div');
    addClass(container, 'nila-grid-row');
    this.domNode = container;
    this.host = host;

    this.cells = [];

    let left = 0;
    for (let i = 0, len = columnDefinations.length; i < len; i++) {
      let col = columnDefinations[i];
      let c = new ViewCell(container, rowIndex, i, data, col, left);
      this.cells.push(c);
      left += c.width;
    }
  }

  mount(slibing?: ViewRow) {
    this.mounted = true;
    this.cells.forEach(c => c.mount());
    if (slibing) {
      this.host.insertBefore(this.domNode, slibing.domNode);
    } else {
      this.host.appendChild(this.domNode);
    }
  }

  dispose() {
    this.mounted = false;
    // this.cells.forEach(c => c.dispose());
    this.domNode.remove();
  }
}
