import './grid.css';

import { GridView } from 'src/grid/gridView';

export class Grid extends GridView {
  render() {
    this.layout();
  }

  dispose() {
    super.dispose();
  }
}
