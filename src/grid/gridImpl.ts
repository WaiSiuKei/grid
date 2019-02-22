import './grid.css';
import { ScrollbarVisibility } from 'src/base/common/scrollable';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { addClasses, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';
import { ViewRow } from 'src/grid/viewRow';
import { isString, isUndefinedOrNull } from 'src/base/common/types';
import { ViewHeaderRow } from 'src/grid/viewHeader';
import { GridContext } from 'src/grid/girdContext';
import { GridModel } from 'src/grid/gridModel';
import { CellFormatter, COLUMN_DEFAULT, GRID_DEFAULT, IGridColumnDefinition, IGridOptions } from 'src/grid/grid';
import { mapBy, sum, sumBy } from 'src/base/common/functional';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { Datum, IDataSet } from 'src/data/data';
import { DataView } from 'src/data/dataView';
import { PatchChange, PatchItem } from 'src/base/common/patch';

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

  protected mountedRows: ViewRow[] = [];

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

  private registerViewListeners() {
    this.toDispose.push(this.scrollableElement.onScroll((e) => {
      if (e.heightChanged || e.scrollHeightChanged || e.scrollTopChanged) {
        this.renderVerticalChanges(e.height, e.scrollTop);
        this.renderHorizonalChanges(e.width, e.scrollLeft);
      } else if (e.widthChanged || e.scrollWidthChanged || e.scrollLeftChanged) {
        this.renderHorizonalChanges(e.width, e.scrollLeft);
      }
    }));
  }

  private registerDataListeners(ds: DataView) {
    this.toDispose.push(ds.onRowsChanged((evt) => {
      console.log('rowsChanged', evt);
      let reRenderHappened = false;
      for (let i = 0, len = evt.length; i < len; i++) {
        reRenderHappened = this.patchChanges(evt[i]);
      }
      if (reRenderHappened) {
        this.renderHorizonalChanges(getContentWidth(this.body));
      }
    }));
  }

  public render() {
    this.layout();
    if (!this.viewEventRegistered) {
      this.registerViewListeners();
    }
  }

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

    this.renderVerticalChanges(h);
    this.renderHorizonalChanges(w);
  }

  getTotalRowsHeight(): number {
    return this.ctx.model.length * this.ctx.options.rowHeight;
  }

  getContentWidth(): number {
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

  private lastIndexOfFirstMountedRow = -1;
  private lastIndexOfLastMountedRow = -1;
  private renderVerticalChanges(viewHeight: number, scrollTop = 0): void {
    if (!viewHeight) return;
    console.log('start', this.lastIndexOfFirstMountedRow, this.lastIndexOfLastMountedRow);

    let renderTop = scrollTop;
    let renderBottom = scrollTop + viewHeight;
    console.log('scrollTop=', scrollTop, 'renderBottom=', renderBottom);
    let shouldFrom = this.indexAt(renderTop);
    let shouldTo = this.indexAt(renderBottom);
    if (shouldFrom === this.lastIndexOfFirstMountedRow && shouldTo === this.lastIndexOfLastMountedRow) return;

    console.log('shouldFrom=', shouldFrom, 'shouldTo=', shouldTo);
    let indexOfFirstRowToGrowDown = -1;
    let indexOfFirstRowToGrowUp = -1;

    if (this.lastIndexOfLastMountedRow < shouldTo) {
      // 向下滚，下边需要填充
      indexOfFirstRowToGrowDown = this.lastIndexOfLastMountedRow + 1;
    } else {
      // 向上滚，去掉多余的
      let i = this.lastIndexOfLastMountedRow;
      while (i > shouldTo && this.mountedRows.length) {
        // console.log('remove', i, shouldTo);
        this.mountedRows.pop().dispose();
        i--;
      }
    }

    if (this.lastIndexOfFirstMountedRow > shouldFrom) {
      // 向上滚，上面需要填充
      indexOfFirstRowToGrowUp = this.lastIndexOfFirstMountedRow - 1;
    } else {
      // 向下滚，去掉多余的
      let i = this.lastIndexOfFirstMountedRow;
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

    console.log('indexOfFirstRowToGrowDown=', indexOfFirstRowToGrowDown, 'indexOfFirstRowToGrowUp=', indexOfFirstRowToGrowUp);
    while (indexOfFirstRowToGrowDown > -1 && indexOfFirstRowToGrowDown <= shouldTo) {
      let r = new ViewRow(this.rowsContainer, this.ctx.model.get(indexOfFirstRowToGrowDown), this.ctx);
      if (!this.mountedRows.length) {
        r.mountBefore(null);
      } else {
        r.mountAfter(this.mountedRows[this.mountedRows.length - 1]);
      }
      this.mountedRows.push(r);
      indexOfFirstRowToGrowDown++;
    }

    while (indexOfFirstRowToGrowUp > -1 && indexOfFirstRowToGrowUp >= shouldFrom) {
      let r = new ViewRow(this.rowsContainer, this.ctx.model.get(indexOfFirstRowToGrowUp), this.ctx);
      if (this.mountedRows.length) {
        r.mountBefore(this.mountedRows[0]);
      } else {
        r.mountBefore(null);
      }
      this.mountedRows.unshift(r);
      indexOfFirstRowToGrowUp--;
    }

    this.lastIndexOfLastMountedRow = shouldTo;
    this.lastIndexOfFirstMountedRow = shouldFrom;
    let r = this.ctx.options.rowHeight;
    let transform = this.getRowTop(shouldFrom) - renderTop;
    this.rowsContainer.style.top = clamp(transform, r, -r) + 'px';
    console.log('end', this.lastIndexOfFirstMountedRow, this.lastIndexOfLastMountedRow);
  }

  private memorizedMounted: string[];
  private memorizedMargin: number;
  private renderHorizonalChanges(viewWidth: number, scrollLeft = 0) {
    let { mounted, margin } = this.header.render(scrollLeft, viewWidth);
    this.memorizedMargin = margin;
    this.memorizedMounted = mounted;
    for (let i = 0, len = this.mountedRows.length; i < len; i++) {
      this.mountedRows[i].updateCell(mounted, margin);
    }
  }

  private renderRow(row: ViewRow): void {
    if (isUndefinedOrNull(this.memorizedMounted) || isUndefinedOrNull(this.memorizedMargin)) throw new Error('not ready');
    row.updateCell(this.memorizedMounted, this.memorizedMargin);
  }

  private patchChanges(patch: PatchItem<Datum>): boolean {
    switch (patch.type) {
      case PatchChange.Add:
        return this.handleAdding(patch);
      case PatchChange.Remove:
        return this.handleRemoval(patch);
    }
    return false;
  }

  private handleRemoval(patch: PatchItem<Datum>): boolean {
    if (this.lastIndexOfFirstMountedRow === -1 && this.lastIndexOfLastMountedRow === -1) {
      return false;
    }

    if (patch.newPos >= this.lastIndexOfFirstMountedRow && patch.newPos <= this.lastIndexOfLastMountedRow) {
      while (this.lastIndexOfLastMountedRow < patch.newPos) {
        this.mountedRows.pop().dispose();
        this.lastIndexOfLastMountedRow--;
      }
      this.scrollHeight = this.getTotalRowsHeight();
      return true;
    }

    return false;
  }

  private handleAdding(patch: PatchItem<Datum>): boolean {
    if (this.lastIndexOfFirstMountedRow === -1 && this.lastIndexOfLastMountedRow === -1) {
      this.scrollHeight = this.getTotalRowsHeight();
      return true;
    }
    if (patch.newPos > this.lastIndexOfLastMountedRow) {
      this.scrollHeight = this.getTotalRowsHeight();
      return false;
    }
    if (patch.newPos >= this.lastIndexOfFirstMountedRow && patch.newPos <= this.lastIndexOfLastMountedRow) {
      let maxItemToDisplay = this.viewHeight / this.ctx.options.rowHeight;
      let count = Math.min(this.lastIndexOfLastMountedRow - patch.newPos + 1, patch.items.length);
      if (this.lastIndexOfLastMountedRow + patch.items.length > maxItemToDisplay) {
        let i = count;
        while (i) {
          i--;
          this.mountedRows.pop().dispose();
        }
      } else {
        this.lastIndexOfLastMountedRow = this.lastIndexOfLastMountedRow + patch.items.length;
      }
      let i = 0;
      while (i < count) {
        let r = new ViewRow(this.rowsContainer, this.ctx.model.get(patch.newPos + i), this.ctx);
        this.renderRow(r);
        let index = patch.newPos + i;
        r.mountBefore(this.mountedRows[index]);
        this.mountedRows.splice(index, 0,);
        i++;
      }
      this.scrollHeight = this.getTotalRowsHeight();
      return false;
    }
    return false;
  }

  // DOM changes

  protected getRowTop(index: number) {
    return index * this.ctx.options.rowHeight + (index ? 1 : 0);
  }

  protected getRowBottom(index: number) {
    return (index + 1) * this.ctx.options.rowHeight;
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

  dispose() {
    this.header.dispose();
    this.scrollableElement.dispose();
    this.domNode.remove();
    dispose(this.toDispose);
    this.toDispose.length = 0;
  }
}
