import { ScrollbarVisibility } from 'src/base/common/scrollable';
import { Item, TreeModel } from 'src/grid/treeModel';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { addClass, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { clamp } from 'src/base/common/number';

const RowHeight = 20;

export class TreeView {

  private static counter: number = 0;
  private instanceId: number;

  private model: TreeModel;

  private domNode: HTMLElement;
  private wrapper: HTMLElement;
  private rowsContainer: HTMLElement;
  private scrollableElement: ScrollableElement;

  private lastRenderTop: number;
  private lastRenderHeight: number;

  constructor(container: HTMLElement, model: TreeModel) {

    TreeView.counter++;
    this.instanceId = TreeView.counter;

    this.model = model;

    this.lastRenderTop = 0;
    this.lastRenderHeight = 0;

    this.createElement(container);
  }

  private createElement(container: HTMLElement) {
    this.domNode = document.createElement('div');
    this.domNode.className = `nila-grid nila-grid-instance-${this.instanceId}`;
    // to allow direct tabbing into the tree instead of first focusing the tree

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'nila-grid-wrapper';
    this.scrollableElement = new ScrollableElement(this.wrapper, {
      alwaysConsumeMouseWheel: true,
      horizontal: ScrollbarVisibility.Visible,
      vertical: ScrollbarVisibility.Visible,
    });

    this.scrollableElement.onScroll((e) => {
      this.render(e.scrollTop, e.height);
    });

    this.rowsContainer = document.createElement('div');
    this.rowsContainer.className = 'nila-grid-rows';

    this.wrapper.appendChild(this.rowsContainer);
    this.domNode.appendChild(this.scrollableElement.getDomNode());
    container.appendChild(this.domNode);
  }

  public layout(height?: number, width?: number): void {
    let h = height || getContentHeight(this.wrapper);
    this.viewHeight = h;
    this.scrollHeight = this.getContentHeight();
    let w = width || getContentWidth(this.wrapper);
    this.viewWidth = w;
    this.scrollWidth = this.getContentWidth();

    this.render(0, h);
  }

  getContentHeight(): number {
    return this.model.items.length * RowHeight;
  }

  getContentWidth(): number {
    return 700;
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

  private render(scrollTop: number, viewHeight: number,): void {

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

    if (topItem) {
      let t = (this.getItemTop(topItem) - renderTop);
      this.rowsContainer.style.top = clamp(t, RowHeight, 0) + 'px';
    }

    // this.rowsContainer.style.left = -scrollLeft + 'px';
    // this.rowsContainer.style.width = `${Math.max(scrollWidth, viewWidth)}px`;

    this.lastRenderTop = renderTop;
    this.lastRenderHeight = renderBottom - renderTop;
  }

  // DOM changes

  private insertItemInDOM(index: number): void {
    let existed = this.rowsContainer.querySelector(`div[data-row='${index}']`);
    if (existed) return;

    let d = document.createElement('div');
    addClass(d, 'nila-grid-row');
    d.dataset.row = index.toString();
    d.innerText = index.toString();
    d.style.height = RowHeight + 'px';
    let next = this.rowsContainer.querySelector(`div[data-row='${index + 1}']`);
    if (next) {
      this.rowsContainer.insertBefore(d, next);
    } else {
      this.rowsContainer.appendChild(d);
    }
  }

  private removeItemFromDOM(index: number): void {
    let d = this.rowsContainer.querySelector(`div[data-row='${index}']`);
    if (d) {
      d.remove();
    }
  }

  public itemAt(position: number): string {
    return this.model.items[this.indexAt(position)].id;
  }

  private getItemTop(index: number) {
    return index * 20 + (index ? 1 : 0);
  }

  public indexAt(position: number): number {
    var left = 0;
    var right = this.model.items.length - 1;
    var center: number;

    // Binary search
    while (left < right) {
      center = Math.floor((left + right) / 2);

      let top = this.getItemTop(center);
      if (position < top) {
        right = center;
      } else if (position >= top + RowHeight) {
        if (left === center) {
          break;
        }
        left = center;
      } else {
        return center;
      }
    }

    return this.model.items.length;
  }

  public indexAfter(position: number): number {
    return Math.min(this.indexAt(position) + 1, this.model.items.length);
  }
}
