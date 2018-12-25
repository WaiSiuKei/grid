import { dispose, IDisposable } from 'src/base/common/lifecycle';
import { EventType, isAncestor } from 'src/base/browser/dom';
import { Event, Emitter } from 'src/base/common/event';
import { domEvent } from 'src/base/browser/event';

export interface IFocusTracker {
  onDidFocus: Event<void>;
  onDidBlur: Event<void>;
  dispose(): void;
}

class FocusTracker implements IFocusTracker {

  private _onDidFocus = new Emitter<void>();
  readonly onDidFocus: Event<void> = this._onDidFocus.event;

  private _onDidBlur = new Emitter<void>();
  readonly onDidBlur: Event<void> = this._onDidBlur.event;

  private disposables: IDisposable[] = [];

  constructor(element: HTMLElement | Window) {
    let hasFocus = isAncestor(document.activeElement, <HTMLElement>element);
    let loosingFocus = false;

    let onFocus = () => {
      loosingFocus = false;
      if (!hasFocus) {
        hasFocus = true;
        this._onDidFocus.fire();
      }
    };

    let onBlur = () => {
      if (hasFocus) {
        loosingFocus = true;
        window.setTimeout(() => {
          if (loosingFocus) {
            loosingFocus = false;
            hasFocus = false;
            this._onDidBlur.fire();
          }
        }, 0);
      }
    };

    domEvent(element, EventType.FOCUS, true)(onFocus, null, this.disposables);
    domEvent(element, EventType.BLUR, true)(onBlur, null, this.disposables);
  }

  dispose(): void {
    this.disposables = dispose(this.disposables);
    this._onDidFocus.dispose();
    this._onDidBlur.dispose();
  }
}

export function trackFocus(element: HTMLElement | Window): IFocusTracker {
  return new FocusTracker(element);
}
