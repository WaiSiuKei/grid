import './grid.css';
import { ScrollbarVisibility } from 'src/base/common/scrollable';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { addClasses, getClientArea, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';
import { isString, isUndefinedOrNull } from 'src/base/common/types';
import { ViewHeaderRow } from 'src/grid/viewHeader';
import { GridContext } from 'src/grid/girdContext';
import { GridModel } from 'src/grid/gridModel';
import { CellFormatter, COLUMN_DEFAULT, GRID_DEFAULT, IGridColumnDefinition, IGridOptions } from 'src/grid/grid';
import { mapBy, sum, sumBy } from 'src/base/common/functional';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { Datum, Group, GroupTotals, IDataSet, Row } from 'src/data/data';
import { DataView } from 'src/data/dataView';
import { PatchChange, PatchItem } from 'src/base/common/patch';
import { ViewBodyRow, ViewDataRow, ViewGroupRow, ViewGroupTotalsRow, ViewVirtialRow } from 'src/grid/viewBody';

function validateAndEnforceOptions(opt: Partial<IGridOptions>): IGridOptions {
  return Object.assign({}, GRID_DEFAULT, opt) as IGridOptions;
}

function validatedAndEnforeColumnDefinitions(col: Array<Partial<IGridColumnDefinition>>, defaultWidth?: number, defaultFormatter?: CellFormatter): IGridColumnDefinition[] {
  let validatedCols: IGridColumnDefinition[] = [];

  let defaultDef = COLUMN_DEFAULT;
  if (defaultWidth) {
    defaultDef.width = defaultWidth;
    defaultDef.flexGrow = 0;
    defaultDef.flexShrink = 0;
  }
  if (defaultFormatter) {
    Object.assign(defaultDef, { formatter: defaultFormatter });
  }
  for (let i = 0; i < col.length; i++) {
    let m = Object.assign({}, defaultDef, col[i]);
    m.flexGrow = Math.max(0, m.flexGrow);
    m.flexShrink = Math.max(0, m.flexShrink);

    if (isUndefinedOrNull(m.minWidth)) {
      if (m.flexShrink === 0) {
        m.minWidth = m.width;
      } else {
        m.minWidth = 1;
      }
    }
    if (m.width < m.minWidth) {
      m.width = m.minWidth;
    }
    if (isUndefinedOrNull(m.maxWidth)) {
      if (m.flexGrow === 0) {
        m.maxWidth = m.width;
      } else {
        m.maxWidth = Infinity;
      }
    }
    if (m.width > m.maxWidth) {
      m.width = m.maxWidth;
    }
    validatedCols.push(m as IGridColumnDefinition);
  }
  return validatedCols;
}

function resolvingColumnWidths(col: Array<IGridColumnDefinition>, totalWidth: number): Array<IGridColumnDefinition> {
  let currentWidths = sumBy(col, 'width');
  let spaces = totalWidth - currentWidths;
  if (spaces === 0) return;
  let factors: number[] = mapBy(col, spaces > 0 ? 'flexGrow' : 'flexShrink');
  let total = Math.max(1, sum(factors)); // https://github.com/xieranmaya/blog/issues/9
  if (total === 0) return;
  for (let i = 0, len = col.length; i < len; i++) {
    col[i].width += spaces * factors[i] / total;
  }
}

export class Grid implements IDisposable {
  protected static counter: number = 0;

  protected ctx: GridContext;

  protected domNode: HTMLElement;
  protected body: HTMLElement;
  protected rowsContainer: HTMLElement;
  protected scrollableElement: ScrollableElement;
  protected header: ViewHeaderRow;

  protected mountedRows: ViewBodyRow[] = [];

  private shouldShowHorizonalScrollbar = false;
  private shouldShowVerticalScrollbar = false;

  private viewEventRegistered = false;

  private toDispose: IDisposable[] = [];

  constructor(protected container: HTMLElement, ds: IDataSet, col: Array<Partial<IGridColumnDefinition>>, options: Partial<IGridOptions> = {}) {
    let opt = validateAndEnforceOptions(options);
    let model = new GridModel(ds);
    let columns = validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth, opt.defaultFormatter);
    resolvingColumnWidths(columns, container.clientWidth);
    this.ctx = new GridContext(model, columns, opt);

    this.createElement(container);

    if (this.ctx.options.explicitInitialization) {
      this.render();
    }

    if (ds instanceof DataView) {
      this.registerDataListeners(ds);
    }
  }

  //#region private listener
  private registerViewListeners() {
    this.toDispose.push(this.scrollableElement.onScroll((e) => {
      if (e.heightChanged || e.scrollHeightChanged || e.scrollTopChanged) {
        this.renderVerticalChanges(e.height, e.scrollTop);
      }
      if (e.widthChanged || e.scrollWidthChanged || e.scrollLeftChanged) {
        this.renderHorizonalChanges(e.width, e.scrollLeft);
      }
    }));
  }

  private registerDataListeners(ds: DataView) {
    this.toDispose.push(ds.onRowsChanged((evt) => {
      if (this.indexOfFirstMountedRow === -1 && this.indexOfLastMountedRow === -1) {
        this.scrollHeight = this.getTotalRowsHeight();
        this.renderHorizonalChanges(getContentWidth(this.body));
      } else {
        this.handlePatchs(evt);
      }
    }));
  }
  //#endregion

  public render() {
    this.layout();
    if (!this.viewEventRegistered) {
      this.registerViewListeners();
    }
  }

  public invalidate() {
    this.invalidateAllRows();
    this.header.invalidate();
  }

  public invalidateRow(idx: number): void {
    if (idx < this.indexOfFirstMountedRow || idx > this.indexOfLastMountedRow) return;
    this.mountedRows[idx - this.indexOfFirstMountedRow].invalidate();
  }

  public invalidateRows(idxs: number[]) {
    for (let i = 0, len = idxs.length; i < len; i++) {
      this.invalidateRow(idxs[i]);
    }
  }

  public invalidateAllRows() {
    while (this.mountedRows.length) {
      this.mountedRows.pop().dispose();
    }
  }

  //#region private dom
  protected createElement(container: HTMLElement) {
    this.domNode = document.createElement('div');
    this.domNode.className = `nila-grid nila-grid-instance-${Grid.counter++}`;

    this.header = new ViewHeaderRow(this.ctx);

    this.body = document.createElement('div');
    this.body.className = 'nila-grid-body';
    if (isString(this.ctx.options.viewportClass) && this.ctx.options.viewportClass.length) {
      let classes = this.ctx.options.viewportClass.split(/\s+/i);
      addClasses(this.body, ...classes);
    }
    this.scrollableElement = new ScrollableElement(this.body, {
      alwaysConsumeMouseWheel: true,
      horizontal: ScrollbarVisibility.Visible,
      vertical: ScrollbarVisibility.Visible,
    });

    this.rowsContainer = document.createElement('div');
    this.rowsContainer.className = 'nila-grid-rows';

    this.body.appendChild(this.rowsContainer);
    container.appendChild(this.domNode);
    this.header.mountTo(this.domNode);

    let body = this.scrollableElement.getDomNode();
    this.domNode.appendChild(body);
    let headerHeight = this.ctx.options.showHeaderRow ? this.ctx.options.headerRowHeight || getContentHeight(this.header.domNode) : 0;
    body.style.height = getContentHeight(this.domNode) - headerHeight + 'px';
  }

  protected layout(height?: number, width?: number): void {
    let h = height || getContentHeight(this.body);
    if (h > this.container.clientHeight) this.shouldShowVerticalScrollbar = true;
    this.viewHeight = h;
    this.scrollHeight = this.getTotalRowsHeight() || 0;
    let w = width || getContentWidth(this.body);
    if (w > this.container.clientWidth) this.shouldShowHorizonalScrollbar = true;
    this.viewWidth = w;
    this.scrollWidth = this.getContentWidth() || 0;

    this.renderHeader(w);
    this.renderVerticalChanges(h);
    this.renderHorizonalChanges(w);
  }

  protected getTotalRowsHeight(): number {
    return this.ctx.model.length * this.ctx.options.rowHeight;
  }

  protected getContentWidth(): number {
    // FIXME
    return sumBy(this.ctx.columns, 'width');
  }

  protected get viewHeight() {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.height;
  }

  protected set viewHeight(height: number) {
    this.scrollableElement.setScrollDimensions({ height });
  }

  protected set scrollHeight(scrollHeight: number) {
    this.scrollableElement.setScrollDimensions({ scrollHeight: scrollHeight + (this.shouldShowHorizonalScrollbar ? 10 : 0) });
  }

  protected get viewWidth(): number {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.width;
  }

  protected set viewWidth(viewWidth: number) {
    this.scrollableElement.setScrollDimensions({ width: viewWidth });
  }

  protected set scrollWidth(scrollWidth: number) {
    this.scrollableElement.setScrollDimensions({ scrollWidth });
  }

  protected get scrollTop(): number {
    const scrollPosition = this.scrollableElement.getScrollPosition();
    return scrollPosition.scrollTop;
  }

  protected set scrollTop(scrollTop: number) {
    const scrollHeight = this.getTotalRowsHeight() + (this.shouldShowHorizonalScrollbar ? 10 : 0);
    this.scrollableElement.setScrollDimensions({ scrollHeight });
    this.scrollableElement.setScrollPosition({ scrollTop });
  }

  protected set scrollLeft(scrollLeft: number) {
    const scrollWidth = this.getContentWidth() + (this.shouldShowVerticalScrollbar ? 10 : 0);
    this.scrollableElement.setScrollDimensions({ scrollWidth });
    this.scrollableElement.setScrollPosition({ scrollLeft });
  }
  //#endregion

  //#region private rows mount/unmount
  private indexOfFirstMountedRow = -1;
  private indexOfLastMountedRow = -1;
  private renderVerticalChanges(viewHeight: number, scrollTop = 0): void {
    if (!viewHeight) return;
    // console.log('start', this.indexOfFirstMountedRow, this.indexOfLastMountedRow);

    let renderTop = scrollTop;
    let renderBottom = scrollTop + viewHeight;
    // console.log('scrollTop=', scrollTop, 'renderBottom=', renderBottom);
    let shouldFrom = this.indexAt(renderTop);
    let shouldTo = this.indexAt(renderBottom);
    if (shouldFrom !== this.indexOfFirstMountedRow || shouldTo !== this.indexOfLastMountedRow) {
      // console.log('shouldFrom=', shouldFrom, 'shouldTo=', shouldTo);
      let indexOfFirstRowToGrowDown = -1;
      let indexOfFirstRowToGrowUp = -1;

      if (this.indexOfLastMountedRow < shouldTo) {
        // 向下滚，下边需要填充
        indexOfFirstRowToGrowDown = this.indexOfLastMountedRow + 1;
      } else {
        // 向上滚，去掉多余的
        let i = this.indexOfLastMountedRow;
        while (i > shouldTo && this.mountedRows.length) {
          // console.log('remove', i, shouldTo);
          this.mountedRows.pop().dispose();
          i--;
        }
      }

      if (this.indexOfFirstMountedRow > shouldFrom) {
        // 向上滚，上面需要填充
        indexOfFirstRowToGrowUp = this.indexOfFirstMountedRow - 1;
      } else {
        // 向下滚，去掉多余的
        let i = this.indexOfFirstMountedRow;
        while (i < shouldFrom && this.mountedRows.length) {
          // console.log('remove', i, shouldFrom);
          this.mountedRows.shift().dispose();
          i++;
        }
      }

      if (!this.ctx.model.length) return;

      if (!this.mountedRows.length) {
        indexOfFirstRowToGrowUp = -1;
        indexOfFirstRowToGrowDown = shouldFrom;
      }

      // console.log('indexOfFirstRowToGrowDown=', indexOfFirstRowToGrowDown, 'indexOfFirstRowToGrowUp=', indexOfFirstRowToGrowUp);
      while (indexOfFirstRowToGrowDown > -1 && indexOfFirstRowToGrowDown <= shouldTo) {
        let r = this.createRowByIndex(indexOfFirstRowToGrowDown);
        if (!this.mountedRows.length) {
          r.mountBefore(null);
        } else {
          r.mountAfter(this.mountedRows[this.mountedRows.length - 1]);
        }
        this.renderRow(r);
        this.mountedRows.push(r);
        indexOfFirstRowToGrowDown++;
      }

      while (indexOfFirstRowToGrowUp > -1 && indexOfFirstRowToGrowUp >= shouldFrom) {
        let r = this.createRowByIndex(indexOfFirstRowToGrowUp);
        if (this.mountedRows.length) {
          r.mountBefore(this.mountedRows[0]);
        } else {
          r.mountBefore(null);
        }
        this.renderRow(r);
        this.mountedRows.unshift(r);
        indexOfFirstRowToGrowUp--;
      }

      this.indexOfLastMountedRow = shouldTo;
      this.indexOfFirstMountedRow = shouldFrom;
    }

    let r = this.ctx.options.rowHeight;
    let transform = this.getRowTop(shouldFrom) - renderTop;
    this.rowsContainer.style.top = clamp(transform, r, -r) + 'px';
    // console.log('end', this.indexOfFirstMountedRow, this.indexOfLastMountedRow);
  }

  private memorizedMounted: string[];
  private memorizedMargin: number;
  private renderHorizonalChanges(viewWidth: number, scrollLeft = 0) {
    let { mounted, margin } = this.header.render(scrollLeft, viewWidth);
    this.memorizedMargin = margin;
    this.memorizedMounted = mounted;
    this.rowsContainer.style.left = margin + 'px';
    for (let i = 0, len = this.mountedRows.length; i < len; i++) {
      this.mountedRows[i].updateCell(mounted, margin);
    }
  }

  private renderHeader(viewWidth: number) {
    let { mounted, margin } = this.header.render(0, viewWidth);
    this.memorizedMargin = margin;
    this.memorizedMounted = mounted;
  }

  private renderRow(row: ViewBodyRow): void {
    if (isUndefinedOrNull(this.memorizedMounted) || isUndefinedOrNull(this.memorizedMargin)) throw new Error('not ready');
    row.updateCell(this.memorizedMounted, this.memorizedMargin);
  }

  private handlePatchs(patchs: PatchItem<Row>[]): void {
    let rows: ViewBodyRow[] = [];
    for (let i = 0; i < this.indexOfFirstMountedRow; i++) {
      rows.push(null);
    }
    for (let i = 0, len = this.mountedRows.length; i < len; i++) {
      let r = this.mountedRows[i];
      r.unmount();
      rows[rows.length] = r;
    }
    let segments: ViewBodyRow[][] = [];

    let sameStart = 0;

    for (let i = 0; i < patchs.length; ++i) {
      let patch = patchs[i];
      sameStart !== patch.oldPos && segments.push(rows.slice(sameStart, patch.oldPos));
      if (patch.type === PatchChange.Add) {
        let toAdd = patch.items.map(i => this.createRowByData(i));
        segments.push(toAdd);
        sameStart = patch.oldPos;
      } else {
        sameStart = patch.oldPos + patch.items.length;
        for (let i = patch.oldPos; i < sameStart; i++) {
          let row = rows[i];
          if (row) {
            row.dispose();
            rows[i] = null;
          }
        }
      }
    }

    sameStart !== rows.length && segments.push(rows.slice(sameStart));

    let patchedRows = [].concat.apply([], segments);

    let shouldDisplayTo = Math.min(this.indexOfLastMountedRow, this.ctx.model.length - 1);
    let displayedTo = patchedRows.length;
    for (let i = displayedTo; i <= shouldDisplayTo; i++) {
      let r = this.createRowByIndex(i);
      patchedRows.push(r);
    }

    patchedRows = patchedRows.slice(this.indexOfFirstMountedRow, this.indexOfLastMountedRow + 1);
    this.mountedRows.length = 0;
    while (patchedRows.length) {
      let r = patchedRows.shift();
      if (!r) debugger;
      if (!r.mounted) {
        r.mount();
        this.renderRow(r);
      }
      this.mountedRows.push(r);
    }
  }

  /*#region 不太通用，只能处理一次的patch
  private handleRemoval(patch: PatchItem<Row>): boolean {
    if (this.indexOfFirstMountedRow === -1 && this.indexOfLastMountedRow === -1) {
      this.scrollHeight = this.getTotalRowsHeight();
      return true;
    }

    if (patch.newPos >= this.indexOfFirstMountedRow && patch.newPos <= this.indexOfLastMountedRow) {
      let count = patch.items.length;
      let start = patch.newPos;
      let lastIndexMayDelete = start + count - 1;
      let lastIndexCanDelete = Math.min(lastIndexMayDelete, this.indexOfLastMountedRow);
      for (let i = lastIndexCanDelete; i >= start; i--) {
        let arrIndex = i - this.indexOfFirstMountedRow;
        this.mountedRows[arrIndex].dispose();
        this.mountedRows.splice(arrIndex, 1);
      }

      let lastIndexMayDisplay = this.indexOfLastMountedRow;
      let lastIndexCanDisplay = Math.min(this.ctx.model.length - 1, lastIndexMayDisplay);
      let i = this.indexOfFirstMountedRow + this.mountedRows.length;
      while (i <= lastIndexCanDisplay) {
        let r = this.createRowByIndex(i);
        r.mountAfter(this.mountedRows[this.mountedRows.length - 1]);
        this.renderRow(r);
        this.mountedRows.push(r);
        i++;
      }

      this.indexOfLastMountedRow = lastIndexCanDisplay;

      this.scrollHeight = this.getTotalRowsHeight();
      return false;
    }

    if (patch.newPos > this.indexOfLastMountedRow) {
      this.scrollHeight = this.getTotalRowsHeight();
      return false;
    }

    if (patch.newPos < this.indexOfFirstMountedRow) {
      if (patch.newPos + patch.items.length - 1 < this.indexOfFirstMountedRow) {
        this.indexOfFirstMountedRow -= patch.items.length;
        this.indexOfLastMountedRow -= patch.items.length;
        this.scrollHeight = this.getTotalRowsHeight();
        return false;
      } else {
        let firstIndexWillEffect = patch.newPos;
        let lastIndexWillEffect = patch.newPos + patch.items.length - 1;
        let lastIndexCanDelete = Math.min(lastIndexWillEffect, this.indexOfLastMountedRow);
        let firstIndexCanDelete = Math.max(firstIndexWillEffect, this.indexOfFirstMountedRow);

        for (let i = lastIndexCanDelete; i >= firstIndexCanDelete; i--) {
          let arrIndex = i - this.indexOfFirstMountedRow;
          this.mountedRows[arrIndex].dispose();
          this.mountedRows.splice(arrIndex, 1);
        }

        let lastIndexDisplayed = Math.max(this.indexOfLastMountedRow - patch.items.length, -1);
        let lastIndexCanDisplay = Math.min(this.indexOfLastMountedRow, this.ctx.model.length - 1);
        for (let i = lastIndexDisplayed + 1; i <= lastIndexCanDisplay; i++) {
          let r = this.createRowByIndex(i);
          r.mountAfter(this.mountedRows[this.mountedRows.length - 1]);
          this.renderRow(r);
          this.mountedRows.push(r);
        }

        this.indexOfFirstMountedRow = patch.newPos;
        this.indexOfLastMountedRow = lastIndexCanDisplay;
        this.scrollHeight = this.getTotalRowsHeight();
        return false;
      }
    }

    return false;
  }

  private handleAdding(patch: PatchItem<Row>): boolean {
    if (this.indexOfFirstMountedRow === -1 && this.indexOfLastMountedRow === -1) {
      // mounted为空，重新渲染
      this.scrollHeight = this.getTotalRowsHeight();
      return true;
    }
    if (patch.newPos > this.indexOfLastMountedRow) {
      // viewport下方，目前的不动，scrollbar长度改变
      this.scrollHeight = this.getTotalRowsHeight();
      return false;
    }
    if (patch.newPos >= this.indexOfFirstMountedRow && patch.newPos <= this.indexOfLastMountedRow) {
      // 插入点已经在viewport内，必然影响
      let count = Math.min(this.indexOfLastMountedRow - patch.newPos + 1, patch.items.length);
      let i = 0;
      while (i < count) {
        let r = this.createRowByIndex(patch.newPos + i);
        this.renderRow(r);
        let index = patch.newPos + i;
        r.mountBefore(this.mountedRows[index]);
        this.mountedRows.splice(index, 0, r);
        i++;
      }
      // 检查超出viewpart的，删除
      let shouldCheck = true;
      let deletedCount = 0;
      let bottom = this.rowsContainer.getBoundingClientRect().bottom;
      while (shouldCheck) {
        let last = this.mountedRows[this.mountedRows.length - 1];
        if (last.domNode.getBoundingClientRect().top > bottom) {
          this.mountedRows.pop().dispose();
          deletedCount++;
        } else {
          shouldCheck = false;
        }
      }

      this.indexOfLastMountedRow = this.indexOfLastMountedRow + patch.items.length - deletedCount;

      this.scrollHeight = this.getTotalRowsHeight();
      return false;
    }
    if (patch.newPos < this.indexOfFirstMountedRow) {
      let lastIndexWillEffect = patch.newPos + patch.items.length - 1;
      if (lastIndexWillEffect < this.indexOfFirstMountedRow) {
        // 完全在viewport外，但是影响现在viewport的scrolltop
        this.indexOfFirstMountedRow += patch.items.length;
        this.indexOfLastMountedRow += patch.items.length;
        this.scrollHeight = this.getTotalRowsHeight();
        return false;
      } else {
        // 有部分row会插入到viewport顶部，相应地，可能有同样数量的row要删除
        // 插入的可能时原来的数据，也可能时新的数据，为了方便，取自model
        let newIndexOfFirstMountedRow = this.indexOfFirstMountedRow + patch.items.length;
        while (newIndexOfFirstMountedRow > this.indexOfFirstMountedRow) {
          newIndexOfFirstMountedRow--;
          let r = this.createRowByIndex(newIndexOfFirstMountedRow);
          r.mountBefore(this.mountedRows[0]);
          this.renderRow(r);
          this.mountedRows.unshift(r);
        }
        // 检查超出viewpart的，删除
        let shouldCheck = true;
        let deletedCount = 0;
        let bottom = this.rowsContainer.getBoundingClientRect().bottom;
        while (shouldCheck) {
          let last = this.mountedRows[this.mountedRows.length - 1];
          if (last.domNode.getBoundingClientRect().top > bottom) {
            this.mountedRows.pop().dispose();
            deletedCount++;
          } else {
            shouldCheck = false;
          }
        }

        this.indexOfLastMountedRow = this.indexOfLastMountedRow + patch.items.length - deletedCount;

        this.scrollHeight = this.getTotalRowsHeight();
        return false;
      }
    }
    throw new Error('没处理');
  }
  */

  private createRowByIndex(modelIndex: number): ViewBodyRow {
    let row = this.ctx.model.get(modelIndex);
    if (row instanceof Group) {
      return new ViewGroupRow(this.rowsContainer, this.ctx, row as Group);
    }
    if (row instanceof GroupTotals) {
      return new ViewGroupTotalsRow(this.rowsContainer, this.ctx, row as GroupTotals);
    }
    return new ViewDataRow(this.rowsContainer, this.ctx, row as Datum);
  }

  private createRowByData(row: Row): ViewBodyRow {
    if (row instanceof Group) {
      return new ViewGroupRow(this.rowsContainer, this.ctx, row as Group);
    }
    if (row instanceof GroupTotals) {
      return new ViewGroupTotalsRow(this.rowsContainer, this.ctx, row as GroupTotals);
    }
    if (row) {
      return new ViewDataRow(this.rowsContainer, this.ctx, row as Datum);
    }
    return new ViewVirtialRow(this.rowsContainer, this.ctx);
  }
  //#endregion

  //#region private row position 这里几个方法算的时相对整个滚动区域的位置，假设全部显示/没有滚动条
  protected getRowTop(index: number) {
    return index * this.ctx.options.rowHeight + (index ? 1 : 0);
  }

  protected indexAt(position: number): number {
    let left = 0;
    let l = this.ctx.model.length;
    let right = l - 1;
    let center: number;

    // Binary search
    let r = this.ctx.options.rowHeight;
    if (position === 0) return 0;
    if (position > r * right) return right;

    while (left < right) {
      center = Math.floor((left + right) / 2);

      let top = this.getRowTop(center);
      if (position < top) {
        right = center;
      } else if (position >= top + r) {
        if (left === center) {
          break;
        }
        left = center;
      } else {
        return center;
      }
    }

    return left;
  }

  protected indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.ctx.model.length);
  }
  //#endregion

  dispose() {
    this.header.dispose();
    this.scrollableElement.dispose();
    this.domNode.remove();
    dispose(this.toDispose);
    this.toDispose.length = 0;
  }
}
