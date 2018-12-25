import { ViewEventHandler } from 'src/grid/viewModel/viewEventHandler';
import { ViewEventDispatcher } from 'src/grid/view/viewEventDispatcher';
import { ViewContext } from 'src/grid/view/viewContext';
import { createFastDomNode, FastDomNode } from 'src/base/browser/fastDomNode';
import { IDisposable } from 'src/base/common/lifecycle';
import { IViewModel } from 'src/grid/viewModel/viewModel';
import { onUnexpectedError } from 'src/base/common/errors';
import { ViewScrollChangedEvent } from 'src/grid/view/viewEvents';
import { isInDOM, runAtThisOrScheduleAtNextAnimationFrame } from 'src/base/browser/dom';
import { Cursor } from '../controller/cursorImpl';
import { ViewOutgoingEvents } from 'src/grid/view/viewOutgoingEvents';
import { ViewPart } from 'src/grid/view/viewPart';
import { RenderingContext } from 'src/grid/view/renderingContext';
import { IConfiguration } from 'src/grid/gridCommon';

export class View extends ViewEventHandler {

  private eventDispatcher: ViewEventDispatcher;

  private _context: ViewContext;
  private _cursor: Cursor;

  private viewParts: ViewPart[];

  private readonly outgoingEvents: ViewOutgoingEvents;

  // Dom nodes
  private linesContent: FastDomNode<HTMLElement>;
  public domNode: FastDomNode<HTMLElement>;

  // Actual mutable state
  private _renderAnimationFrame: IDisposable | null;

  constructor(
    configuration: IConfiguration,
    model: IViewModel,
    cursor: Cursor,
    outgoingEvents: ViewOutgoingEvents
  ) {
    super();
    this._cursor = cursor;
    this._renderAnimationFrame = null;
    this.outgoingEvents = outgoingEvents;

    // The event dispatcher will always go through _renderOnce before dispatching any events
    this.eventDispatcher = new ViewEventDispatcher((callback: () => void) => this._renderOnce(callback));

    // Ensure the view is the first event handler in order to update the layout
    this.eventDispatcher.addEventHandler(this);

    // The view context is passed on to most classes (basically to reduce param. counts in ctors)
    this._context = new ViewContext(configuration, model, this.eventDispatcher);

    this.viewParts = [];

    this.createViewParts();
    this._setLayout();
  }

  private createViewParts(): void {
    // These two dom nodes must be constructed up front, since references are needed in the layout provider (scrolling & co.)
    this.linesContent = createFastDomNode(document.createElement('div'));
    this.linesContent.setClassName('lines-content' + ' monaco-editor-background');
    this.linesContent.setPosition('absolute');

    this.domNode = createFastDomNode(document.createElement('div'));

  }

  private _flushAccumulatedAndRenderNow(): void {
    this._renderNow();
  }

  private _setLayout(): void {
    // const layoutInfo = this._context.configuration.editor.layoutInfo;
    // this.domNode.setWidth(layoutInfo.width);
    // this.domNode.setHeight(layoutInfo.height);

  }
  // --- begin event handlers

  public onScrollChanged(e: ViewScrollChangedEvent): boolean {
    this.outgoingEvents.emitScrollChanged(e);
    return false;
  }

  // --- end event handlers

  public dispose(): void {
    if (this._renderAnimationFrame !== null) {
      this._renderAnimationFrame.dispose();
      this._renderAnimationFrame = null;
    }

    this.eventDispatcher.removeEventHandler(this);
    this.outgoingEvents.dispose();

    // Destroy view parts
    for (let i = 0, len = this.viewParts.length; i < len; i++) {
      this.viewParts[i].dispose();
    }
    this.viewParts = [];

    super.dispose();
  }

  private _renderOnce(callback: () => any): any {
    let r = safeInvokeNoArg(callback);
    this._scheduleRender();
    return r;
  }

  private _scheduleRender(): void {
    if (this._renderAnimationFrame === null) {
      this._renderAnimationFrame = runAtThisOrScheduleAtNextAnimationFrame(this._onRenderScheduled.bind(this), 100);
    }
  }

  private _onRenderScheduled(): void {
    this._renderAnimationFrame = null;
    this._flushAccumulatedAndRenderNow();
  }

  private _renderNow(): void {
    safeInvokeNoArg(() => this._actualRender());
  }

  private _getViewPartsToRender(): ViewPart[] {
    let result: ViewPart[] = [], resultLen = 0;
    for (let i = 0, len = this.viewParts.length; i < len; i++) {
      let viewPart = this.viewParts[i];
      if (viewPart.shouldRender()) {
        result[resultLen++] = viewPart;
      }
    }
    return result;
  }

  private _actualRender(): void {
    if (!isInDOM(this.domNode.domNode)) {
      return;
    }

    let viewPartsToRender = this._getViewPartsToRender();

    // const partialViewportData = this._context.viewLayout.getLinesViewportData();
    // this._context.model.setViewport(partialViewportData.startLineNumber, partialViewportData.endLineNumber, partialViewportData.centeredLineNumber);

    let renderingContext = new RenderingContext(this._context.viewLayout);

    // Render the rest of the parts
    for (let i = 0, len = viewPartsToRender.length; i < len; i++) {
      let viewPart = viewPartsToRender[i];
      viewPart.prepareRender(renderingContext);
    }

    for (let i = 0, len = viewPartsToRender.length; i < len; i++) {
      let viewPart = viewPartsToRender[i];
      viewPart.render(renderingContext);
      viewPart.onDidRender();
    }
  }

  // --- BEGIN CodeEditor helpers

  public render(now: boolean, everything: boolean): void {
    if (everything) {
      // Force everything to render...
      // TODO: FIXME
      // this.viewLines.forceShouldRender();
      for (let i = 0, len = this.viewParts.length; i < len; i++) {
        let viewPart = this.viewParts[i];
        viewPart.forceShouldRender();
      }
    }
    if (now) {
      this._flushAccumulatedAndRenderNow();
    } else {
      this._scheduleRender();
    }
  }

  // --- END CodeEditor helpers

}

function safeInvokeNoArg(func: Function): any {
  try {
    return func();
  } catch (e) {
    onUnexpectedError(e);
  }
}

function safeInvoke1Arg(func: Function, arg1: any): any {
  try {
    return func(arg1);
  } catch (e) {
    onUnexpectedError(e);
  }
}
