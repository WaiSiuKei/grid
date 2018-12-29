import { React } from 'src/rax';

function defaultFormatter(row: number, cell: number, value: any, columnDef: IGridColumnDefinition, dataContext: Datum): any {
  React.useEffect(() => {
    console.log('hello', row, cell);
  });
  return React.createElement('div', null, (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
}

export interface Datum {
  [key: string]: any
}

export interface IGrid {}

export type IDataSource = Datum[]

export interface IGridOptions {
  // alwaysShowVerticalScroll: boolean
  // explicitInitialization: boolean
  defaultColumnWidth: number
  showHeaderRow: boolean
  rowHeight: number
  // forceFitColumns: boolean
  // autoHeight: boolean
  // viewportClass: string
  // leaveSpaceForNewRows: boolean
  // fullWidthRows: boolean
  // headerRowHeight: number
  // forceSyncScrolling: boolean
  // enableAsyncPostRenderCleanup: boolean
  // enableAddRow: boolean
  // asyncPostRenderCleanupDelay: number
  // minRowBuffer: number
  // enableAsyncPostRender: boolean
  // asyncPostRenderDelay: number
  // showCellSelection: boolean
  // addNewRowCssClass: string
}

export const GRID_DEFAULT: Partial<IGridOptions> = {
  defaultColumnWidth: 80,
  showHeaderRow: true,
  rowHeight: 20
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
  minWidth: number
  width?: number
  maxWidth: number
  // viewportClass: string
  // tooltip: string
  // colspan: number
  // asyncPostRenderCleanup: (node: HTMLElement, row: number, col: IGridColumnDefinition) => void
  // cssClass: string
  // asyncPostRender?: (node: HTMLElement, row: number, context: Datum, m: IGridColumnDefinition, c: boolean) => void
  formatter?: CellFormatter
}

