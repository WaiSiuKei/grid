// import './index.scss';
import { Grid } from 'src/grid/gridImpl';

let columns = [
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
];

let data = [];
for (let i = 0; i < 500000; i++) {
  data[i] = {
    title: 'Task ' + i,
    duration: '5 days',
    percentComplete: Math.round(Math.random() * 100),
    start: '01/01/2009',
    finish: '01/05/2009',
    effortDriven: (i % 5 == 0),
    a: '01/01/2009',
    b: '01/01/2009',
    c: '01/01/2009',
    d: '01/01/2009',
    e: '01/01/2009',
    f: '01/01/2009',
    g: '01/01/2009',
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

let t = new Grid(document.getElementById('myGrid'), data, columns);

t.layout();

Object.defineProperty(window, 'grid', {
  value: t
});
