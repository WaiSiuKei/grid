import { React } from '../rax';
import { Datum, SortingSetting } from 'src/data/data';
import { Event, Emitter } from 'src/base/common/event';
import { StandardKeyboardEvent } from 'src/base/browser/ui/keyboardEvent';
import { ScrollEvent } from 'src/base/common/scrollable';
import { ScrollableElement } from 'src/base/browser/ui/scrollbar/scrollableElement';
import { GridModel } from 'src/grid/gridModel';

function defaultFormatter(value: any, columnDef: InternalGridColumnDefinition, dataContext: Datum): any {
  return React.createElement('div', null, (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
}

export interface IGridOptions {
  explicitInitialization: boolean
  defaultColumnWidth: number
  rowHeight: number
  defaultFormatter: CellFormatter,
  showHeaderRow: boolean
  headerRowHeight: number,
  viewportClass: string,
  scrollbarSize?: number
  theme: string

  internalShowGroup?: boolean
  // enableCellNavigation: true,
  // enableColumnReorder: true,
  // forceFitColumns: false,
  // autoHeight: false,
  // cellFlashingCssClass: "flashing",
  // selectedCellCssClass: "selected",
  // multiSelect: true,
  // dataItemColumnValueExtractor: null,
  // fullWidthRows: false,
  // multiColumnSort: false,
  // numberedMultiColumnSort: false,
  // tristateMultiColumnSort: false,
  // sortColNumberInSeparateSpan: false,

  // forceSyncScrolling: false,
  // addNewRowCssClass: "new-row",
  // showCellSelection: true,
  // emulatePagingWhenScrolling: true, // when scrolling off bottom of viewport, place new row at top of viewport
}

export const GRID_DEFAULT: Partial<IGridOptions> = {
  explicitInitialization: true,
  defaultColumnWidth: 80,
  rowHeight: 20,
  defaultFormatter,
  showHeaderRow: true,
  headerRowHeight: 20,
  scrollbarSize: 8,
};

export const COLUMN_DEFAULT: Partial<IGridColumnDefinition> = {
  formatter: defaultFormatter
};

export interface CellFormatter {
  (value: any, m: IGridColumnDefinition, item: Datum): any
}

export enum ColumnPinAlignment {
  Left = 'left',
  Right = 'right'
}

export interface IGridColumnDefinition {
  id: string
  field: string
  name: string

  headerClass?: string
  cssClass?: string
  minWidth?: number
  width?: number
  maxWidth?: number
  flexGrow?: number
  flexShrink?: number
  formatter?: CellFormatter
  pinned?: ColumnPinAlignment
  sortable?: boolean | Partial<SortingSetting>
  internalSortingDirection?: 'asc' | 'desc' | ''
}

export interface InternalGridColumnDefinition {
  id: string
  field: string
  name: string

  headerClass?: string
  cssClass?: string
  minWidth?: number
  width?: number
  maxWidth?: number
  flexGrow?: number
  flexShrink?: number
  formatter?: CellFormatter
  pinned?: ColumnPinAlignment
  sortable?: Partial<SortingSetting>
  internalSortingDirection?: 'asc' | 'desc' | ''
}

export interface IRange {
  left: number // column index
  right: number // column index
  top: number
  bottom: number
}

export interface IGridMouseEvent {
  // x: number
  // y: number
  clientX: number
  clientY: number
  row: number,
  column: InternalGridColumnDefinition
  data: Datum
}

export interface IGridWidget {
  onClick: Event<IGridMouseEvent>
  onKeyDown: Event<StandardKeyboardEvent>
  scrollableElement: ScrollableElement
  layout(height?: number, width?: number): void
  handleScroll(e: ScrollEvent): void
  invalidate(): void
  invalidateRow(idx: number): void
  invalidateRows(idxs: number[]): void
  invalidateAllRows(): void
  setSelection(range: IRange): void
  getSelection(): IRange
  revealRow(row: number): void
}

export interface IGrid {
  onClick: Event<IGridMouseEvent>
  onKeyDown: Event<StandardKeyboardEvent>
  columns: InternalGridColumnDefinition[]
  model: GridModel;
  // invalidate(): void
  // invalidateRow(idx: number): void
  // invalidateRows(idxs: number[]): void
  // invalidateAllRows(): void
  setSelection(range: IRange): void
  getSelection(): IRange
  revealRow(row: number): void
}
