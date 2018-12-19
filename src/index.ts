import './index.scss';
import { Grid } from './grid';

var columns = [
  { id: 'title', name: 'Title', field: 'title' },
  { id: 'duration', name: 'Duration', field: 'duration' },
  { id: '%', name: '% Complete', field: 'percentComplete' },
  { id: 'start', name: 'Start', field: 'start' },
  { id: 'finish', name: 'Finish', field: 'finish' },
  { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven' }
];

var data = [];
for (var i = 0; i < 500; i++) {
  data[i] = {
    title: 'Task ' + i,
    duration: '5 days',
    percentComplete: Math.round(Math.random() * 100),
    start: '01/01/2009',
    finish: '01/05/2009',
    effortDriven: (i % 5 == 0)
  };
}

let grid = new Grid(document.getElementById('myGrid') as HTMLElement, data, columns, {});

Object.defineProperty(window, 'grid', {
  value: grid
});
