import { Event, Emitter } from 'src/base/common/event';

export type EventHandler = HTMLElement | HTMLDocument | Window;

export interface IDomEvent {
  <K extends keyof HTMLElementEventMap>(element: EventHandler, type: K, useCapture?: boolean): Event<HTMLElementEventMap[K]>;
  (element: EventHandler, type: string, useCapture?: boolean): Event<any>;
}

export const domEvent: IDomEvent = (element: EventHandler, type: string, useCapture?: boolean) => {
  const fn = (e: any) => emitter.fire(e);
  const emitter = new Emitter<any>({
    onFirstListenerAdd: () => {
      element.addEventListener(type, fn, useCapture);
    },
    onLastListenerRemove: () => {
      element.removeEventListener(type, fn, useCapture);
    }
  });

  return emitter.event;
};

export interface CancellableEvent {
  preventDefault(): void;
  stopPropagation(): void;
}

export function stop<T extends CancellableEvent>(event: Event<T>): Event<T> {
  return Event.map(event, e => {
    e.preventDefault();
    e.stopPropagation();
    return e;
  });
}
