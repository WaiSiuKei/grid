import './grid.css';

import { IDataSource, ITree, ITreeOptions, } from 'src/grid/tree';
import { TreeModel } from 'src/grid/treeModel';
import { TreeView } from 'src/grid/treeView';

export class Tree {

  private container: HTMLElement;

  private model: TreeModel;
  private view: TreeView;

  constructor(container: HTMLElement, ds: IDataSource, options: ITreeOptions = {}) {
    this.container = container;

    this.model = new TreeModel(ds);
    this.view = new TreeView(this.container, this.model);
  }

  layout() {
    this.view.layout();
  }
}
