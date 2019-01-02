# Grid

A Blazing fast grid supports virtual scrolling and React jsx!!!

## Demo
- [Demo](https://waisiukei.github.io/grid/)

## Doc
###  Grid Options
Reference SlickGrid，the difference is that you should returen a component in the formatter function；
- In React project，you should use the built-in React-like library：

```jsx
function formatter(row, cell, value, columnDef, dataContext) {
  const { React } = grid
  return function app() {
    React.useLayoutEffect(() => {
      // console.log('hello', row, cell);
    });

    return <div>{value}</div>;
  };
}
```

or

```js
function formatter(row, cell, value, columnDef, dataContext) {
  const { React } = grid
  return function app() {
    React.useLayoutEffect(() => {
      // console.log('hello', row, cell);
    });

    return React.createElement('div', null, value);
  };
}
```

- In other project, you can use a JSX transpiler(of course, you can write vanilla js😰)

```
// babel.config.js

const plugins = [
  [
    '@babel/plugin-transform-react-jsx'
  ]
];

```


