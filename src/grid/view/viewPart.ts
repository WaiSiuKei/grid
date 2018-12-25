import { ViewEventHandler } from 'src/grid/viewModel/viewEventHandler';
import { ViewContext } from 'src/grid/view/viewContext';
import { RenderingContext } from 'src/grid/view/renderingContext';

export abstract class ViewPart extends ViewEventHandler {

  _context: ViewContext;

  constructor(context: ViewContext) {
    super();
    this._context = context;
    this._context.addEventHandler(this);
  }

  public dispose(): void {
    this._context.removeEventHandler(this);
    super.dispose();
  }

  public abstract prepareRender(ctx: RenderingContext): void;
  public abstract render(ctx: RenderingContext): void;
}

