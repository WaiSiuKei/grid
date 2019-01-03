// 实例化组件
export function Fiber(vnode) {
  Object.assign(this, vnode);
  let type = vnode.type || 'ProxyComponent(react-hot-loader)';
  this.name = type.displayName || type.name || type;
  this.effectTag = 1;
}
