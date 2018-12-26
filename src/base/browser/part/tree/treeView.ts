import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { HeightMap, IViewItem } from 'src/base/browser/part/tree/treeViewModel';
import { IInputEvent, Item, TreeModel } from 'src/base/browser/part/tree/treeModel';
import { createStyleSheet, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { ITreeContext } from 'src/base/browser/part/tree/tree';
import { ScrollbarVisibility } from 'src/base/common/scrollable';
import { Delayer } from 'src/base/common/async';

export interface IRow {
  element: HTMLElement;
  templateId: string;
  templateData: any;
}

function removeFromParent(element: HTMLElement): void {
  try {
    element.parentElement.removeChild(element);
  } catch (e) {
    // this will throw if this happens due to a blur event, nasty business
  }
}

export class RowCache implements IDisposable {

  private _cache: { [templateId: string]: IRow[]; };

  constructor(private context: ITreeContext) {
    this._cache = { '': [] };
  }

  public alloc(templateId: string): IRow {
    let result = this.cache(templateId).pop();

    if (!result) {
      let content = document.createElement('div');
      content.className = 'content';

      let row = document.createElement('div');
      row.appendChild(content);

      let templateData: any = null;

      try {
        templateData = this.context.renderer.renderTemplate(this.context.tree, templateId, content);
      } catch (err) {
        console.error('Tree usage error: exception while rendering template');
        console.error(err);
      }

      result = {
        element: row,
        templateId: templateId,
        templateData
      };
    }

    return result;
  }

  public release(templateId: string, row: IRow): void {
    removeFromParent(row.element);
    this.cache(templateId).push(row);
  }

  private cache(templateId: string): IRow[] {
    return this._cache[templateId] || (this._cache[templateId] = []);
  }

  public garbageCollect(): void {
    if (this._cache) {
      Object.keys(this._cache).forEach(templateId => {
        this._cache[templateId].forEach(cachedRow => {
          this.context.renderer.disposeTemplate(this.context.tree, templateId, cachedRow.templateData);
          cachedRow.element = null;
          cachedRow.templateData = null;
        });

        delete this._cache[templateId];
      });
    }
  }

  public dispose(): void {
    this.garbageCollect();
    this._cache = null;
    this.context = null;
  }
}

export interface IViewContext extends ITreeContext {
  cache: RowCache;
  horizontalScrolling: boolean;
}

export class ViewItem implements IViewItem {

  private context: IViewContext;

  public model: Item;
  public id: string;
  protected row: IRow;

  public top: number;
  public height: number;
  public width: number = 0;

  public needsRender: boolean;
  public uri: string;
  public unbindDragStart: IDisposable;
  public loadingTimer: any;

  public _styles: any;
  private _draggable: boolean;

  constructor(context: IViewContext, model: Item) {
    this.context = context;
    this.model = model;

    this.id = this.model.id;
    this.row = null;

    this.top = 0;
    this.height = model.getHeight();

    this._styles = {};
  }

  public get element(): HTMLElement {
    return this.row && this.row.element;
  }

  private _templateId: string;
  private get templateId(): string {
    return this._templateId || (this._templateId = (this.context.renderer.getTemplateId && this.context.renderer.getTemplateId(this.context.tree, this.model.getElement())));
  }

  public addClass(name: string): void {
    this._styles[name] = true;
    this.render(true);
  }

  public removeClass(name: string): void {
    delete this._styles[name]; // is this slow?
    this.render(true);
  }

  public render(skipUserRender = false): void {
    if (!this.model || !this.element) {
      return;
    }

    let classes = ['monaco-tree-row'];
    classes.push.apply(classes, Object.keys(this._styles));

    this.element.className = classes.join(' ');
    this.element.style.height = this.height + 'px';

    if (!skipUserRender && this.element) {
      let paddingLeft: number | undefined;
      if (this.context.horizontalScrolling) {
        const style = window.getComputedStyle(this.element);
        paddingLeft = parseFloat(style.paddingLeft);
      }

      if (this.context.horizontalScrolling) {
        this.element.style.width = 'fit-content';
      }

      try {
        this.context.renderer.renderElement(this.context.tree, this.model.getElement(), this.templateId, this.row.templateData);
      } catch (err) {
        console.error('Tree usage error: exception while rendering element');
        console.error(err);
      }

      if (this.context.horizontalScrolling) {
        this.width = getContentWidth(this.element) + paddingLeft;
        this.element.style.width = '';
      }
    }
  }

  updateWidth(): any {
    if (!this.context.horizontalScrolling || !this.element) {
      return;
    }

    const style = window.getComputedStyle(this.element);
    const paddingLeft = parseFloat(style.paddingLeft);
    this.element.style.width = 'fit-content';
    this.width = getContentWidth(this.element) + paddingLeft;
    this.element.style.width = '';
  }

  public insertInDOM(container: HTMLElement, afterElement: HTMLElement): void {
    if (!this.row) {
      this.row = this.context.cache.alloc(this.templateId);

      // used in reverse lookup from HTMLElement to Item
      (<any>this.element)[TreeView.BINDING] = this;
    }

    if (this.element.parentElement) {
      return;
    }

    if (afterElement === null) {
      container.appendChild(this.element);
    } else {
      try {
        container.insertBefore(this.element, afterElement);
      } catch (e) {
        console.warn('Failed to locate previous tree element');
        container.appendChild(this.element);
      }
    }

    this.render();
  }

  public removeFromDOM(): void {
    if (!this.row) {
      return;
    }

    if (this.unbindDragStart) {
      this.unbindDragStart.dispose();
      this.unbindDragStart = null;
    }

    this.uri = null;

    (<any>this.element)[TreeView.BINDING] = null;
    this.context.cache.release(this.templateId, this.row);
    this.row = null;
  }

  public dispose(): void {
    this.row = null;
    this.model = null;
  }
}

class RootViewItem extends ViewItem {

  constructor(context: IViewContext, model: Item, wrapper: HTMLElement) {
    super(context, model);

    this.row = {
      element: wrapper,
      templateData: null,
      templateId: null
    };
  }

  public render(): void {
    if (!this.model || !this.element) {
      return;
    }

    let classes = ['monaco-tree-wrapper'];
    classes.push.apply(classes, Object.keys(this._styles));

    this.element.className = classes.join(' ');
  }

  public insertInDOM(container: HTMLElement, afterElement: HTMLElement): void {
    // noop
  }

  public removeFromDOM(): void {
    // noop
  }
}

export class TreeView extends HeightMap {

  static BINDING = 'monaco-tree-row';

  private static counter: number = 0;
  private instance: number;

  private context: IViewContext;
  private modelListeners: IDisposable[];
  private model: TreeModel;

  private viewListeners: IDisposable[];
  private domNode: HTMLElement;
  private wrapper: HTMLElement;
  private styleElement: HTMLStyleElement;
  private rowsContainer: HTMLElement;
  private scrollableElement: ScrollableElement;

  private horizontalScrolling: boolean;
  private contentWidthUpdateDelayer = new Delayer<void>(50);

  private lastRenderTop: number;
  private lastRenderHeight: number;

  private inputItem: ViewItem;
  private items: { [id: string]: ViewItem; };

  private isRefreshing = false;
  private onHiddenScrollTop: number;

  constructor(context: ITreeContext, container: HTMLElement) {
    super();

    TreeView.counter++;
    this.instance = TreeView.counter;

    const horizontalScrollMode = typeof context.options.horizontalScrollMode === 'undefined' ? ScrollbarVisibility.Hidden : context.options.horizontalScrollMode;
    this.horizontalScrolling = horizontalScrollMode !== ScrollbarVisibility.Hidden;

    this.context = {
      dataSource: context.dataSource,
      renderer: context.renderer,
      tree: context.tree,
      options: context.options,
      cache: new RowCache(context),
      horizontalScrolling: this.horizontalScrolling
    };

    this.modelListeners = [];
    this.viewListeners = [];

    this.model = null;
    this.items = {};

    this.domNode = document.createElement('div');
    this.domNode.className = `monaco-tree no-focused-item monaco-tree-instance-${this.instance}`;
    // to allow direct tabbing into the tree instead of first focusing the tree

    this.styleElement = createStyleSheet(this.domNode);

    // ARIA
    this.domNode.setAttribute('role', 'tree');

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'monaco-tree-wrapper';
    this.scrollableElement = new ScrollableElement(this.wrapper, {
      alwaysConsumeMouseWheel: true,
      horizontal: horizontalScrollMode,
      vertical: (typeof context.options.verticalScrollMode !== 'undefined' ? context.options.verticalScrollMode : ScrollbarVisibility.Auto),
    });
    this.scrollableElement.onScroll((e) => {
      this.render(e.scrollTop, e.height, e.scrollLeft, e.width, e.scrollWidth);
    });

    this.rowsContainer = document.createElement('div');
    this.rowsContainer.className = 'monaco-tree-rows';

    this.wrapper.appendChild(this.rowsContainer);
    this.domNode.appendChild(this.scrollableElement.getDomNode());
    container.appendChild(this.domNode);

    this.lastRenderTop = 0;
    this.lastRenderHeight = 0;

    this.onHiddenScrollTop = null;

    this.onRowsChanged();
    this.layout();
  }

  protected createViewItem(item: Item): IViewItem {
    return new ViewItem(this.context, item);
  }

  public getHTMLElement(): HTMLElement {
    return this.domNode;
  }

  public focus(): void {
    this.domNode.focus();
  }

  public isFocused(): boolean {
    return document.activeElement === this.domNode;
  }

  public blur(): void {
    this.domNode.blur();
  }

  public onVisible(): void {
    this.scrollTop = this.onHiddenScrollTop;
    this.onHiddenScrollTop = null;
  }

  public onHidden(): void {
    this.onHiddenScrollTop = this.scrollTop;
  }

  private isTreeVisible(): boolean {
    return this.onHiddenScrollTop === null;
  }

  public layout(height?: number, width?: number): void {
    if (!this.isTreeVisible()) {
      return;
    }

    this.viewHeight = height || getContentHeight(this.wrapper); // render
    this.scrollHeight = this.getContentHeight();

    if (this.horizontalScrolling) {
      this.viewWidth = width || getContentWidth(this.wrapper);
    }
  }

  public getFirstVisibleElement(): any {
    const firstIndex = this.indexAt(this.lastRenderTop);
    let item = this.itemAtIndex(firstIndex);
    if (!item) {
      return item;
    }

    const itemMidpoint = item.top + item.height / 2;
    if (itemMidpoint < this.scrollTop) {
      const nextItem = this.itemAtIndex(firstIndex + 1);
      item = nextItem || item;
    }

    return item.model.getElement();
  }

  public getLastVisibleElement(): any {
    const item = this.itemAtIndex(this.indexAt(this.lastRenderTop + this.lastRenderHeight - 1));
    return item && item.model.getElement();
  }

  private render(scrollTop: number, viewHeight: number, scrollLeft: number, viewWidth: number, scrollWidth: number): void {
    let i: number;
    let stop: number;

    let renderTop = scrollTop;
    let renderBottom = scrollTop + viewHeight;
    let thisRenderBottom = this.lastRenderTop + this.lastRenderHeight;

    // when view scrolls down, start rendering from the renderBottom
    for (i = this.indexAfter(renderBottom) - 1, stop = this.indexAt(Math.max(thisRenderBottom, renderTop)); i >= stop; i--) {
      this.insertItemInDOM(<ViewItem>this.itemAtIndex(i));
    }

    // when view scrolls up, start rendering from either this.renderTop or renderBottom
    for (i = Math.min(this.indexAt(this.lastRenderTop), this.indexAfter(renderBottom)) - 1, stop = this.indexAt(renderTop); i >= stop; i--) {
      this.insertItemInDOM(<ViewItem>this.itemAtIndex(i));
    }

    // when view scrolls down, start unrendering from renderTop
    for (i = this.indexAt(this.lastRenderTop), stop = Math.min(this.indexAt(renderTop), this.indexAfter(thisRenderBottom)); i < stop; i++) {
      this.removeItemFromDOM(<ViewItem>this.itemAtIndex(i));
    }

    // when view scrolls up, start unrendering from either renderBottom this.renderTop
    for (i = Math.max(this.indexAfter(renderBottom), this.indexAt(this.lastRenderTop)), stop = this.indexAfter(thisRenderBottom); i < stop; i++) {
      this.removeItemFromDOM(<ViewItem>this.itemAtIndex(i));
    }

    let topItem = this.itemAtIndex(this.indexAt(renderTop));

    if (topItem) {
      this.rowsContainer.style.top = (topItem.top - renderTop) + 'px';
    }

    if (this.horizontalScrolling) {
      this.rowsContainer.style.left = -scrollLeft + 'px';
      this.rowsContainer.style.width = `${Math.max(scrollWidth, viewWidth)}px`;
    }

    this.lastRenderTop = renderTop;
    this.lastRenderHeight = renderBottom - renderTop;
  }

  public setModel(newModel: TreeModel): void {
    this.releaseModel();
    this.model = newModel;

    this.model.onSetInput(this.onClearingInput, this, this.modelListeners);
    this.model.onDidSetInput(this.onSetInput, this, this.modelListeners);
  }

  private onRowsChanged(scrollTop: number = this.scrollTop): void {
    if (this.isRefreshing) {
      return;
    }

    this.scrollTop = scrollTop;
    this.updateScrollWidth();
  }

  private updateScrollWidth(): void {
    if (!this.horizontalScrolling) {
      return;
    }

    this.contentWidthUpdateDelayer.trigger(() => {
      const keys = Object.keys(this.items);
      let scrollWidth = 0;

      for (const key of keys) {
        scrollWidth = Math.max(scrollWidth, this.items[key].width);
      }

      this.scrollWidth = scrollWidth + 10 /* scrollbar */;
    });
  }

  public get viewHeight() {
    const scrollDimensions = this.scrollableElement.getScrollDimensions();
    return scrollDimensions.height;
  }

  public set viewHeight(height: number) {
    this.scrollableElement.setScrollDimensions({ height });
  }

  private set scrollHeight(scrollHeight: number) {
    scrollHeight = scrollHeight + (this.horizontalScrolling ? 10 : 0);
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
    const scrollHeight = this.getContentHeight() + (this.horizontalScrolling ? 10 : 0);
    this.scrollableElement.setScrollDimensions({ scrollHeight });
    this.scrollableElement.setScrollPosition({ scrollTop });
  }

  public getScrollPosition(): number {
    const height = this.getContentHeight() - this.viewHeight;
    return height <= 0 ? 1 : this.scrollTop / height;
  }

  public setScrollPosition(pos: number): void {
    const height = this.getContentHeight() - this.viewHeight;
    this.scrollTop = height * pos;
  }

  // Events

  private onClearingInput(e: IInputEvent): void {
    let item = <Item>e.item;
    if (item) {
      this.onRowsChanged();
    }
  }

  private onSetInput(e: IInputEvent): void {
    this.context.cache.garbageCollect();
    this.inputItem = new RootViewItem(this.context, <Item>e.item, this.wrapper);
  }

  public updateWidth(item: Item): void {
    if (!item || !item.isVisible()) {
      return;
    }

    const viewItem = this.items[item.id];

    if (!viewItem) {
      return;
    }

    viewItem.updateWidth();
    this.updateScrollWidth();
  }

  public getRelativeTop(item: Item): number {
    if (item && item.isVisible()) {
      let viewItem = this.items[item.id];
      if (viewItem) {
        return (viewItem.top - this.scrollTop) / (this.viewHeight - viewItem.height);
      }
    }
    return -1;
  }

  // HeightMap "events"
  public onRefreshItem(item: ViewItem, needsRender = false): void {
    item.needsRender = item.needsRender || needsRender;
    this.refreshViewItem(item);
  }

  public onRemoveItem(item: ViewItem): void {
    this.removeItemFromDOM(item);
    item.dispose();
    delete this.items[item.id];
  }

  // ViewItem refresh

  private refreshViewItem(item: ViewItem): void {
    item.render();

    if (this.shouldBeRendered(item)) {
      this.insertItemInDOM(item);
    } else {
      this.removeItemFromDOM(item);
    }
  }

  // DOM changes

  private insertItemInDOM(item: ViewItem): void {
    let elementAfter: HTMLElement | null = null;
    let itemAfter = <ViewItem>this.itemAfter(item);

    if (itemAfter && itemAfter.element) {
      elementAfter = itemAfter.element;
    }

    item.insertInDOM(this.rowsContainer, elementAfter);
  }

  private removeItemFromDOM(item: ViewItem): void {
    if (!item) {
      return;
    }

    item.removeFromDOM();
  }

  // Helpers

  private shouldBeRendered(item: ViewItem): boolean {
    return item.top < this.lastRenderTop + this.lastRenderHeight && item.top + item.height > this.lastRenderTop;
  }

  private getItemAround(element: HTMLElement): ViewItem {
    let candidate: ViewItem = this.inputItem;
    do {
      if ((<any>element)[TreeView.BINDING]) {
        candidate = (<any>element)[TreeView.BINDING];
      }

      if (element === this.wrapper || element === this.domNode) {
        return candidate;
      }

      if (element === this.scrollableElement.getDomNode() || element === document.body) {
        return null;
      }
    } while (element = element.parentElement);
    return undefined;
  }

  // Cleanup

  private releaseModel(): void {
    if (this.model) {
      this.modelListeners = dispose(this.modelListeners);
      this.model = null;
    }
  }

  public dispose(): void {
    this.scrollableElement.dispose();

    this.releaseModel();
    this.modelListeners = null;

    this.viewListeners = dispose(this.viewListeners);

    if (this.domNode.parentNode) {
      this.domNode.parentNode.removeChild(this.domNode);
    }
    this.domNode = null;

    if (this.items) {
      Object.keys(this.items).forEach(key => this.items[key].removeFromDOM());
      this.items = null;
    }

    if (this.context.cache) {
      this.context.cache.dispose();
      this.context.cache = null;
    }

    super.dispose();
  }
}
