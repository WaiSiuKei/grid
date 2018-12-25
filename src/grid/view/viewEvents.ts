import { onUnexpectedError } from 'src/base/common/errors';
import { Disposable, IDisposable, toDisposable } from 'src/base/common/lifecycle';
import { ScrollEvent } from 'src/base/common/scrollable';

export const enum ViewEventType {
  ViewConfigurationChanged = 1,
  ViewCursorStateChanged = 2,
  ViewDecorationsChanged = 3,
  ViewFlushed = 4,
  ViewFocusChanged = 5,
  ViewLineMappingChanged = 6,
  ViewLinesChanged = 7,
  ViewLinesDeleted = 8,
  ViewLinesInserted = 9,
  ViewRevealRangeRequest = 10,
  ViewScrollChanged = 11,
  ViewTokensChanged = 12,
  ViewTokensColorsChanged = 13,
  ViewZonesChanged = 14,
  ViewThemeChanged = 15,
  ViewLanguageConfigurationChanged = 16
}

export class ViewScrollChangedEvent {

  public readonly type = ViewEventType.ViewScrollChanged;

  public readonly scrollWidth: number;
  public readonly scrollLeft: number;
  public readonly scrollHeight: number;
  public readonly scrollTop: number;

  public readonly scrollWidthChanged: boolean;
  public readonly scrollLeftChanged: boolean;
  public readonly scrollHeightChanged: boolean;
  public readonly scrollTopChanged: boolean;

  constructor(source: ScrollEvent) {
    this.scrollWidth = source.scrollWidth;
    this.scrollLeft = source.scrollLeft;
    this.scrollHeight = source.scrollHeight;
    this.scrollTop = source.scrollTop;

    this.scrollWidthChanged = source.scrollWidthChanged;
    this.scrollLeftChanged = source.scrollLeftChanged;
    this.scrollHeightChanged = source.scrollHeightChanged;
    this.scrollTopChanged = source.scrollTopChanged;
  }
}

export type ViewEvent = (
  ViewScrollChangedEvent
  );

export interface IViewEventListener {
  (events: ViewEvent[]): void;
}

export class ViewEventEmitter extends Disposable {
  private _listeners: IViewEventListener[];
  private _collector: ViewEventsCollector | null;
  private _collectorCnt: number;

  constructor() {
    super();
    this._listeners = [];
    this._collector = null;
    this._collectorCnt = 0;
  }

  public dispose(): void {
    this._listeners = [];
    super.dispose();
  }

  protected _beginEmit(): ViewEventsCollector {
    this._collectorCnt++;
    if (this._collectorCnt === 1) {
      this._collector = new ViewEventsCollector();
    }
    return this._collector!;
  }

  protected _endEmit(): void {
    this._collectorCnt--;
    if (this._collectorCnt === 0) {
      const events = this._collector!.finalize();
      this._collector = null;
      if (events.length > 0) {
        this._emit(events);
      }
    }
  }

  private _emit(events: ViewEvent[]): void {
    const listeners = this._listeners.slice(0);
    for (let i = 0, len = listeners.length; i < len; i++) {
      safeInvokeListener(listeners[i], events);
    }
  }

  public addEventListener(listener: (events: ViewEvent[]) => void): IDisposable {
    this._listeners.push(listener);
    return toDisposable(() => {
      let listeners = this._listeners;
      for (let i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
          break;
        }
      }
    });
  }
}

export class ViewEventsCollector {

  private _events: ViewEvent[];
  private _eventsLen = 0;

  constructor() {
    this._events = [];
    this._eventsLen = 0;
  }

  public emit(event: ViewEvent) {
    this._events[this._eventsLen++] = event;
  }

  public finalize(): ViewEvent[] {
    let result = this._events;
    this._events = [];
    return result;
  }

}

function safeInvokeListener(listener: IViewEventListener, events: ViewEvent[]): void {
  try {
    listener(events);
  } catch (e) {
    onUnexpectedError(e);
  }
}
