/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event, Emitter, Relay } from 'src/base/common/event';
import { ITreeContext } from 'src/base/browser/part/tree/tree';

export class Item {
  private context: ITreeContext;
  private element: any;

  public id: string;

  private height: number;

  private visible: boolean;

  private _onDidCreate = new Emitter<Item>();
  readonly onDidCreate: Event<Item> = this._onDidCreate.event;
  private _onDidDispose = new Emitter<Item>();
  readonly onDidDispose: Event<Item> = this._onDidDispose.event;

  private _isDisposed: boolean;

  constructor(id: string, context: ITreeContext, element: any) {
    this.context = context;
    this.element = element;

    this.id = id;

    this._onDidCreate.fire(this);

    this.visible = this._isVisible();
    this.height = this._getHeight();

    this._isDisposed = false;
  }

  public getElement(): any {
    return this.element;
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public setVisible(value: boolean): void {
    this.visible = value;
  }

  public getHeight(): number {
    return this.height;
  }

  private updateVisibility(): void {
    this.setVisible(this._isVisible());
  }

  /* protected */
  public _getHeight(): number {
    return this.context.renderer.getHeight(this.context.tree, this.element);
  }

  /* protected */
  public _isVisible(): boolean {
    return this.context.filter.isVisible(this.context.tree, this.element);
  }

  public isDisposed(): boolean {
    return this._isDisposed;
  }

  public dispose(): void {
    this._onDidDispose.fire(this);

    this._onDidCreate.dispose();
    this._onDidDispose.dispose();

    this._isDisposed = true;
  }
}

export interface IBaseEvent {
  item: Item;
}

export interface IInputEvent extends IBaseEvent {}

export class TreeModel {

  private context: ITreeContext;
  private input: Item;

  private _onSetInput = new Emitter<IInputEvent>();
  readonly onSetInput: Event<IInputEvent> = this._onSetInput.event;
  private _onDidSetInput = new Emitter<IInputEvent>();
  readonly onDidSetInput: Event<IInputEvent> = this._onDidSetInput.event;

  constructor(context: ITreeContext) {
    this.context = context;
    this.input = null;
  }

  public setInput(element: any): Promise<any> {
    var eventData: IInputEvent = { item: this.input };
    this._onSetInput.fire(eventData);

    if (this.input) {
      this.input.dispose();
    }

    var id = this.context.dataSource.getId(this.context.tree, element);
    this.input = new RootItem(id,this.context, element);
    eventData = { item: this.input };
    this._onDidSetInput.fire(eventData);
    return this.refresh(this.input);
  }

  public getInput(): any {
    return this.input ? this.input.getElement() : null;
  }

  public getItem(element: any = null): Item {
    if (element === null) {
      return this.input;
    } else if (element instanceof Item) {
      return element;
    }
  }

  public dispose(): void {
    this._onSetInput.dispose();
    this._onDidSetInput.dispose();
  }
}
