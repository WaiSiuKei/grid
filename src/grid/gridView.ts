import { ScrollbarVisibility, ScrollEvent } from 'src/base/common/scrollable';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { addClass, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';
import { ViewRow } from 'src/grid/viewRow';
import { isNumber } from 'src/base/common/types';
import { ViewHeaderRow } from 'src/grid/viewHeader';
import { GridContext } from 'src/grid/girdContext';

export class GridView {

  private static counter: number = 0;
  private instanceId: number;

  private domNode: HTMLElement;
  private body: HTMLElement;
  private rowsContainer: HTMLElement;
  private scrollableElement: ScrollableElement;
  private header: ViewHeaderRow;

  private lastRenderTop: number;
  private lastRenderHeight: number;

  private rowCache: { [key: string]: ViewRow } = Object.create(null);

  constructor(container: HTMLElement,
              private ctx: GridContext
  ) {

    GridView.counter++;
    this.instanceId = GridView.counter;

    this.lastRenderTop = 0;
    this.lastRenderHeight = 0;

    this.createElement(container);
  }

  private createElement(container: HTMLElement) {
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
      this.render(e);
    });

    this.rowsContainer = document.createElement('div');
    this.rowsContainer.className = 'nila-grid-rows';

    this.body.appendChild(this.rowsContainer);
    this.domNode.appendChild(this.header.domNode);
    let body = this.scrollableElement.getDomNode();
    this.domNode.appendChild(body);
    container.appendChild(this.domNode);
    let headerHeight = getContentHeight(this.header.domNode);
    body.style.height = getContentHeight(this.domNode) - headerHeight + 'px';
  }

  public layout(height?: number, width?: number): void {
    let h = height || getContentHeight(this.body);
    this.viewHeight = h;
    this.scrollHeight = this.getContentHeight();
    let w = width || getContentWidth(this.body);
    this.viewWidth = w;
    this.scrollWidth = this.getContentWidth();

    this.render(h, w);
  }

  getContentHeight(): number {
    return this.ctx.model.items.length * this.ctx.options.rowHeight;
  }

  getContentWidth(): number {
    return this.ctx.columns.reduce((acc, col) => acc + (col.width || 80), 0);
  }

  public get viewHeight() {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.height;
  }

  public set viewHeight(height: number) {
    this.scrollableElement.setScrollDimensions({ height });
  }

  private set scrollHeight(scrollHeight: number) {
    scrollHeight = scrollHeight + 10;
    this.scrollableElement.setScrollDimensions({ scrollHeight });
  }

  public get viewWidth(): number {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.width;
  }

  public set viewWidth(viewWidth: number) {
    this.scrollableElement.setScrollDimensions({ width: viewWidth });
  }

  private set scrollWidth(scrollWidth: number) {
    this.scrollableElement.setScrollDimensions({ scrollWidth });
  }

  public get scrollTop(): number {
    const scrollPosition = this.scrollableElement.getScrollPosition();
    return scrollPosition.scrollTop;
  }

  public set scrollTop(scrollTop: number) {
    const scrollHeight = this.getContentHeight() + 10;
    this.scrollableElement.setScrollDimensions({ scrollHeight });
    this.scrollableElement.setScrollPosition({ scrollTop });
  }

  public set scrollLeft(scrollLeft: number) {
    const scrollWidth = this.getContentWidth() + 10;
    this.scrollableElement.setScrollDimensions({ scrollWidth });
    this.scrollableElement.setScrollPosition({ scrollLeft });
  }

  private render(height: number, width: number): void
  private render(e: ScrollEvent): void
  private render(arg1: any, arg2?: any): void {
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

  private insertItemInDOM(index: number): void {
    let row: ViewRow = this.rowCache[index];
    if (!row) {
      row = new ViewRow(this.rowsContainer, index, this.ctx.model.items[index], this.ctx);
      this.rowCache[index] = row;
    }
    if (row.mounted) return;

    let nextRow = this.rowCache[index + 1];

    row.mount(nextRow);
  }

  private removeItemFromDOM(index: number): void {
    let row = this.rowCache[index];
    if (row) {
      row.dispose();
      delete this.rowCache[index];
    }
  }

  private getItemTop(index: number) {
    return index * 20 + (index ? 1 : 0);
  }

  public indexAt(position: number): number {
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

  public indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.ctx.model.items.length);
  }
}
