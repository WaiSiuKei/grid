import { Disposable } from 'src/base/common/lifecycle';
import { IConfiguration, IGrid } from 'src/grid/gridCommon';
import { GRID_DEFAULTS, IGridOptions } from 'src/grid/gridOptions';
import { View } from 'src/grid/view/viewImpl';
import { IModel } from 'src/grid/model/model';
import { Cursor } from 'src/grid/controller/cursorImpl';
import { IViewModel } from 'src/grid/viewModel/viewModel';
import { ViewModel } from 'src/grid/viewModel/viewModelImpl';
import { scheduleAtNextAnimationFrame } from 'src/base/browser/dom';
import { ViewOutgoingEvents } from 'src/grid/view/viewOutgoingEvents';
import { GridModel } from 'src/grid/model/gridModel';

let GRID_ID = 0;

export class GridWidget extends Disposable implements IGrid {
  private readonly _domElement: HTMLElement;
  private readonly _id: number;
  private readonly _configuration: IConfiguration;

  // --- Members logically associated to a model
  protected _view: View;

  constructor(
    domElement: HTMLElement,
    options: Partial<IGridOptions>,
  ) {
    super();
    this._domElement = domElement;
    this._id = (++GRID_ID);

    options = options || {};

    this._configuration = { grid: <IGridOptions>{ ...GRID_DEFAULTS, ...options } };

    this._attachModel(new GridModel());
  }

  protected _attachModel(model: IModel): void {
    const viewModel = new ViewModel(this._id, this._configuration, model, (callback) => scheduleAtNextAnimationFrame(callback));

    const cursor = new Cursor(this._configuration, model, viewModel);

    this._createView(viewModel, cursor);
  }

  _createView(viewModel: IViewModel, cursor: Cursor) {
    const viewOutgoingEvents = new ViewOutgoingEvents(viewModel);
    let view = new View(this._configuration, viewModel, cursor, viewOutgoingEvents);
    this._domElement.appendChild(view.domNode.domNode);

    view.render(false, true);
    this._view = view;
  }

  public render(): void {
    this._view.render(true, false);
  }

  dispose() {

  }
}
