import { ICoordinatesConverter } from 'src/grid/viewModel/viewModel';
import { Position } from 'src/grid/core/position';
import { Range } from 'src/grid/core/range';
import { IModel } from 'src/grid/model/model';

export interface IViewModelLinesCollection {
  createCoordinatesConverter(): ICoordinatesConverter;

  dispose(): void;

  // getViewLineContent(viewLineNumber: number): string;
  // getViewLineLength(viewLineNumber: number): number;
  // getViewLineMinColumn(viewLineNumber: number): number;
  // getViewLineMaxColumn(viewLineNumber: number): number;
  // getViewLinesData(viewStartLineNumber: number, viewEndLineNumber: number, needed: boolean[]): Array<ViewLineData | null>;
}

export class IdentityCoordinatesConverter implements ICoordinatesConverter {

  private readonly _lines: IdentityLinesCollection;

  constructor(lines: IdentityLinesCollection) {
    this._lines = lines;
  }

  // private _validPosition(pos: Position): Position {
  //   return this._lines.model.validatePosition(pos);
  // }
  //
  // private _validRange(range: Range): Range {
  //   return this._lines.model.validateRange(range);
  // }
  //
  // // View -> Model conversion and related methods
  //
  // public convertViewPositionToModelPosition(viewPosition: Position): Position {
  //   return this._validPosition(viewPosition);
  // }
  //
  // public convertViewRangeToModelRange(viewRange: Range): Range {
  //   return this._validRange(viewRange);
  // }
  //
  // public validateViewPosition(_viewPosition: Position, expectedModelPosition: Position): Position {
  //   return this._validPosition(expectedModelPosition);
  // }
  //
  // public validateViewRange(_viewRange: Range, expectedModelRange: Range): Range {
  //   return this._validRange(expectedModelRange);
  // }
  //
  // // Model -> View conversion and related methods
  //
  // public convertModelPositionToViewPosition(modelPosition: Position): Position {
  //   return this._validPosition(modelPosition);
  // }
  //
  // public convertModelRangeToViewRange(modelRange: Range): Range {
  //   return this._validRange(modelRange);
  // }
  //
  // public modelPositionIsVisible(modelPosition: Position): boolean {
  //   const lineCount = this._lines.model.getLineCount();
  //   if (modelPosition.lineNumber < 1 || modelPosition.lineNumber > lineCount) {
  //     // invalid arguments
  //     return false;
  //   }
  //   return true;
  // }
}

export class IdentityLinesCollection implements IViewModelLinesCollection {

  public readonly model: IModel;

  constructor(model: IModel) {
    this.model = model;
  }

  public dispose(): void {
  }

  public createCoordinatesConverter(): ICoordinatesConverter {
    return new IdentityCoordinatesConverter(this);
  }
}

