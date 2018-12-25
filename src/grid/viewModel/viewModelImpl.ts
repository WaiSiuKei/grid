import { ICoordinatesConverter, IViewModel } from 'src/grid/viewModel/viewModel';
import { ViewEventEmitter, ViewScrollChangedEvent } from 'src/grid/view/viewEvents';
import { IConfiguration } from 'src/grid/gridCommon';
import { IModel } from 'src/grid/model/model';
import { IDisposable } from 'src/base/common/lifecycle';
import { ScrollEvent } from 'src/base/common/scrollable';
import { Position } from 'src/grid/core/position';
import { Range } from 'src/grid/core/range';
import { IdentityLinesCollection, IViewModelLinesCollection } from 'src/grid/viewModel/splitLinesCollection';
import { ViewLayout } from 'src/grid/viewLayout/viewLayout';

export class ViewModel extends ViewEventEmitter implements IViewModel {

  private readonly editorId: number;
  private readonly configuration: IConfiguration;
  private readonly model: IModel;
  private viewportStartLine: number;
  private viewportStartLineDelta: number;
  private readonly lines: IViewModelLinesCollection;
  public readonly coordinatesConverter: ICoordinatesConverter;
  public readonly viewLayout: ViewLayout;

  constructor(editorId: number, configuration: IConfiguration, model: IModel, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable) {
    super();

    this.editorId = editorId;
    this.configuration = configuration;
    this.model = model;
    this.viewportStartLine = -1;
    this.viewportStartLineDelta = 0;

    this.lines = new IdentityLinesCollection(this.model);

    this.coordinatesConverter = this.lines.createCoordinatesConverter();

    this.viewLayout = this._register(new ViewLayout(this.configuration, 0, scheduleAtNextAnimationFrame)); // fixme

    this._register(this.viewLayout.onDidScroll((e: ScrollEvent) => {
      try {
        const eventsCollector = this._beginEmit();
        eventsCollector.emit(new ViewScrollChangedEvent(e));
      } finally {
        this._endEmit();
      }
    }));
  }
}
