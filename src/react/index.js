import { useState, useEffect, useLayoutEffect } from 'src/react/core/hooks';

import {
  createElement,
} from 'src/react/core/createElement';

import { DOMRenderer } from './dom/DOMRenderer';

let {
  render,
  unmountComponentAtNode
} = DOMRenderer;

export const React = {
  createElement,
  useState, useEffect, useLayoutEffect
};

export const ReactDOM = {
  render,
  createElement,
  unmountComponentAtNode,
};
