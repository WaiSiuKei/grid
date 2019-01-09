import { React } from '../rax';

function defaultFormatter(row: number, cell: number, value: any, columnDef: IGridColumnDefinition, dataContext: Datum): any {
  return function () {

    return React.createElement('div', null, (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  };
}

export interface Datum {
  [key: string]: any
}

export interface IGrid {}

export type IDataSource = Datum[]

export interface IGridOptions {
  explicitInitialization: boolean
  defaultColumnWidth: number
  showHeaderRow: boolean
  rowHeight: number
  defaultFormatter: CellFormatter,

  // enableAddRow: false,
  // leaveSpaceForNewRows: false,
  // enableCellNavigation: true,
  // enableColumnReorder: true,
  // forceFitColumns: false,
  // autoHeight: false,
  // headerRowHeight: 25,
  // createFooterRow: false,
  // showFooterRow: false,
  // footerRowHeight: 25,
  // formatterFactory: null,
  // editorFactory: null,
  // cellFlashingCssClass: "flashing",
  // selectedCellCssClass: "selected",
  // multiSelect: true,
  // enableTextSelectionOnCells: false,
  // dataItemColumnValueExtractor: null,
  // fullWidthRows: false,
  // multiColumnSort: false,
  // numberedMultiColumnSort: false,
  // tristateMultiColumnSort: false,
  // sortColNumberInSeparateSpan: false,

  // forceSyncScrolling: false,
  // addNewRowCssClass: "new-row",
  // preserveCopiedSelectionOnPaste: false,
  // showCellSelection: true,
  // viewportClass: null,
  // emulatePagingWhenScrolling: true, // when scrolling off bottom of viewport, place new row at top of viewport
  // editorCellNavOnLRKeys: false
}

export const GRID_DEFAULT: Partial<IGridOptions> = {
  explicitInitialization: false,
  defaultColumnWidth: 80,
  showHeaderRow: true,
  rowHeight: 20,
  defaultFormatter,
};

export const COLUMN_DEFAULT: Partial<IGridColumnDefinition> = {
  formatter: defaultFormatter
};

export interface CellFormatter {
  (row: number, cell: number, value: any, m: IGridColumnDefinition, item: Datum): any
}

export interface IGridColumnDefinition {
  id: string
  field: string
  name: string

  // rerenderOnResize: boolean
  // headerCssClass: string
  // resizable: boolean
  minWidth?: number
  width?: number
  maxWidth?: number
  flexGrow?: number
  flexShrink?: number
  // viewportClass: string
  // tooltip: string
  // colspan: number
  formatter?: CellFormatter
}

