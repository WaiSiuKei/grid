import { IViewModel } from 'src/grid/viewModel/viewModel';
import { IModel } from 'src/grid/model/model';
import { Position } from 'src/grid/core/position';
import { Range } from 'src/grid/core/range';

export class CursorContext {
  _cursorContextBrand: void;

  public readonly model: IModel;
  public readonly viewModel: IViewModel;

  constructor(model: IModel, viewModel: IViewModel) {
    this.model = model;
    this.viewModel = viewModel;
  }

  // public validateViewPosition(viewPosition: Position, modelPosition: Position): Position {
  //   return this.viewModel.coordinatesConverter.validateViewPosition(viewPosition, modelPosition);
  // }
  //
  // public validateViewRange(viewRange: Range, expectedModelRange: Range): Range {
  //   return this.viewModel.coordinatesConverter.validateViewRange(viewRange, expectedModelRange);
  // }
  //
  // public convertViewRangeToModelRange(viewRange: Range): Range {
  //   return this.viewModel.coordinatesConverter.convertViewRangeToModelRange(viewRange);
  // }
  //
  // public convertViewPositionToModelPosition(lineNumber: number, column: number): Position {
  //   return this.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(lineNumber, column));
  // }
  //
  // public convertModelPositionToViewPosition(modelPosition: Position): Position {
  //   return this.viewModel.coordinatesConverter.convertModelPositionToViewPosition(modelPosition);
  // }
  //
  // public convertModelRangeToViewRange(modelRange: Range): Range {
  //   return this.viewModel.coordinatesConverter.convertModelRangeToViewRange(modelRange);
  // }
  //
  // public getCurrentScrollTop(): number {
  //   return this.viewModel.viewLayout.getCurrentScrollTop();
  // }

  // public getCompletelyVisibleViewRange(): Range {
  //   return this.viewModel.getCompletelyVisibleViewRange();
  // }
  //
  // public getCompletelyVisibleModelRange(): Range {
  //   const viewRange = this.viewModel.getCompletelyVisibleViewRange();
  //   return this.viewModel.coordinatesConverter.convertViewRangeToModelRange(viewRange);
  // }
  //
  // public getCompletelyVisibleViewRangeAtScrollTop(scrollTop: number): Range {
  //   return this.viewModel.getCompletelyVisibleViewRangeAtScrollTop(scrollTop);
  // }
  //
  // public getVerticalOffsetForViewLine(viewLineNumber: number): number {
  //   return this.viewModel.viewLayout.getVerticalOffsetForLineNumber(viewLineNumber);
  // }
}

export interface ICursors {
  // readonly context: CursorContext;
  scrollTo(desiredScrollTop: number): void;
}
