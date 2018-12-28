/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AbstractScrollbar, ISimplifiedMouseEvent, ScrollbarHost } from 'src/base/browser/ui/scrollbar/abstractScrollbar';
import { ScrollableElementResolvedOptions } from 'src/base/browser/ui/scrollbar/scrollableElementOptions';
import { ScrollbarState } from 'src/base/browser/ui/scrollbar/scrollbarState';
import { INewScrollPosition, ScrollEvent, Scrollable, ScrollbarVisibility } from 'src/base/common/scrollable';

export class HorizontalScrollbar extends AbstractScrollbar {

  constructor(scrollable: Scrollable, options: ScrollableElementResolvedOptions, host: ScrollbarHost) {
    super({
      lazyRender: options.lazyRender,
      host: host,
      scrollbarState: new ScrollbarState(
        (options.horizontal === ScrollbarVisibility.Hidden ? 0 : options.horizontalScrollbarSize),
        (options.vertical === ScrollbarVisibility.Hidden ? 0 : options.verticalScrollbarSize)
      ),
      visibility: options.horizontal,
      extraScrollbarClassName: 'horizontal',
      scrollable: scrollable
    });

    this._createSlider(Math.floor((options.horizontalScrollbarSize - options.horizontalSliderSize) / 2), 0, undefined, options.horizontalSliderSize);
  }

  protected _updateSlider(sliderSize: number, sliderPosition: number): void {
    this.slider.style.width = sliderSize + 'px';
    this.slider.style.left = sliderPosition + 'px';
  }

  protected _renderDomNode(largeSize: number, smallSize: number): void {
    this.domNode.style.width = largeSize + 'px';
    this.domNode.style.height = smallSize + 'px';
    this.domNode.style.left = '0';
    this.domNode.style.bottom = '0';
  }

  public onDidScroll(e: ScrollEvent): boolean {
    this._shouldRender = this._onElementScrollSize(e.scrollWidth) || this._shouldRender;
    this._shouldRender = this._onElementScrollPosition(e.scrollLeft) || this._shouldRender;
    this._shouldRender = this._onElementSize(e.width) || this._shouldRender;
    return this._shouldRender;
  }

  protected _mouseDownRelativePosition(offsetX: number, offsetY: number): number {
    return offsetX;
  }

  protected _sliderMousePosition(e: ISimplifiedMouseEvent): number {
    return e.posx;
  }

  protected _sliderOrthogonalMousePosition(e: ISimplifiedMouseEvent): number {
    return e.posy;
  }

  public writeScrollPosition(target: INewScrollPosition, scrollPosition: number): void {
    target.scrollLeft = scrollPosition;
  }
}
