import { IGrid } from 'src/grid/grid';

export interface IPlugin {
  activate(grid: IGrid): void
  deactivate(): void
}
