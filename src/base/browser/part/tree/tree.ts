
export interface ITree {
  layout(height?: number): void;
  setInput(element: any): Promise<any>;
}

export interface Datum {
  [key: string]: any
}

export interface IDataSource {
  items: Datum[]
  length: number
}

export interface IRenderer {

}

// Options

export interface ITreeConfiguration {
  dataSource: IDataSource;
  renderer?: IRenderer;
}

export interface ITreeOptions {

}

export interface ITreeContext extends ITreeConfiguration {
  tree: ITree;
  options: ITreeOptions;
}

