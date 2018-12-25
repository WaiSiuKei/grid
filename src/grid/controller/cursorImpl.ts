import { ViewEventEmitter } from 'src/grid/view/viewEvents';
import { CursorContext, ICursors } from 'src/grid/controller/cursor';
import { IModel } from 'src/grid/model/model';
import { IViewModel } from 'src/grid/viewModel/viewModel';
import { IConfiguration } from 'src/grid/gridCommon';

export class Cursor extends ViewEventEmitter implements ICursors {

  private readonly _model: IModel;
  private readonly _viewModel: IViewModel;

  constructor(configuration: IConfiguration, model: IModel, viewModel: IViewModel) {
    super();
    this._model = model;
    this._viewModel = viewModel;

  }

  public dispose(): void {
    super.dispose();
  }

  // public reveal(horizontal: boolean, target: RevealTarget, scrollType: ScrollType): void {
  //   this._revealRange(target, viewEvents.VerticalRevealType.Simple, horizontal, scrollType);
  // }
  //
  // public revealRange(revealHorizontal: boolean, viewRange: Range, verticalType: VerticalRevealType, scrollType: editorCommon.ScrollType) {
  //   this.emitCursorRevealRange(viewRange, verticalType, revealHorizontal, scrollType);
  // }

  public scrollTo(desiredScrollTop: number): void {
    // this._viewModel.viewLayout.setScrollPositionSmooth({
    //   scrollTop: desiredScrollTop
    // });
  }
}
