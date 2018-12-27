export interface Datum {
  [key: string]: any
}

export interface IGrid {}

export type IDataSource = Datum[]

export interface IGridOptions {
  // alwaysShowVerticalScroll: boolean
  // explicitInitialization: boolean
  // defaultColumnWidth: number
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

export interface CellFormatter {
  (row: number, cell: number, value: any, m: IGridColumnDefinition, item: Datum): string
}

export interface IGridColumnDefinition {
  id: string
  field: string
  name: string
  // resizable: boolean
  // minWidth: number
  // rerenderOnResize: boolean
  // headerCssClass: string
  width?: number
  // maxWidth: number
  // viewportClass: string
  // tooltip: string
  // colspan: number
  // asyncPostRenderCleanup: (node: HTMLElement, row: number, col: IGridColumnDefinition) => void
  // cssClass: string
  // asyncPostRender?: (node: HTMLElement, row: number, context: Datum, m: IGridColumnDefinition, c: boolean) => void
  formatter?: CellFormatter
}

