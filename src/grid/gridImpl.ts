import { addClasses, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { isUndefinedOrNull } from 'src/base/common/types';
import { GridContext } from 'src/grid/girdContext';
import { mapBy, sum, sumBy } from 'src/base/common/functional';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { IDataSet } from 'src/data/data';
import { CellFormatter, COLUMN_DEFAULT, ColumnPinAlignment, GRID_DEFAULT, IGridColumnDefinition, IGridOptions } from 'src/grid/grid';
import { GridWidget } from 'src/grid/gridWidget';
import { GridModel } from 'src/grid/gridModel';

function validateAndEnforceOptions(opt: Partial<IGridOptions>): IGridOptions {
  return Object.assign({}, GRID_DEFAULT, opt) as IGridOptions;
}

function validatedAndEnforeColumnDefinitions(col: Array<Partial<IGridColumnDefinition>>, defaultWidth?: number, defaultFormatter?: CellFormatter): IGridColumnDefinition[] {
  let validatedCols: IGridColumnDefinition[] = [];

  let defaultDef = COLUMN_DEFAULT;
  if (defaultWidth) {
    defaultDef.width = defaultWidth;
    defaultDef.flexGrow = 0;
    defaultDef.flexShrink = 0;
  }
  if (defaultFormatter) {
    Object.assign(defaultDef, { formatter: defaultFormatter });
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

function resolvingColumnWidths(col: Array<IGridColumnDefinition>, totalWidth: number): Array<IGridColumnDefinition> {
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

export class Grid implements IDisposable {
  private left: GridWidget;
  private center: GridWidget;
  private right: GridWidget;

  private toDispose: IDisposable[] = [];

  constructor(protected container: HTMLElement, ds: IDataSet, col: Array<Partial<IGridColumnDefinition>>, options: Partial<IGridOptions> = {}) {
    let opt = validateAndEnforceOptions(options);
    let model = new GridModel(ds);
    let columns = validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth, opt.defaultFormatter);
    resolvingColumnWidths(columns, container.clientWidth);

    let pinedLeftColumns = columns.filter(c => c.pinned === ColumnPinAlignment.Left);
    let pinedRightColumns = columns.filter(c => c.pinned === ColumnPinAlignment.Right);
    let centerColumns = columns.filter(c => !c.pinned);

    let height = getContentHeight(this.container);
    let width = getContentWidth(this.container);
    let widthOfLeft = sumBy(pinedLeftColumns, 'width');
    let widthOfRight = sumBy(pinedRightColumns, 'width');
    let widthOfCenter = width - widthOfLeft - widthOfRight;

    if (pinedLeftColumns.length) {
      let leftContainer = document.createElement('div');
      this.container.appendChild(leftContainer);
      addClasses(leftContainer, 'grid-widget', 'left');
      leftContainer.style.width = widthOfLeft + 'px';
      leftContainer.style.position = 'absolute';
      leftContainer.style.top = '0';
      leftContainer.style.left = '0';
      leftContainer.style.bottom = '0';
      this.left = new GridWidget(leftContainer, ds, new GridContext(model, pinedLeftColumns, { ...opt, internalShowGroup: true }), {
        showHorizonalScrollbar: false,
        showVerticalScrollbar: false
      });
    }

    if (pinedLeftColumns.length || pinedRightColumns.length) {
      let centerContainer = document.createElement('div');
      this.container.appendChild(centerContainer);
      addClasses(centerContainer, 'grid-widget', 'center');
      centerContainer.style.position = 'absolute';
      centerContainer.style.top = '0';
      centerContainer.style.right = widthOfRight + 'px';
      centerContainer.style.left = widthOfLeft + 'px';
      centerContainer.style.bottom = '0';
      this.center = new GridWidget(centerContainer, ds, new GridContext(model, centerColumns, { ...opt, internalShowGroup: false }), {
        showHorizonalScrollbar: true,
        showVerticalScrollbar: false,
      });
    } else {
      this.center = new GridWidget(container, ds, new GridContext(model, centerColumns, { ...opt, internalShowGroup: true }), {
        showHorizonalScrollbar: true,
        showVerticalScrollbar: true,
      });
    }

    if (pinedRightColumns.length) {
      let rightContainer = document.createElement('div');
      this.container.appendChild(rightContainer);
      addClasses(rightContainer, 'grid-widget', 'right');
      rightContainer.style.width = widthOfRight + 'px';
      rightContainer.style.position = 'absolute';
      rightContainer.style.top = '0';
      rightContainer.style.right = '0';
      rightContainer.style.bottom = '0';
      this.right = new GridWidget(rightContainer, ds, new GridContext(model, pinedRightColumns, { ...opt, internalShowGroup: false }), {
        showHorizonalScrollbar: false,
        showVerticalScrollbar: true
      });
    }

    if (this.left) this.left.layout(height, widthOfLeft);
    if (this.center) this.center.layout(height, widthOfCenter);
    if (this.right) this.right.layout(height, widthOfRight);

    if (this.center) {
      this.toDispose.push(this.center.scrollableElement.onScroll((e) => {
        let verticalOnly = { ...e, widthChanged: false, scrollWidthChanged: false, scrollLeftChanged: false };
        if (this.left) this.left.handleScroll(verticalOnly);
        this.center.handleScroll(e);
        if (this.right) this.right.handleScroll(verticalOnly);
      }));
    }

    if (this.left) {
      this.toDispose.push(this.left.scrollableElement.onScroll((e) => {
        let verticalOnly = { ...e, widthChanged: false, scrollWidthChanged: false, scrollLeftChanged: false };
        this.left.handleScroll(e);
        if (this.center) this.center.handleScroll(verticalOnly);
        if (this.right) this.right.handleScroll(verticalOnly);
      }));
    }

    if (this.right) {
      this.toDispose.push(this.right.scrollableElement.onScroll((e) => {
        let verticalOnly = { ...e, widthChanged: false, scrollWidthChanged: false, scrollLeftChanged: false };
        if (this.left) this.left.handleScroll(verticalOnly);
        if (this.center) this.center.handleScroll(verticalOnly);
        this.right.handleScroll(e);
      }));
    }
  }

  dispose() {
    dispose(this.toDispose);
    this.toDispose.length = 0;
  }
}
