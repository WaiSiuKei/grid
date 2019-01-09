import './grid.css';

import { COLUMN_DEFAULT, GRID_DEFAULT, IDataSource, IGridColumnDefinition, IGridOptions, } from 'src/grid/grid';
import { GridModel } from 'src/grid/gridModel';
import { GridView } from 'src/grid/gridView';
import { GridContext } from 'src/grid/girdContext';
import { isUndefinedOrNull } from 'src/base/common/types';
import { mapBy, sum, sumBy } from 'src/base/common/functional';

export class Grid {

  private container: HTMLElement;
  private ctx: GridContext;
  private view: GridView;

  constructor(container: HTMLElement, ds: IDataSource, col: Array<Partial<IGridColumnDefinition>>, options: Partial<IGridOptions> = {}) {
    this.container = container;

    let opt = this.validateAndEnforceOptions(options);
    let model = new GridModel(ds);
    let columns = this.validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth);
    this.resolvingColumnWidths(columns, container.clientWidth);
    this.ctx = new GridContext(model, columns, opt);
    this.view = new GridView(this.container, this.ctx);
  }

  validateAndEnforceOptions(opt: Partial<IGridOptions>): IGridOptions {
    return Object.assign({}, opt, GRID_DEFAULT) as IGridOptions;
  }

  validatedAndEnforeColumnDefinitions(col: Array<Partial<IGridColumnDefinition>>, defaultWidth?: number): IGridColumnDefinition[] {
    let validatedCols: IGridColumnDefinition[] = [];

    let defaultDef = COLUMN_DEFAULT;
    if (defaultWidth) {
      defaultDef.width = defaultWidth;
      defaultDef.flexGrow = 0;
      defaultDef.flexShrink = 0;
    }
    for (let i = 0; i < col.length; i++) {
      let m = Object.assign({}, defaultDef, col[i]);
      m.flexGrow = Math.max(0, m.flexGrow);
      m.flexShrink = Math.max(0, m.flexShrink);

      if (isUndefinedOrNull(m.minWidth)) {
        if (m.flexShrink === 0) {
          m.minWidth = m.width;
        } else {
          m.minWidth = 1;
        }
      }
      if (m.width < m.minWidth) {
        m.width = m.minWidth;
      }
      if (isUndefinedOrNull(m.maxWidth)) {
        if (m.flexGrow === 0) {
          m.maxWidth = m.width;
        } else {
          m.maxWidth = Infinity;
        }
      }
      if (m.width > m.maxWidth) {
        m.width = m.maxWidth;
      }
      validatedCols.push(m as IGridColumnDefinition);
    }
    return validatedCols;
  }

  resolvingColumnWidths(col: Array<IGridColumnDefinition>, totalWidth: number): Array<IGridColumnDefinition> {
    let currentWidths = sumBy(col, 'width');
    let spaces = totalWidth - currentWidths;
    if (spaces === 0) return;
    let factors: number[] = mapBy(col, spaces > 0 ? 'flexGrow' : 'flexShrink');
    let total = Math.max(1, sum(factors)); // https://github.com/xieranmaya/blog/issues/9
    if (total === 0) return;
    for (let i = 0, len = col.length; i < len; i++) {
      col[i].width += spaces * factors[i] / total;
    }
  }

  layout() {
    this.view.layout();
  }
}
