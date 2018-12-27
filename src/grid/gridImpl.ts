import './grid.css';

import { IDataSource, IGridOptions, } from 'src/grid/grid';
import { GridModel } from 'src/grid/gridModel';
import { GridView } from 'src/grid/gridView';

export class Grid {

  private container: HTMLElement;

  private model: GridModel;
  private view: GridView;

  constructor(container: HTMLElement, ds: IDataSource, options: Partial<IGridOptions> = {}) {
    this.container = container;

    this.model = new GridModel(ds);
    this.view = new GridView(this.container, this.model);
  }

  layout() {
    this.view.layout();
  }
}
