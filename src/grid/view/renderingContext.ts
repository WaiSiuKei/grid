/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position } from 'src/grid/core/position';
import { Range } from 'src/grid/core/range';
import { IViewLayout } from 'src/grid/viewModel/viewModel';

export interface IViewRows {
}

export abstract class RestrictedRenderingContext {
  _restrictedRenderingContextBrand: void;

  public readonly scrollWidth: number;
  public readonly scrollHeight: number;

  public readonly visibleRange: Range;
  public readonly bigNumbersDelta: number;

  public readonly scrollTop: number;
  public readonly scrollLeft: number;

  public readonly viewportWidth: number;
  public readonly viewportHeight: number;

  private readonly _viewLayout: IViewLayout;

  constructor(viewLayout: IViewLayout,) {
    this._viewLayout = viewLayout;

    this.scrollWidth = this._viewLayout.getScrollWidth();
    this.scrollHeight = this._viewLayout.getScrollHeight();

    // this.visibleRange = this.viewportData.visibleRange;
    // this.bigNumbersDelta = this.viewportData.bigNumbersDelta;

    const vInfo = this._viewLayout.getCurrentViewport();
    this.scrollTop = vInfo.top;
    this.scrollLeft = vInfo.left;
    this.viewportWidth = vInfo.width;
    this.viewportHeight = vInfo.height;
  }

}

export class RenderingContext extends RestrictedRenderingContext {
  _renderingContextBrand: void;

}


