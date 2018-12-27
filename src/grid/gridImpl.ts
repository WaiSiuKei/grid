import './grid.css';

import { IDataSource, IGridColumnDefinition, IGridOptions, } from 'src/grid/grid';
import { GridModel } from 'src/grid/gridModel';
import { GridView } from 'src/grid/gridView';

export class Grid {

  private container: HTMLElement;

  private model: GridModel;
  private view: GridView;

  constructor(container: HTMLElement, ds: IDataSource, col: IGridColumnDefinition[], options: Partial<IGridOptions> = {}) {
    this.container = container;

    this.model = new GridModel(ds);
    this.view = new GridView(this.container, this.model, col);
  }

  layout() {
    this.view.layout();
  }
}
