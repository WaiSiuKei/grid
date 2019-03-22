import { IPlugin } from 'src/plugins/plugin';
import { Disposable } from 'src/base/common/lifecycle';
import { IGrid, IRange } from 'src/grid/grid';
import { KeyCode } from 'src/base/common/keyCodes';

export class RowSelectionPlugin extends Disposable implements IPlugin {
  activate(grid: IGrid) {
    this._register(grid.onClick(e => {
      grid.setSelection({
        left: 0,
        right: grid.columns.length - 1,
        top: e.row,
        bottom: e.row,
      });
    }));

    this._register(grid.onKeyDown(e => {
      let s: IRange;
      switch (e.keyCode) {
        case KeyCode.UpArrow:
          s = grid.getSelection();
          if (s.top > 0) {
            s.top--;
            s.bottom = s.top;
            grid.setSelection(s);
            grid.revealRow(s.top);
          }
          break;
        case KeyCode.DownArrow:
          let maxIndex = grid.model.length - 1;
          s = grid.getSelection();
          if (s.top < maxIndex) {
            s.top++;
            s.bottom = s.top;
            grid.setSelection(s);
            grid.revealRow(s.top);
          }
          break;
        case KeyCode.Escape:
          grid.setSelection(null);
          break;
        default:
          break;
      }
    }));
  }

  deactivate() {

  }
}
