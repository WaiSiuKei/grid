import { Disposable, IDisposable } from 'src/base/common/lifecycle';
import { canceled } from 'src/base/common/errors';

export class TimeoutTimer extends Disposable {
  private _token: any;

  constructor();
  constructor(runner: () => void, timeout: number);
  constructor(runner?: () => void, timeout?: number) {
    super();
    this._token = -1;

    if (typeof runner === 'function' && typeof timeout === 'number') {
      this.setIfNotSet(runner, timeout);
    }
  }

  dispose(): void {
    this.cancel();
    super.dispose();
  }

  cancel(): void {
    if (this._token !== -1) {
      clearTimeout(this._token);
      this._token = -1;
    }
  }

  cancelAndSet(runner: () => void, timeout: number): void {
    this.cancel();
    this._token = setTimeout(() => {
      this._token = -1;
      runner();
    }, timeout);
  }

  setIfNotSet(runner: () => void, timeout: number): void {
    if (this._token !== -1) {
      // timer is already set
      return;
    }
    this._token = setTimeout(() => {
      this._token = -1;
      runner();
    }, timeout);
  }
}

export interface ITask<T> {
  (): T;
}

/**
 * A helper to delay execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 *    const delayer = new Delayer(WAITING_PERIOD);
 *    const letters = [];
 *
 *    function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */
export class Delayer<T> implements IDisposable {

  private timeout: any;
  private completionPromise: Promise<any> | null;
  private doResolve: ((value?: any | Promise<any>) => void) | null;
  private doReject: (err: any) => void;
  private task: ITask<T | Promise<T>> | null;

  constructor(public defaultDelay: number) {
    this.timeout = null;
    this.completionPromise = null;
    this.doResolve = null;
    this.task = null;
  }

  trigger(task: ITask<T | Promise<T>>, delay: number = this.defaultDelay): Promise<T> {
    this.task = task;
    this.cancelTimeout();

    if (!this.completionPromise) {
      this.completionPromise = new Promise((c, e) => {
        this.doResolve = c;
        this.doReject = e;
      }).then(() => {
        this.completionPromise = null;
        this.doResolve = null;
        const task = this.task!;
        this.task = null;

        return task();
      });
    }

    this.timeout = setTimeout(() => {
      this.timeout = null;
      this.doResolve!(null);
    }, delay);

    return this.completionPromise;
  }

  isTriggered(): boolean {
    return this.timeout !== null;
  }

  cancel(): void {
    this.cancelTimeout();

    if (this.completionPromise) {
      this.doReject(canceled());
      this.completionPromise = null;
    }
  }

  private cancelTimeout(): void {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  dispose(): void {
    this.cancelTimeout();
  }
}

