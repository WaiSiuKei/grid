import { ViewEventDispatcher } from 'src/grid/view/viewEventDispatcher';
import { IViewLayout, IViewModel } from 'src/grid/viewModel/viewModel';
import { ViewEventHandler } from 'src/grid/viewModel/viewEventHandler';
import { IConfiguration } from 'src/grid/gridCommon';

export class ViewContext {

  public readonly configuration: IConfiguration;
  public readonly model: IViewModel;
  public readonly viewLayout: IViewLayout;
  public readonly privateViewEventBus: ViewEventDispatcher;

  constructor(
    configuration: IConfiguration,
    model: IViewModel,
    privateViewEventBus: ViewEventDispatcher
  ) {
    this.model = model;
    this.viewLayout = model.viewLayout;
    this.privateViewEventBus = privateViewEventBus;
  }

  public addEventHandler(eventHandler: ViewEventHandler): void {
    this.privateViewEventBus.addEventHandler(eventHandler);
  }

  public removeEventHandler(eventHandler: ViewEventHandler): void {
    this.privateViewEventBus.removeEventHandler(eventHandler);
  }
}
