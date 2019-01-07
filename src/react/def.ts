export type Key = string | number;

export interface Attributes {
  [key: string]: string | number
  [idx: number]: string | number
  // key?: Key;
}

export interface ReactElement<P> {
  type: string | ComponentClass<P> | FunctionComponent<P>;
  props: P;
  key: Key | null;
}

export type ReactText = string | number;
export type ReactEmpty = null | void | boolean;

export type ReactChild = ReactElement<any> | ReactText;

export type ReactNode = ReactText | ReactElement<any>
export type ReactNodeList = ReactEmpty | ReactNode;

export type ComponentState = any;

export interface ReactComponent<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}

export interface NewLifecycle<P, S, SS> {
  /**
   * Runs before Rax applies the result of `render` to the document, and
   * returns an object to be given to componentDidUpdate. Useful for saving
   * things such as scroll position before `render` causes changes to it.
   *
   * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
   * lifecycle events from running.
   */
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
  /**
   * Called immediately after updating occurs. Not called for the initial render.
   *
   * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
   */
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
}

export interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS> {
  /**
   * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void;
  /**
   * Called to determine whether the change in props and state should trigger a re-render.
   *
   * `Component` always returns true.
   * `PureComponent` implements a shallow comparison on props and state and returns true if any
   * props or states have changed.
   *
   * If false is returned, `Component#render`, `componentWillUpdate`
   * and `componentDidUpdate` will not be called.
   */
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount?(): void;
  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
}

export interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string;
}

export interface ComponentClass<P = {}, S = ComponentState> {
  new(props: P, context?: any): ReactComponent<P, S>;
  defaultProps?: Partial<P>;
  displayName?: string;
}

export interface FunctionComponent<P = {}> {
  (props: P & { children?: ReactNode }, context?: any): ReactElement<any> | null;
  defaultProps?: Partial<P>;
  displayName?: string;
}

export interface FunctionComponentElement<P> extends ReactElement<P> {
  type: FunctionComponent<P>;
  // ref?: 'ref' extends keyof P ? P extends { ref?: infer R } ? R : never : never;
}
