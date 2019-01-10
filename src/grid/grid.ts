import { React } from '../rax';
import { Datum } from 'src/data/data';

function defaultFormatter(value: any, columnDef: IGridColumnDefinition, dataContext: Datum): any {
  return function () {

    return React.createElement('div', null, (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  };
}

export interface IGridOptions {
  explicitInitialization: boolean
  defaultColumnWidth: number
  rowHeight: number
  defaultFormatter: CellFormatter,
  showHeaderRow: boolean
  headerRowHeight: number,
  viewportClass: string,

  // enableAddRow: false,
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
};

export const COLUMN_DEFAULT: Partial<IGridColumnDefinition> = {
  formatter: defaultFormatter
};

export interface CellFormatter {
  (value: any, m: IGridColumnDefinition, item: Datum): any
}

export interface IGridColumnDefinition {
  id: string
  field: string
  name: string

  // headerCssClass: string
  // resizable: boolean
  minWidth?: number
  width?: number
  maxWidth?: number
  flexGrow?: number
  flexShrink?: number
  // tooltip: string
  // colspan: number
  formatter?: CellFormatter
}

