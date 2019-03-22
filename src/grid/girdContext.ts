import { GridModel } from 'src/grid/gridModel';
import { IGridOptions, InternalGridColumnDefinition } from 'src/grid/grid';

export class GridContext {
  constructor(
    public model: GridModel,
    public columns: InternalGridColumnDefinition[],
    public options: IGridOptions
  ) {}
}
