import { Disposable } from 'src/base/common/lifecycle';
import { IViewModel } from 'src/grid/viewModel/viewModel';
import { ViewScrollChangedEvent } from 'src/grid/view/viewEvents';
import { IScrollEvent } from 'src/grid/gridCommon';

export interface EventCallback<T> {
  (event: T): void;
}

export class ViewOutgoingEvents extends Disposable {

  public onDidScroll: EventCallback<IScrollEvent> | null = null;
  public onDidGainFocus: EventCallback<void> | null = null;
  public onDidLoseFocus: EventCallback<void> | null = null;
  // public onKeyDown: EventCallback<IKeyboardEvent> | null = null;
  // public onKeyUp: EventCallback<IKeyboardEvent> | null = null;
  // public onContextMenu: EventCallback<IEditorMouseEvent> | null = null;
  // public onMouseMove: EventCallback<IEditorMouseEvent> | null = null;
  // public onMouseLeave: EventCallback<IPartialEditorMouseEvent> | null = null;
  // public onMouseUp: EventCallback<IEditorMouseEvent> | null = null;
  // public onMouseDown: EventCallback<IEditorMouseEvent> | null = null;
  // public onMouseDrag: EventCallback<IEditorMouseEvent> | null = null;
  // public onMouseDrop: EventCallback<IPartialEditorMouseEvent> | null = null;

  private _viewModel: IViewModel;

  constructor(viewModel: IViewModel) {
    super();
    this._viewModel = viewModel;
  }

  public emitScrollChanged(e: ViewScrollChangedEvent): void {
    if (this.onDidScroll) {
      this.onDidScroll(e);
    }
  }

  public emitViewFocusGained(): void {
    if (this.onDidGainFocus) {
      this.onDidGainFocus(void 0);
    }
  }

  public emitViewFocusLost(): void {
    if (this.onDidLoseFocus) {
      this.onDidLoseFocus(void 0);
    }
  }

  // public emitKeyDown(e: IKeyboardEvent): void {
  //   if (this.onKeyDown) {
  //     this.onKeyDown(e);
  //   }
  // }
  //
  // public emitKeyUp(e: IKeyboardEvent): void {
  //   if (this.onKeyUp) {
  //     this.onKeyUp(e);
  //   }
  // }

  // public emitContextMenu(e: IEditorMouseEvent): void {
  //   if (this.onContextMenu) {
  //     this.onContextMenu(this._convertViewToModelMouseEvent(e));
  //   }
  // }
  //
  // public emitMouseMove(e: IEditorMouseEvent): void {
  //   if (this.onMouseMove) {
  //     this.onMouseMove(this._convertViewToModelMouseEvent(e));
  //   }
  // }
  //
  // public emitMouseLeave(e: IPartialEditorMouseEvent): void {
  //   if (this.onMouseLeave) {
  //     this.onMouseLeave(this._convertViewToModelMouseEvent(e));
  //   }
  // }
  //
  // public emitMouseUp(e: IEditorMouseEvent): void {
  //   if (this.onMouseUp) {
  //     this.onMouseUp(this._convertViewToModelMouseEvent(e));
  //   }
  // }
  //
  // public emitMouseDown(e: IEditorMouseEvent): void {
  //   if (this.onMouseDown) {
  //     this.onMouseDown(this._convertViewToModelMouseEvent(e));
  //   }
  // }
  //
  // public emitMouseDrag(e: IEditorMouseEvent): void {
  //   if (this.onMouseDrag) {
  //     this.onMouseDrag(this._convertViewToModelMouseEvent(e));
  //   }
  // }
  //
  // public emitMouseDrop(e: IPartialEditorMouseEvent): void {
  //   if (this.onMouseDrop) {
  //     this.onMouseDrop(this._convertViewToModelMouseEvent(e));
  //   }
  // }

  // private _convertViewToModelMouseEvent(e: IEditorMouseEvent): IEditorMouseEvent;
  // private _convertViewToModelMouseEvent(e: IPartialEditorMouseEvent): IPartialEditorMouseEvent;
  // private _convertViewToModelMouseEvent(e: IEditorMouseEvent | IPartialEditorMouseEvent): IEditorMouseEvent | IPartialEditorMouseEvent {
  //   if (e.target) {
  //     return {
  //       event: e.event,
  //       target: this._convertViewToModelMouseTarget(e.target)
  //     };
  //   }
  //   return e;
  // }
  //
  // private _convertViewToModelMouseTarget(target: IMouseTarget): IMouseTarget {
  //   return new ExternalMouseTarget(
  //     target.element,
  //     target.type,
  //     target.mouseColumn,
  //     target.position ? this._convertViewToModelPosition(target.position) : null,
  //     target.range ? this._convertViewToModelRange(target.range) : null,
  //     target.detail
  //   );
  // }
  //
  // private _convertViewToModelPosition(viewPosition: Position): Position {
  //   return this._viewModel.coordinatesConverter.convertViewPositionToModelPosition(viewPosition);
  // }
  //
  // private _convertViewToModelRange(viewRange: Range): Range {
  //   return this._viewModel.coordinatesConverter.convertViewRangeToModelRange(viewRange);
  // }
}

