import './grid.scss';
import { addClasses, getContentHeight, getContentWidth } from 'src/base/browser/dom';
import { isUndefinedOrNull } from 'src/base/common/types';
import { GridContext } from 'src/grid/girdContext';
import { mapBy, sum, sumBy } from 'src/base/common/functional';
import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { IDataSet } from 'src/data/data';
import { CellFormatter, COLUMN_DEFAULT, ColumnPinAlignment, GRID_DEFAULT, IGridWidget, IGridColumnDefinition, IGridMouseEvent, IGridOptions, IRange, IGrid } from 'src/grid/grid';
import { GridWidget, VirtualGridWidget } from 'src/grid/gridWidget';
import { GridModel } from 'src/grid/gridModel';
import { IPlugin } from 'src/plugins/plugin';
import { StandardKeyboardEvent } from 'src/base/browser/ui/keyboardEvent';
import { Emitter } from 'src/base/common/event';

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

export class Grid implements IDisposable, IGrid {
  left: IGridWidget;
  center: IGridWidget;
  right: IGridWidget;

  model: GridModel;

  private _onClick: Emitter<IGridMouseEvent> = new Emitter<IGridMouseEvent>();
  get onClick() { return this._onClick.event; }

  private _onKeyDown: Emitter<StandardKeyboardEvent> = new Emitter<StandardKeyboardEvent>();
  get onKeyDown() { return this._onKeyDown.event; }

  private leftColumns: IGridColumnDefinition[];
  private centerColumns: IGridColumnDefinition[];
  private rightColumns: IGridColumnDefinition[];

  private widthOfLeft: number;
  private widthOfCenter: number;
  private widthOfRight: number;

  private toDispose: IDisposable[] = [];

  constructor(protected container: HTMLElement, ds: IDataSet, col: Array<Partial<IGridColumnDefinition>>, options: Partial<IGridOptions> = {}) {
    this.toDispose.push(this._onClick);
    this.toDispose.push(this._onKeyDown);

    let opt = validateAndEnforceOptions(options);
    this.model = new GridModel(ds);
    let columns = validatedAndEnforeColumnDefinitions(col, opt.defaultColumnWidth, opt.defaultFormatter);
    resolvingColumnWidths(columns, container.clientWidth);

    this.leftColumns = columns.filter(c => c.pinned === ColumnPinAlignment.Left);
    this.rightColumns = columns.filter(c => c.pinned === ColumnPinAlignment.Right);
    this.centerColumns = columns.filter(c => !c.pinned);

    let height = getContentHeight(this.container);
    let width = getContentWidth(this.container);
    this.widthOfLeft = sumBy(this.leftColumns, 'width');
    this.widthOfRight = sumBy(this.rightColumns, 'width');
    this.widthOfCenter = width - this.widthOfLeft - this.widthOfRight;

    let leftContainer = document.createElement('div');
    this.container.appendChild(leftContainer);
    addClasses(leftContainer, 'grid-widget', 'left');
    leftContainer.style.width = this.widthOfLeft + 'px';
    leftContainer.style.position = 'absolute';
    leftContainer.style.top = '0';
    leftContainer.style.left = '0';
    leftContainer.style.bottom = '0';

    let centerContainer = document.createElement('div');
    this.container.appendChild(centerContainer);
    addClasses(centerContainer, 'grid-widget', 'center');
    centerContainer.style.position = 'absolute';
    centerContainer.style.top = '0';
    centerContainer.style.right = this.widthOfRight + 'px';
    centerContainer.style.left = this.widthOfLeft + 'px';
    centerContainer.style.bottom = '0';

    if (this.leftColumns.length) {
      this.left = new GridWidget(leftContainer, ds, new GridContext(this.model, this.leftColumns, { ...opt, internalShowGroup: true }), {
        showHorizonalScrollbar: false,
        showVerticalScrollbar: false
      });
    } else {
      this.left = new VirtualGridWidget(leftContainer);
    }

    if (this.centerColumns.length) {
      this.center = new GridWidget(centerContainer, ds, new GridContext(this.model, this.centerColumns, { ...opt, internalShowGroup: false }), {
        showHorizonalScrollbar: true,
        showVerticalScrollbar: !this.leftColumns.length && !this.rightColumns.length,
      });
    } else {
      this.center = new VirtualGridWidget(centerContainer);
    }

    let rightContainer = document.createElement('div');
    this.container.appendChild(rightContainer);
    addClasses(rightContainer, 'grid-widget', 'right');
    rightContainer.style.width = this.widthOfRight + 'px';
    rightContainer.style.position = 'absolute';
    rightContainer.style.top = '0';
    rightContainer.style.right = '0';
    rightContainer.style.bottom = '0';
    if (this.rightColumns.length) {
      this.right = new GridWidget(rightContainer, ds, new GridContext(this.model, this.rightColumns, { ...opt, internalShowGroup: false }), {
        showHorizonalScrollbar: false,
        showVerticalScrollbar: true
      });
    } else {
      this.right = new VirtualGridWidget(rightContainer);
    }

    // this.left.layout(height, this.widthOfLeft);
    // this.center.layout(height, this.widthOfCenter);
    // this.right.layout(height, this.widthOfRight);
    this.left.layout();
    this.center.layout();
    this.right.layout();

    this.registerListeners();
  }

  registerListeners() {
    this.toDispose.push(this.center.scrollableElement.onScroll((e) => {
      let verticalOnly = { ...e, widthChanged: false, scrollWidthChanged: false, scrollLeftChanged: false };
      if (this.left) this.left.handleScroll(verticalOnly);
      this.center.handleScroll(e);
      if (this.right) this.right.handleScroll(verticalOnly);
    }));

    this.toDispose.push(this.left.scrollableElement.onScroll((e) => {
      let verticalOnly = { ...e, widthChanged: false, scrollWidthChanged: false, scrollLeftChanged: false };
      this.left.handleScroll(e);
      if (this.center) this.center.handleScroll(verticalOnly);
      if (this.right) this.right.handleScroll(verticalOnly);
    }));

    this.toDispose.push(this.right.scrollableElement.onScroll((e) => {
      let verticalOnly = { ...e, widthChanged: false, scrollWidthChanged: false, scrollLeftChanged: false };
      if (this.left) this.left.handleScroll(verticalOnly);
      if (this.center) this.center.handleScroll(verticalOnly);
      this.right.handleScroll(e);
    }));

    this.toDispose.push(this.left.onClick(e => this._onClick.fire(e)));
    this.toDispose.push(this.left.onKeyDown(e => this._onKeyDown.fire(e)));

    this.toDispose.push(this.center.onClick(e => this._onClick.fire(this.handleClickEvent(e, this.widthOfLeft))));
    this.toDispose.push(this.center.onKeyDown(e => this._onKeyDown.fire(e)));

    this.toDispose.push(this.right.onClick(e => this._onClick.fire(this.handleClickEvent(e, this.widthOfLeft, this.widthOfCenter))));
    this.toDispose.push(this.right.onKeyDown(e => this._onKeyDown.fire(e)));
  }

  handleClickEvent(e: IGridMouseEvent, left: number = 0, center: number = 0): IGridMouseEvent {
    let ret = { ...e };
    if (center) {
      ret.clientX += center;
    }
    if (left) {
      ret.clientX += left;
    }
    return ret;
  }

  getSelection() {
    let leftRange = this.left.getSelection();
    let centerRange = this.center.getSelection();
    let rightRange = this.right.getSelection();
    if (!leftRange && !centerRange && !rightRange) return null;
    let range;
    if (leftRange) {
      if (!range) {
        range = leftRange;
      }
    }

    if (centerRange) {
      if (!range) {
        range = centerRange;
      } else {
        range.top = Math.min(range.top, centerRange.top);
        range.bottom = Math.max(range.bottom, centerRange.bottom);
        range.right = centerRange.right + this.leftColumns.length;
      }
    }

    if (rightRange) {
      if (!range) {
        range = rightRange;
      } else {
        range.top = Math.min(range.top, rightRange.top);
        range.bottom = Math.max(range.bottom, rightRange.bottom);
        range.right = centerRange.right + this.rightColumns.length + this.leftColumns.length;
      }
    }
    return range;
  }

  handleRange(range: IRange, leftCols: number = 0, centerCols: number = 0, rightCols: number = 0): [IRange, IRange, IRange] {
    if (!range) return [null, null, null];
    const { top, right, bottom, left } = range;
    let leftOfCenter = Math.max(0, left - leftCols);
    let rightOfCenter = Math.min(right - leftCols, centerCols - 1);
    let leftOfRight = Math.max(0, left - leftCols - centerCols);
    let rightOfRight = right - leftCols - centerCols;
    return [
      {
        top,
        bottom,
        left: left,
        right: Math.min(right, leftCols - 1),
      },
      {
        top,
        bottom,
        left: leftOfCenter,
        right: rightOfCenter
      },
      {
        top,
        bottom,
        left: leftOfRight,
        right: rightOfRight
      },
    ];
  }

  setSelection(range: IRange) {
    const [rangeLeft, rangeCenter, rangeRight] = this.handleRange(range, this.leftColumns.length, this.centerColumns.length, this.rightColumns.length);
    this.left.setSelection(rangeLeft);
    this.center.setSelection(rangeCenter);
    this.right.setSelection(rangeRight);
  }

  get columns() {
    return [].concat(this.leftColumns, this.centerColumns, this.rightColumns);
  }

  revealRow(row: number): void {
    this.left.revealRow(row);
    this.center.revealRow(row);
    this.right.revealRow(row);
  }

  private installedPlugins: IPlugin[] = [];
  install(plugin: IPlugin): IDisposable {
    plugin.activate(this);
    this.installedPlugins.push(plugin);
    return {
      dispose: () => {
        this.installedPlugins = this.installedPlugins.filter(d => d !== plugin);
        plugin.deactivate();
      }
    };
  }

  dispose() {
    while (this.installedPlugins.length) {
      this.installedPlugins.pop().deactivate();
    }
    dispose(this.toDispose);
    this.toDispose.length = 0;
  }
}
