import { GridWidget } from 'src/grid/gridWidget';
import { DataView } from 'src/data/dataView';
import { React, ReactDOM } from './rax';
import { AvgAggregator, CountAggregator, MaxAggregator, MinAggregator, SumAggregator } from 'src/data/aggregation';

export default {
  Grid: GridWidget,
  DataView,
  AvgAggregator,
  MinAggregator,
  MaxAggregator,
  SumAggregator,
  CountAggregator,
  React,
  ReactDOM
};
