/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AbstractScrollbar, ISimplifiedMouseEvent, ScrollbarHost } from 'src/base/browser/ui/scrollbar/abstractScrollbar';
import { ScrollableElementResolvedOptions } from 'src/base/browser/ui/scrollbar/scrollableElementOptions';
import { ScrollbarState } from 'src/base/browser/ui/scrollbar/scrollbarState';
import { INewScrollPosition, ScrollEvent, Scrollable, ScrollbarVisibility } from 'src/base/common/scrollable';

export class VerticalScrollbar extends AbstractScrollbar {

  constructor(scrollable: Scrollable, options: ScrollableElementResolvedOptions, host: ScrollbarHost) {
    super({
      lazyRender: options.lazyRender,
      host: host,
      scrollbarState: new ScrollbarState(
        (options.vertical === ScrollbarVisibility.Hidden ? 0 : options.verticalScrollbarSize),
        // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
        0
      ),
      visibility: options.vertical,
      extraScrollbarClassName: 'vertical',
      scrollable: scrollable
    });

    this._createSlider(0, Math.floor((options.verticalScrollbarSize - options.verticalSliderSize) / 2), options.verticalSliderSize, undefined);
  }

  protected _updateSlider(sliderSize: number, sliderPosition: number): void {
    this.slider.setHeight(sliderSize);
    this.slider.setTop(sliderPosition);
  }

  protected _renderDomNode(largeSize: number, smallSize: number): void {
    this.domNode.setWidth(smallSize);
    this.domNode.setHeight(largeSize);
    this.domNode.setRight(0);
    this.domNode.setTop(0);
  }

  public onDidScroll(e: ScrollEvent): boolean {
    this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender;
    this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender;
    this._shouldRender = this._onElementSize(e.height) || this._shouldRender;
    return this._shouldRender;
  }

  protected _mouseDownRelativePosition(offsetX: number, offsetY: number): number {
    return offsetY;
  }

  protected _sliderMousePosition(e: ISimplifiedMouseEvent): number {
    return e.posy;
  }

  protected _sliderOrthogonalMousePosition(e: ISimplifiedMouseEvent): number {
    return e.posx;
  }

  public writeScrollPosition(target: INewScrollPosition, scrollPosition: number): void {
    target.scrollTop = scrollPosition;
  }
}
