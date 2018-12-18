export class EventData {
  _isPropagationStopped = false;
  _isImmediatePropagationStopped = false;

  /***
   * Stops event from propagating up the DOM tree.
   * @method stopPropagation
   */
  stopPropagation() {
    this._isPropagationStopped = true;
  }

  /***
   * Returns whether stopPropagation was called on this event object.
   * @method isPropagationStopped
   * @return {Boolean}
   */
  isPropagationStopped() {
    return this._isPropagationStopped;
  }

  /***
   * Prevents the rest of the handlers from being executed.
   * @method stopImmediatePropagation
   */
  stopImmediatePropagation() {
    this._isImmediatePropagationStopped = true;
  }

  /***
   * Returns whether stopImmediatePropagation was called on this event object.\
   * @method isImmediatePropagationStopped
   * @return {Boolean}
   */
  isImmediatePropagationStopped() {
    return this._isImmediatePropagationStopped;
  }
}

/***
 * A simple publisher-subscriber implementation.
 * @class Event
 * @constructor
 */
export class Event {
  _handlers: Function[] = [];

  /***
   * Adds an event handler to be called when the event is fired.
   * <p>Event handler will receive two arguments - an <code>EventData</code> and the <code>data</code>
   * object the event was fired with.<p>
   * @method subscribe
   * @param fn {Function} Event handler.
   */
  subscribe(fn: Function) {
    this._handlers.push(fn);
  };

  /***
   * Removes an event handler added with <code>subscribe(fn)</code>.
   * @method unsubscribe
   * @param fn {Function} Event handler to be removed.
   */
  unsubscribe(fn: Function) {
    for (let i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i] === fn) {
        this._handlers.splice(i, 1);
      }
    }
  }

  /***
   * Fires an event notifying all subscribers.
   * @method notify
   * @param args {Object} Additional data object to be passed to all handlers.
   * @param e {EventData}
   *      Optional.
   *      An <code>EventData</code> object to be passed to all handlers.
   *      For DOM events, an existing W3C/jQuery event object can be passed in.
   * @param scope {Object}
   *      Optional.
   *      The scope ("this") within which the handler will be executed.
   *      If not specified, the scope will be set to the <code>Event</code> instance.
   */
  notify(args: Object, e: EventData, context = null) {
    e = e || new EventData();

    let returnValue;
    for (let i = 0; i < this._handlers.length && !(e.isPropagationStopped() || e.isImmediatePropagationStopped()); i++) {
      returnValue = this._handlers[i].call(context, e, args);
    }

    return returnValue;
  }
}

export class EventHandler {
  _handlers: Array<{ event: Event, handler: Function }> = [];

  subscribe(event: Event, handler: Function) {
    this._handlers.push({ event, handler });
    event.subscribe(handler);

    return this;  // allow chaining
  }

  unsubscribe(event: Event, handler: Function) {
    let i = this._handlers.length;
    while (i--) {
      if (this._handlers[i].event === event &&
        this._handlers[i].handler === handler) {
        this._handlers.splice(i, 1);
        event.unsubscribe(handler);
        break;
      }
    }

    return this;  // allow chaining
  }

  unsubscribeAll() {
    let i = this._handlers.length;
    while (i--) {
      this._handlers[i].event.unsubscribe(this._handlers[i].handler);
    }
    this._handlers = [];

    return this;  // allow chaining
  }
}
