import { IGridOptions } from 'src/grid/gridOptions';

export interface IGrid {

}

export interface IConfiguration {

  readonly grid: IGridOptions;
}

export interface IScrollEvent {
  readonly scrollTop: number;
  readonly scrollLeft: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;

  readonly scrollTopChanged: boolean;
  readonly scrollLeftChanged: boolean;
  readonly scrollWidthChanged: boolean;
  readonly scrollHeightChanged: boolean;
}
