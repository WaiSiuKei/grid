import { ViewPart } from 'src/grid/view/viewPart';
import { SmoothScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { createFastDomNode, FastDomNode } from 'src/base/browser/fastDomNode';
import { ViewContext } from 'src/grid/view/viewContext';
import { ScrollableElementCreationOptions } from 'src/base/browser/ui/scrollbar/scrollableElementOptions';
import { INewScrollPosition } from 'src/base/common/scrollable';
import { addDisposableListener } from 'src/base/browser/dom';
import { IMouseEvent } from 'src/base/browser/mouseEvent';
import { ViewScrollChangedEvent } from 'src/grid/view/viewEvents';
import { RenderingContext } from 'src/grid/view/renderingContext';

export class GridScrollbar extends ViewPart {

  private scrollbar: SmoothScrollableElement;
  private scrollbarDomNode: FastDomNode<HTMLElement>;

  constructor(
    context: ViewContext,
    linesContent: FastDomNode<HTMLElement>,
    viewDomNode: FastDomNode<HTMLElement>,
    overflowGuardDomNode: FastDomNode<HTMLElement>
  ) {
    super(context);

    const editor = this._context.configuration.editor;
    const configScrollbarOpts = editor.viewInfo.scrollbar;

    let scrollbarOptions: ScrollableElementCreationOptions = {
      listenOnDomNode: viewDomNode.domNode,
      className: 'grid-scrollable',
      useShadows: false,
      lazyRender: true,

      vertical: configScrollbarOpts.vertical,
      horizontal: configScrollbarOpts.horizontal,
      verticalScrollbarSize: configScrollbarOpts.verticalScrollbarSize,
      verticalSliderSize: configScrollbarOpts.verticalSliderSize,
      horizontalScrollbarSize: configScrollbarOpts.horizontalScrollbarSize,
      horizontalSliderSize: configScrollbarOpts.horizontalSliderSize,
      handleMouseWheel: configScrollbarOpts.handleMouseWheel,
      mouseWheelScrollSensitivity: configScrollbarOpts.mouseWheelScrollSensitivity,
      fastScrollSensitivity: configScrollbarOpts.fastScrollSensitivity,
    };

    this.scrollbar = this._register(new SmoothScrollableElement(linesContent.domNode, scrollbarOptions, this._context.viewLayout.scrollable));

    this.scrollbarDomNode = createFastDomNode(this.scrollbar.getDomNode());
    this.scrollbarDomNode.setPosition('absolute');
    this._setLayout();

    // When having a zone widget that calls .focus() on one of its dom elements,
    // the browser will try desperately to reveal that dom node, unexpectedly
    // changing the .scrollTop of this.linesContent

    let onBrowserDesperateReveal = (domNode: HTMLElement, lookAtScrollTop: boolean, lookAtScrollLeft: boolean) => {
      let newScrollPosition: INewScrollPosition = {};

      if (lookAtScrollTop) {
        let deltaTop = domNode.scrollTop;
        if (deltaTop) {
          newScrollPosition.scrollTop = this._context.viewLayout.getCurrentScrollTop() + deltaTop;
          domNode.scrollTop = 0;
        }
      }

      if (lookAtScrollLeft) {
        let deltaLeft = domNode.scrollLeft;
        if (deltaLeft) {
          newScrollPosition.scrollLeft = this._context.viewLayout.getCurrentScrollLeft() + deltaLeft;
          domNode.scrollLeft = 0;
        }
      }

      // fixme
      // this._context.viewLayout.setScrollPositionNow(newScrollPosition);
    };

    // I've seen this happen both on the view dom node & on the lines content dom node.
    this._register(addDisposableListener(viewDomNode.domNode, 'scroll', (e: Event) => onBrowserDesperateReveal(viewDomNode.domNode, true, true)));
    this._register(addDisposableListener(linesContent.domNode, 'scroll', (e: Event) => onBrowserDesperateReveal(linesContent.domNode, true, false)));
    this._register(addDisposableListener(overflowGuardDomNode.domNode, 'scroll', (e: Event) => onBrowserDesperateReveal(overflowGuardDomNode.domNode, true, false)));
    this._register(addDisposableListener(this.scrollbarDomNode.domNode, 'scroll', (e: Event) => onBrowserDesperateReveal(this.scrollbarDomNode.domNode, true, false)));
  }

  public dispose(): void {
    super.dispose();
  }

  private _setLayout(): void {
    const layoutInfo = this._context.configuration.editor.layoutInfo;

    this.scrollbarDomNode.setLeft(layoutInfo.contentLeft);

    this.scrollbarDomNode.setWidth(layoutInfo.contentWidth);
    this.scrollbarDomNode.setHeight(layoutInfo.contentHeight);
  }

  public getDomNode(): FastDomNode<HTMLElement> {
    return this.scrollbarDomNode;
  }

  public delegateVerticalScrollbarMouseDown(browserEvent: IMouseEvent): void {
    this.scrollbar.delegateVerticalScrollbarMouseDown(browserEvent);
  }

  // --- begin event handlers

  public onScrollChanged(e: ViewScrollChangedEvent): boolean {
    return true;
  }
  // --- end event handlers

  public prepareRender(ctx: RenderingContext): void {
    // Nothing to do
  }

  public render(ctx: RenderingContext): void {
    this.scrollbar.renderNow();
  }
}
