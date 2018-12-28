import { GridModel } from 'src/grid/gridModel';
import { IGridColumnDefinition, IGridOptions } from 'src/grid/grid';

export class GridContext {
  constructor(
    public model: GridModel,
    public columns: IGridColumnDefinition[],
    public options: IGridOptions
  ) {}
}
