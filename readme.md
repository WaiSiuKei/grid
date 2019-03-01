# Grid

A Blazing fast grid supports virtual scrolling and React jsx!!!

## Demo
- [Demo](https://waisiukei.github.io/grid/)

## Doc
Reference SlickGrid，the difference is that you should return a component in the formatter function；
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

### Grid options

- explicitInitialization?: boolean
- defaultColumnWidth?: number
- rowHeight?: number
- defaultFormatter?: CellFormatter,
- showHeaderRow?: boolean
- headerRowHeight?: number,
- viewportClass?: string,

### Column

- id: string
- field: string
- name?: string
- minWidth?: number
- width?: number
- maxWidth?: number
- flexGrow?: number
- flexShrink?: number
- formatter?: CellFormatter


### DataView

Reference SlickGrid.DataView

```
let dv = new DataView();

let t = new Grid(document.getElementById('myGrid'), dv, columns);

dv.setItems([...])

dv.push({...});
dv.pop();
dv.shift();
dv.unshift();
dv.splice(idx, deleteCount, ...items);

// Batched updated
dv.beginUpdate();
dv.push({...});
dv.shift();
dv.endUpdate();

```

#### Grouping

Multi-grouping is supported.

```
dv.setGrouping([{
  comparer(a: number, b: number) {
    return a - b;
  },
  accessor(d) {
    return Math.floor(d.percentComplete / 10);
  },
  aggregators: [
    new CountAggregator('percentComplete')
  ]
}]);
```

Five built-in aggregators are provided:

- AvgAggregator
- MinAggregator
- MaxAggregator
- SumAggregator
- CountAggregator

#### Sorting
Multi-sorting is supported.
```
dv.setSorting([{
  accessor: 'percentComplete',
  comparer(a: number, b: number) {
    return a - b;
  },
}, {
  accessor: 'title',
  comparer(a: number, b: number) {
    return a - b;
  },
}]);
```
## TODO
- [x] JSX
- [x] Virtual Scrolling
- [x] DataView
- [x] Groping
- [x] Sorting
- [ ] Filtering
- [ ] Colspan
