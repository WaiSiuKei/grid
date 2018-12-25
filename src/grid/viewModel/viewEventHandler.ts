/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from 'src/base/common/lifecycle';
import { ViewEvent, ViewEventType, ViewScrollChangedEvent } from 'src/grid/view/viewEvents';

export class ViewEventHandler extends Disposable {

	private _shouldRender: boolean;

	constructor() {
		super();
		this._shouldRender = true;
	}

	public shouldRender(): boolean {
		return this._shouldRender;
	}

	public forceShouldRender(): void {
		this._shouldRender = true;
	}

	protected setShouldRender(): void {
		this._shouldRender = true;
	}

	public onDidRender(): void {
		this._shouldRender = false;
	}

	// --- begin event handlers
	public onScrollChanged(e: ViewScrollChangedEvent): boolean {
		return false;
	}
	// --- end event handlers

	public handleEvents(events: ViewEvent[]): void {

		let shouldRender = false;

		for (let i = 0, len = events.length; i < len; i++) {
			let e = events[i];

			switch (e.type) {
				case ViewEventType.ViewScrollChanged:
					if (this.onScrollChanged(e)) {
						shouldRender = true;
					}
					break;

				default:
					console.info('View received unknown event: ');
					console.info(e);
			}
		}

		if (shouldRender) {
			this._shouldRender = true;
		}
	}
}
