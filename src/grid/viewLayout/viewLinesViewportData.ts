/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Range } from 'src/grid/core/range';
import { IViewModel } from 'src/grid/viewModel/viewModel';

export interface IPartialViewRowsViewportData {
  /**
   * Value to be substracted from `scrollTop` (in order to vertical offset numbers < 1MM)
   */
  readonly bigNumbersDelta: number;
  /**
   * The first (partially) visible row number.
   */
  readonly startRowNumber: number;
  /**
   * The last (partially) visible row number.
   */
  readonly endRowNumber: number;
  /**
   * relativeVerticalOffset[i] is the `top` position for row at `i` + `startRowNumber`.
   */
  readonly relativeVerticalOffset: number[];
  /**
   * The centered row in the viewport.
   */
  readonly centeredRowNumber: number;
  /**
   * The first completely visible row number.
   */
  readonly completelyVisibleStartRowNumber: number;
  /**
   * The last completely visible row number.
   */
  readonly completelyVisibleEndRowNumber: number;
}

/**
 * Contains all data needed to render at a specific viewport.
 */
export class ViewportData {

  /**
   * The row number at which to start rendering (inclusive).
   */
  public readonly startRowNumber: number;

  /**
   * The row number at which to end rendering (inclusive).
   */
  public readonly endRowNumber: number;

  /**
   * relativeVerticalOffset[i] is the `top` position for row at `i` + `startRowNumber`.
   */
  public readonly relativeVerticalOffset: number[];

  /**
   * The viewport as a range (startRowNumber,1) -> (endRowNumber,maxColumn(endRowNumber)).
   */
  public readonly visibleRange: Range;

  // /**
  //  * Value to be substracted from `scrollTop` (in order to vertical offset numbers < 1MM)
  //  */
  // public readonly bigNumbersDelta: number;

  /**
   * Positioning information about gaps whitespace.
   */

  private readonly _model: IViewModel;

  constructor(
    partialData: IPartialViewRowsViewportData,
    model: IViewModel
  ) {
    this.startRowNumber = partialData.startRowNumber | 0;
    this.endRowNumber = partialData.endRowNumber | 0;
    this.relativeVerticalOffset = partialData.relativeVerticalOffset;
    // this.bigNumbersDelta = partialData.bigNumbersDelta | 0;

    this._model = model;

    this.visibleRange = new Range(
      partialData.startRowNumber,
      0,
      partialData.endRowNumber,
      100,
    );
  }

  // public getViewRowRenderingData(rowNumber: number): ViewRowRenderingData {
  //   return this._model.getViewRowRenderingData(this.visibleRange, rowNumber);
  // }
}
