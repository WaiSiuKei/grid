import { Scrollable } from 'src/base/common/scrollable';
import { IPosition, Position } from 'src/grid/core/position';
import { IRange, Range } from 'src/grid/core/range';

export class Viewport {
  readonly _viewportBrand: void;

  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;

  constructor(top: number, left: number, width: number, height: number) {
    this.top = top | 0;
    this.left = left | 0;
    this.width = width | 0;
    this.height = height | 0;
  }
}

export interface IViewLayout {

  readonly scrollable: Scrollable;

  getScrollWidth(): number;
  getScrollHeight(): number;

  getCurrentScrollLeft(): number;
  getCurrentScrollTop(): number;
  getCurrentViewport(): Viewport;
}

export interface ICoordinatesConverter {
  // View -> Model conversion and related methods
  // convertViewPositionToModelPosition(viewPosition: Position): Position;
  // convertViewRangeToModelRange(viewRange: Range): Range;
  // validateViewPosition(viewPosition: Position, expectedModelPosition: Position): Position;
  // validateViewRange(viewRange: Range, expectedModelRange: Range): Range;

  // Model -> View conversion and related methods
  // convertModelPositionToViewPosition(modelPosition: Position): Position;
  // convertModelRangeToViewRange(modelRange: Range): Range;
  // modelPositionIsVisible(modelPosition: Position): boolean;
}

export interface IViewModel {

  // addEventListener(listener: IViewEventListener): IDisposable;

  readonly coordinatesConverter: ICoordinatesConverter;

  readonly viewLayout: IViewLayout;

  // getLineMaxColumn(lineNumber: number): number;
}
