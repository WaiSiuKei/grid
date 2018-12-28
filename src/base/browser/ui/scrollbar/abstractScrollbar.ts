import './scrollbars.css';

import * as dom from 'src/base/browser/dom';
import { GlobalMouseMoveMonitor, IStandardMouseMoveEventData, standardMouseMoveMerger } from 'src/base/browser/globalMouseMoveMonitor';
import { IMouseEvent, StandardWheelEvent } from 'src/base/browser/mouseEvent';
import { ScrollbarState } from 'src/base/browser/ui/scrollbar/scrollbarState';
import { ScrollbarVisibilityController } from 'src/base/browser/ui/scrollbar/scrollbarVisibilityController';
import { Widget } from 'src/base/browser/ui/widget';
import * as platform from 'src/base/common/platform';
import { INewScrollPosition, Scrollable, ScrollbarVisibility } from 'src/base/common/scrollable';
import { h } from 'src/virtual-dom/h';

/**
 * The orthogonal distance to the slider at which dragging "resets". This implements "snapping"
 */
const MOUSE_DRAG_RESET_DISTANCE = 140;

export interface ISimplifiedMouseEvent {
  posx: number;
  posy: number;
}

export interface ScrollbarHost {
  onMouseWheel(mouseWheelEvent: StandardWheelEvent): void;
  onDragStart(): void;
  onDragEnd(): void;
}

export interface AbstractScrollbarOptions {
  lazyRender: boolean;
  host: ScrollbarHost;
  scrollbarState: ScrollbarState;
  visibility: ScrollbarVisibility;
  extraScrollbarClassName: string;
  scrollable: Scrollable;
}

export abstract class AbstractScrollbar extends Widget {

  protected _host: ScrollbarHost;
  protected _scrollable: Scrollable;
  private _lazyRender: boolean;
  protected _scrollbarState: ScrollbarState;
  private _visibilityController: ScrollbarVisibilityController;
  private _mouseMoveMonitor: GlobalMouseMoveMonitor<IStandardMouseMoveEventData>;

  public domNode: HTMLElement;
  public slider: HTMLElement;

  protected _shouldRender: boolean;

  constructor(opts: AbstractScrollbarOptions) {
    super();
    this._lazyRender = opts.lazyRender;
    this._host = opts.host;
    this._scrollable = opts.scrollable;
    this._scrollbarState = opts.scrollbarState;
    this._visibilityController = this._register(new ScrollbarVisibilityController(opts.visibility, 'visible scrollbar ' + opts.extraScrollbarClassName, 'invisible scrollbar ' + opts.extraScrollbarClassName));
    this._mouseMoveMonitor = this._register(new GlobalMouseMoveMonitor<IStandardMouseMoveEventData>());
    this._shouldRender = true;
    this.domNode = document.createElement('div');

    this.domNode.setAttribute('role', 'presentation');
    this.domNode.setAttribute('aria-hidden', 'true');

    this._visibilityController.setDomNode(this.domNode);
    this.domNode.style.position = 'absolute';

    this.onmousedown(this.domNode, (e) => this._domNodeMouseDown(e));
  }

  // ----------------- creation
  /**
   * Creates the slider dom node, adds it to the container & hooks up the events
   */
  protected _createSlider(top: number, left: number, width: number | undefined, height: number | undefined): void {
    this.slider = document.createElement('div');
    this.slider.className = 'slider';
    this.slider.style.position = 'absolute';
    this.slider.style.top = top + 'px';
    this.slider.style.left = left + 'px';
    if (typeof width === 'number') {
      this.slider.style.width = width + 'px';
    }
    if (typeof height === 'number') {
      this.slider.style.height = height + 'px';
    }
    (<any>this.slider.style).willChange = 'transform';

    this.domNode.appendChild(this.slider);

    this.onmousedown(this.slider, (e) => {
      if (e.leftButton) {
        e.preventDefault();
        this._sliderMouseDown(e, () => { /*nothing to do*/ });
      }
    });
  }

  // ----------------- Update state

  protected _onElementSize(visibleSize: number): boolean {
    if (this._scrollbarState.setVisibleSize(visibleSize)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }

  protected _onElementScrollSize(elementScrollSize: number): boolean {
    if (this._scrollbarState.setScrollSize(elementScrollSize)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }

  protected _onElementScrollPosition(elementScrollPosition: number): boolean {
    if (this._scrollbarState.setScrollPosition(elementScrollPosition)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }

  // ----------------- rendering

  public beginReveal(): void {
    this._visibilityController.setShouldBeVisible(true);
  }

  public beginHide(): void {
    this._visibilityController.setShouldBeVisible(false);
  }

  public render(): void {
    if (!this._shouldRender) {
      return;
    }
    this._shouldRender = false;

    this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize());
    this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getSliderPosition());
  }
  // ----------------- DOM events

  private _domNodeMouseDown(e: IMouseEvent): void {
    if (e.target !== this.domNode) {
      return;
    }
    this._onMouseDown(e);
  }

  public delegateMouseDown(e: IMouseEvent): void {
    let domTop = this.domNode.getClientRects()[0].top;
    let sliderStart = domTop + this._scrollbarState.getSliderPosition();
    let sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
    let mousePos = this._sliderMousePosition(e);
    if (sliderStart <= mousePos && mousePos <= sliderStop) {
      // Act as if it was a mouse down on the slider
      if (e.leftButton) {
        e.preventDefault();
        this._sliderMouseDown(e, () => { /*nothing to do*/ });
      }
    } else {
      // Act as if it was a mouse down on the scrollbar
      this._onMouseDown(e);
    }
  }

  private _onMouseDown(e: IMouseEvent): void {
    let offsetX: number;
    let offsetY: number;
    if (e.target === this.domNode && typeof e.browserEvent.offsetX === 'number' && typeof e.browserEvent.offsetY === 'number') {
      offsetX = e.browserEvent.offsetX;
      offsetY = e.browserEvent.offsetY;
    } else {
      const domNodePosition = dom.getDomNodePagePosition(this.domNode);
      offsetX = e.posx - domNodePosition.left;
      offsetY = e.posy - domNodePosition.top;
    }
    this._setDesiredScrollPositionNow(this._scrollbarState.getDesiredScrollPositionFromOffset(this._mouseDownRelativePosition(offsetX, offsetY)));
    if (e.leftButton) {
      e.preventDefault();
      this._sliderMouseDown(e, () => { /*nothing to do*/ });
    }
  }

  private _sliderMouseDown(e: ISimplifiedMouseEvent, onDragFinished: () => void): void {
    const initialMousePosition = this._sliderMousePosition(e);
    const initialMouseOrthogonalPosition = this._sliderOrthogonalMousePosition(e);
    const initialScrollbarState = this._scrollbarState.clone();
    this.slider.classList.toggle('active', true);

    this._mouseMoveMonitor.startMonitoring(
      standardMouseMoveMerger,
      (mouseMoveData: IStandardMouseMoveEventData) => {
        const mouseOrthogonalPosition = this._sliderOrthogonalMousePosition(mouseMoveData);
        const mouseOrthogonalDelta = Math.abs(mouseOrthogonalPosition - initialMouseOrthogonalPosition);

        if (platform.isWindows && mouseOrthogonalDelta > MOUSE_DRAG_RESET_DISTANCE) {
          // The mouse has wondered away from the scrollbar => reset dragging
          this._setDesiredScrollPositionNow(initialScrollbarState.getScrollPosition());
          return;
        }

        const mousePosition = this._sliderMousePosition(mouseMoveData);
        const mouseDelta = mousePosition - initialMousePosition;
        this._setDesiredScrollPositionNow(initialScrollbarState.getDesiredScrollPositionFromDelta(mouseDelta));
      },
      () => {
        this.slider.classList.toggle('active', false);
        this._host.onDragEnd();
        onDragFinished();
      }
    );

    this._host.onDragStart();
  }

  private _setDesiredScrollPositionNow(_desiredScrollPosition: number): void {

    let desiredScrollPosition: INewScrollPosition = {};
    this.writeScrollPosition(desiredScrollPosition, _desiredScrollPosition);

    this._scrollable.setScrollPositionNow(desiredScrollPosition);
  }

  // ----------------- Overwrite these

  protected abstract _renderDomNode(largeSize: number, smallSize: number): void;
  protected abstract _updateSlider(sliderSize: number, sliderPosition: number): void;

  protected abstract _mouseDownRelativePosition(offsetX: number, offsetY: number): number;
  protected abstract _sliderMousePosition(e: ISimplifiedMouseEvent): number;
  protected abstract _sliderOrthogonalMousePosition(e: ISimplifiedMouseEvent): number;

  public abstract writeScrollPosition(target: INewScrollPosition, scrollPosition: number): void;
}
