/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDataSource, IRenderer, ITree, ITreeConfiguration, ITreeContext, ITreeOptions, } from 'src/base/browser/part/tree/tree';
import { TreeModel } from 'src/base/browser/part/tree/treeModel';
import { TreeView } from 'src/base/browser/part/tree/treeView';

export class TreeContext implements ITreeContext {

  public tree: ITree;
  public configuration: ITreeConfiguration;
  public options: ITreeOptions;

  public dataSource: IDataSource;
  public renderer: IRenderer;

  constructor(tree: ITree, configuration: ITreeConfiguration, options: ITreeOptions = {}) {
    this.tree = tree;
    this.configuration = configuration;
    this.options = options;

    this.dataSource = configuration.dataSource;
    this.renderer = configuration.renderer;
  }
}

export class Tree implements ITree {

  private container: HTMLElement;

  private context: ITreeContext;
  private model: TreeModel;
  private view: TreeView;

  constructor(container: HTMLElement, configuration: ITreeConfiguration, options: ITreeOptions = {}) {
    this.container = container;

    this.context = new TreeContext(this, configuration, options);
    this.model = new TreeModel(this.context);
    this.view = new TreeView(this.context, this.container);

    this.view.setModel(this.model);
  }

  public layout(height?: number, width?: number): void {
    this.view.layout(height, width);
  }

  public setInput(element: any): Promise<any> {
    return this.model.setInput(element);
  }

  public dispose(): void {
    if (this.model !== null) {
      this.model.dispose();
      this.model = null;
    }
    if (this.view !== null) {
      this.view.dispose();
      this.view = null;
    }
  }
}
