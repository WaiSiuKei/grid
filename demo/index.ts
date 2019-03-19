// import './index.scss';
import { Grid } from 'src/grid/gridImpl';
import { DataView } from 'src/data/dataView';
import { CountAggregator } from 'src/data/aggregation';

let columns = [
  // multi columns
  { id: 'title', name: 'Title', field: 'title' },
  { id: 'duration', name: 'Duration', field: 'duration' },
  { id: '%', name: '% Complete', field: 'percentComplete' },
  { id: 'start', name: 'Start', field: 'start' },
  { id: 'finish', name: 'Finish', field: 'finish' },
  { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven' },
  { id: 'a', name: 'a', field: 'a' },
  { id: 'b', name: 'b', field: 'b' },
  { id: 'c', name: 'c', field: 'c' },
  { id: 'd', name: 'd', field: 'd' },
  { id: 'e', name: 'e', field: 'e' },
  { id: 'f', name: 'f', field: 'f' },
  { id: 'g', name: 'g', field: 'g' },
  { id: 'h', name: 'h', field: 'h' },
  { id: 'i', name: 'i', field: 'i' },
  { id: 'j', name: 'j', field: 'j' },

  // flex grow
  // { id: 'a', name: 'a', field: 'a', flexGrow: 1 },
  // { id: 'b', name: 'b', field: 'b' },

  // flex shrink
  // { id: 'a', name: 'a', field: 'a', flexShrink: 1 },
  // { id: 'b', name: 'b', field: 'b', flexShrink: 1 },
  // { id: 'c', name: 'c', field: 'c', flexShrink: 1 },
  // { id: 'd', name: 'd', field: 'd', flexShrink: 1 },
  // { id: 'e', name: 'e', field: 'e', flexShrink: 1 },
  // { id: 'f', name: 'f', field: 'f', flexShrink: 1 },
  // { id: 'g', name: 'g', field: 'g', flexShrink: 1 },
  // { id: 'h', name: 'h', field: 'h', flexShrink: 1 },
];

let data = [];
for (let i = 0; i < 100; i++) {
  data[i] = {
    // title: 'Task ' + i,
    title: i,
    duration: '5 days',
    percentComplete: Math.round(Math.random() * 100),
    start: '01/01/2009',
    finish: '01/05/2009',
    effortDriven: (i % 5 == 0),
    a: 'a',
    b: 'b',
    c: 'c',
    d: 'd',
    e: 'e',
    f: 'f',
    g: 'g',
    h: 'h',
    i: 'i',
    j: 'j',
  };
}
//
// let columns = [];
// let data = [];
// for (let i = 0; i < 10000; i++) {
//   let t = {};
//   for (let j = 0; j < 10000; j++) {
//     t[j] = j + i;
//   }
//   data[i] = t;
// }
//
// for (let j = 0; j < 10000; j++) {
//   columns.push({ id: j.toString(), name: 'Col' + j.toString(), field: j.toString() });
// }

let dv = new DataView();

let t = new Grid(document.getElementById('myGrid'), dv, columns);

// dv.setGrouping([{
//   comparer(a: number, b: number) {
//     return a - b;
//   },
//   accessor(d) {
//     return Math.floor(d.percentComplete / 10);
//   },
//   aggregators: [
//     new CountAggregator('percentComplete')
//   ]
// }]);
// dv.setSorting([{
//   accessor: 'percentComplete',
//   comparer(a: number, b: number) {
//     return a - b;
//   },
// }, {
//   accessor: 'title',
//   comparer(a: number, b: number) {
//     return a - b;
//   },
// }]);
// dv.setFilter((d) => {
//   return Math.floor(d.percentComplete / 10) > 2;
// });
dv.setItems(data);
// dv.pop();
// document.addEventListener('keydown', (e) => {
//   if (e.code === 'Space') {
//     dv.beginUpdate();
//     dv.splice(5, 2);
//     // dv.shift();
//     // dv.pop();
//     dv.endUpdate();
//   }
// });
Object.defineProperty(window, 'grid', {
  value: t
});
Object.defineProperty(window, 'dv', {
  value: dv
});
