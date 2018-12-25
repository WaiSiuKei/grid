import { ViewPart } from 'src/grid/view/viewPart';
import { FastDomNode } from 'src/base/browser/fastDomNode';
import { ViewContext } from 'src/grid/view/viewContext';

export class ViewRows extends ViewPart {
  private readonly domNode: FastDomNode<HTMLElement>;

  constructor(context: ViewContext, linesContent: FastDomNode<HTMLElement>) {
    super(context);

  }

  public dispose(): void {
    super.dispose();
  }

  public getDomNode(): FastDomNode<HTMLElement> {
    return this.domNode;
  }

  // ---- begin view event handlers
  // public onScrollChanged(e: ViewScrollChangedEvent): boolean {
  //   this.domNode.setWidth(e.scrollWidth);
  //   return this._visibleLines.onScrollChanged(e) || true;
  // }

  public prepareRender(): void {
    throw new Error('Not supported');
  }

  public render(): void {
    throw new Error('Not supported');
  }

}
