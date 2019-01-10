import { ScrollbarVisibility, ScrollEvent } from 'src/base/common/scrollable';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { addClass, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';
import { ViewRow } from 'src/grid/viewRow';
import { isNumber, isUndefinedOrNull } from 'src/base/common/types';
import { ViewHeaderRow } from 'src/grid/viewHeader';
import { GridContext } from 'src/grid/girdContext';
import { GridModel } from 'src/grid/gridModel';
import { CellFormatter, COLUMN_DEFAULT, GRID_DEFAULT, IDataSource, IGridColumnDefinition, IGridOptions } from 'src/grid/grid';
import { mapBy, sum, sumBy } from 'src/base/common/functional';
import { IDisposable } from 'src/base/common/lifecycle';

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

export class GridView implements IDisposable {
  protected ctx: GridContext;

  protected static counter: number = 0;
  protected instanceId: number;

  protected domNode: HTMLElement;
  protected body: HTMLElement;
  protected rowsContainer: HTMLElement;
  protected scrollableElement: ScrollableElement;
  protected header: ViewHeaderRow;

  protected lastRenderTop: number;
  protected lastRenderHeight: number;

  protected rowCache: { [key: string]: ViewRow } = Object.create(null);

  private shouldShowHorizonalScrollbar = false;
  private shouldShowVerticalScrollbar = false;

  constructor(protected container: HTMLElement, ds: IDataSource, col: Array<Partial<IGridColumnDefinition>>, options: Partial<IGridOptions> = {}) {
    let opt = validateAndEnforceOptions(options);
    let model = new GridModel(ds);
    let columns = validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth, opt.defaultFormatter);
    resolvingColumnWidths(columns, container.clientWidth);
    this.ctx = new GridContext(model, columns, opt);

    GridView.counter++;
    this.instanceId = GridView.counter;

    this.lastRenderTop = 0;
    this.lastRenderHeight = 0;

    this.createElement(container);

    if (this.ctx.options.explicitInitialization) {
      this.layout();
    }
  }

  public render() {
    this.layout();
  }

  protected createElement(container: HTMLElement) {
    this.domNode = document.createElement('div');
    this.domNode.className = `nila-grid nila-grid-instance-${this.instanceId}`;

    this.header = new ViewHeaderRow(this.ctx);

    this.body = document.createElement('div');
    this.body.className = 'nila-grid-body';
    this.scrollableElement = new ScrollableElement(this.body, {
      alwaysConsumeMouseWheel: true,
      horizontal: ScrollbarVisibility.Visible,
      vertical: ScrollbarVisibility.Visible,
    });

    this.scrollableElement.onScroll((e) => {
      this._render(e);
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
    this.scrollHeight = this.getTotalRowsHeight();
    let w = width || getContentWidth(this.body);
    if (w > this.container.clientWidth) this.shouldShowHorizonalScrollbar = true;
    this.viewWidth = w;
    this.scrollWidth = this.getContentWidth();

    this._render(h, w);
  }

  getTotalRowsHeight(): number {
    return this.ctx.model.items.length * this.ctx.options.rowHeight;
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

  protected _render(height: number, width: number): void
  protected _render(e: ScrollEvent): void
  protected _render(arg1: any, arg2?: any): void {
    let scrollTop = 0;
    let scrollLeft = 0;
    let viewHeight: number;
    let viewWidth: number;
    let hasVerticalDelta = false;
    if (isNumber(arg1)) {
      viewHeight = arg1;
      viewWidth = arg2;
      hasVerticalDelta = true;
    } else {
      let e = arg1 as ScrollEvent;
      scrollTop = e.scrollTop;
      scrollLeft = e.scrollLeft;
      viewHeight = e.height;
      viewWidth = e.width;
      hasVerticalDelta = e.scrollHeightChanged || e.scrollTopChanged || e.heightChanged;
    }

    if (!viewHeight) return;

    if (hasVerticalDelta) {
      let i: number;
      let stop: number;

      let renderTop = scrollTop;
      let renderBottom = scrollTop + viewHeight;
      let thisRenderBottom = this.lastRenderTop + this.lastRenderHeight;

      // when view scrolls down, start rendering from the renderBottom
      for (i = this.indexAfter(renderBottom) - 1, stop = this.indexAt(Math.max(thisRenderBottom, renderTop)); i >= stop; i--) {
        this.insertItemInDOM(i);
      }

      // when view scrolls up, start rendering from either this.renderTop or renderBottom
      for (i = Math.min(this.indexAt(this.lastRenderTop), this.indexAfter(renderBottom)) - 1, stop = this.indexAt(renderTop); i >= stop; i--) {
        this.insertItemInDOM(i);
      }

      // when view scrolls down, start unrendering from renderTop
      for (i = this.indexAt(this.lastRenderTop), stop = Math.min(this.indexAt(renderTop), this.indexAfter(thisRenderBottom)); i < stop; i++) {
        this.removeItemFromDOM(i);
      }

      // when view scrolls up, start unrendering from either renderBottom this.renderTop
      for (i = Math.max(this.indexAfter(renderBottom), this.indexAt(this.lastRenderTop)), stop = this.indexAfter(thisRenderBottom); i < stop; i++) {
        this.removeItemFromDOM(i);
      }

      let topItem = this.indexAt(renderTop);

      let t = (this.getItemTop(topItem) - renderTop);
      let r = this.ctx.options.rowHeight;
      this.rowsContainer.style.top = clamp(t, r, -r) + 'px';

      this.lastRenderTop = renderTop;
      this.lastRenderHeight = renderBottom - renderTop;
    }

    let { mounted, margin } = this.header.render(scrollLeft, viewWidth);
    for (let index in this.rowCache) {
      let row: ViewRow = this.rowCache[index];
      row.updateCell(mounted, margin);
    }
  }

  // DOM changes

  protected insertItemInDOM(index: number): void {
    let row: ViewRow = this.rowCache[index];
    if (!row) {
      row = new ViewRow(this.rowsContainer, index, this.ctx.model.items[index], this.ctx);
      this.rowCache[index] = row;
    }
    if (row.mounted) return;

    let nextRow = this.rowCache[index + 1];

    row.mount(nextRow);
  }

  protected removeItemFromDOM(index: number): void {
    let row = this.rowCache[index];
    if (row) {
      row.dispose();
      delete this.rowCache[index];
    }
  }

  protected getItemTop(index: number) {
    return index * 20 + (index ? 1 : 0);
  }

  protected indexAt(position: number): number {
    let left = 0;
    let l = this.ctx.model.items.length;
    let right = l - 1;
    let center: number;

    // Binary search
    let r = this.ctx.options.rowHeight;
    while (left < right) {
      center = Math.floor((left + right) / 2);

      let top = this.getItemTop(center);
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

    return l;
  }

  protected indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.ctx.model.items.length);
  }

  dispose() {
    this.header.dispose();
    Object.keys(this.rowCache).forEach(k => {
      this.rowCache[k].dispose();
      delete this.rowCache[k];
    });
    this.scrollableElement.dispose();
    this.domNode.remove();
  }
}
