// import './index.scss';
import { Grid } from 'src/grid/gridImpl';

// let columns = [
//   { id: 'title', name: 'Title', field: 'title' },
//   { id: 'duration', name: 'Duration', field: 'duration' },
//   { id: '%', name: '% Complete', field: 'percentComplete' },
//   { id: 'start', name: 'Start', field: 'start' },
//   { id: 'finish', name: 'Finish', field: 'finish' },
//   { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven' },
//
//   { id: 'a', name: 'a', field: 'a' },
//   { id: 'b', name: 'b', field: 'b' },
//   { id: 'c', name: 'c', field: 'c' },
//   { id: 'd', name: 'd', field: 'd' },
//   { id: 'e', name: 'e', field: 'e' },
//   { id: 'f', name: 'f', field: 'f' },
//   { id: 'g', name: 'g', field: 'g' },
// ];
let columns = [];
let data = [];
for (let i = 0; i < 10000; i++) {
  let t = {};
  for (let j = 0; j < 10000; j++) {
    t[j] = j + i;
  }
  data[i] = t;
}

for (let j = 0; j < 10000; j++) {
  columns.push({ id: j.toString(), name: 'Col' + j.toString(), field: j.toString() });
}

let t = new Grid(document.getElementById('myGrid'), data, columns);

t.layout();

Object.defineProperty(window, 'grid', {
  value: t
});
