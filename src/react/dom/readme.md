## dom-renderer

ReactDOM的迷你实现

duplex.js 是实现React受控组件

event.js 实现基于事件冒泡的事件系统，重点处理mouseenter,mouseleave（用mouseover/mouseout实现），wheel（对应原生三种事件），focus, blur(全局捕捉)， change事件（它在一些控件中相当于oninput事件，并要处理拼音输入法问题），doubleclick别名

props.js 属性系统，涉及到SVG 一些属性名不规则问题

style.js 样式系统

findDOMNode.js findHostInstance的封装

DOMRenderer.js 注入各种DOM操作方法，如removeElement, createElement, insertElement, emptyElement, updateContent

index.js 入口文件
