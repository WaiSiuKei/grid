import './grid.css';

import { COLUMN_DEFAULT, GRID_DEFAULT, IDataSource, IGridColumnDefinition, IGridOptions, } from 'src/grid/grid';
import { GridModel } from 'src/grid/gridModel';
import { GridView } from 'src/grid/gridView';
import { GridContext } from 'src/grid/girdContext';

export class Grid {

  private container: HTMLElement;

  private view: GridView;

  constructor(container: HTMLElement, ds: IDataSource, col: Array<Partial<IGridColumnDefinition>>, options: Partial<IGridOptions> = {}) {
    this.container = container;

    let opt = this.validateAndEnforceOptions(options);
    let model = new GridModel(ds);
    let columns = this.validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth);
    let ctx = new GridContext(model, columns, opt);
    this.view = new GridView(this.container, ctx);
  }

  validateAndEnforceOptions(opt: Partial<IGridOptions>): IGridOptions {
    return Object.assign({}, opt, GRID_DEFAULT) as IGridOptions;
  }

  validatedAndEnforeColumnDefinitions(col: Array<Partial<IGridColumnDefinition>>, defaultWidth?: number): IGridColumnDefinition[] {
    let validatedCols: IGridColumnDefinition[] = [];

    let defaultDef = COLUMN_DEFAULT;
    if (defaultWidth) {
      defaultDef.width = defaultWidth;
    }
    for (let i = 0; i < col.length; i++) {
      let m = Object.assign({}, defaultDef, col[i]);

      if (m.minWidth && m.width < m.minWidth) {
        m.width = m.minWidth;
      }
      if (m.maxWidth && m.width > m.maxWidth) {
        m.width = m.maxWidth;
      }
      validatedCols.push(m as IGridColumnDefinition);
    }
    return validatedCols;
  }

  layout() {
    this.view.layout();
  }
}
