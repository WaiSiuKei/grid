// shared across all grids on the page
import { isIE } from './browser';
import { CharCode } from './charCode';

export function getscrollbarDimensions(dom: HTMLElement) {
  let $outerdiv = document.createElement('div');
  $outerdiv.className = dom.className;
  $outerdiv.style.position = 'absolute';
  $outerdiv.style.top = '-10000px';
  $outerdiv.style.left = '-10000px';
  $outerdiv.style.overflow = 'auto';
  $outerdiv.style.width = '100px';
  $outerdiv.style.height = '100px';
  dom.appendChild($outerdiv);

  let $innerdiv = document.createElement('div');
  $innerdiv.style.overflow = 'auto';
  $innerdiv.style.width = '200px';
  $innerdiv.style.height = '200px';
  dom.appendChild($innerdiv);

  let dim = {
    width: $outerdiv[0].offsetWidth - $outerdiv[0].clientWidth,
    height: $outerdiv[0].offsetHeight - $outerdiv[0].clientHeight
  };

  dom.removeChild($innerdiv);
  dom.removeChild($outerdiv);

  return dim;
}

export const maxSupportedCssHeight = (function () {
  var supportedHeight = 1000000;
  // FF reports the height back but still renders blank after ~6M px
  var testUpTo = navigator.userAgent.toLowerCase().match(/firefox/) ? 6000000 : 1000000000;
  let div = document.createElement('div');
  div.style.display = 'none';
  document.body.append(div);

  while (true) {
    var test = supportedHeight * 2;
    div.style.height = `${test}px`;
    if (test > testUpTo || div.clientHeight !== test) {
      break;
    } else {
      supportedHeight = test;
    }
  }

  div.remove();
  return supportedHeight;
})();  // browser's breaking point

export function disableSelection(target: HTMLElement) {
  target.setAttribute('unselectable', 'on');
  addClass(target, 'unselectable');
}

export function clearNode(node: HTMLElement): void {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

interface IDomClassList {
  hasClass(node: HTMLElement, className: string): boolean;
  addClass(node: HTMLElement, className: string): void;
  addClasses(node: HTMLElement, ...classNames: string[]): void;
  removeClass(node: HTMLElement, className: string): void;
  removeClasses(node: HTMLElement, ...classNames: string[]): void;
  toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void;
}

const _manualClassList = new class implements IDomClassList {

  private _lastStart: number;
  private _lastEnd: number;

  private _findClassName(node: HTMLElement, className: string): void {

    let classes = node.className;
    if (!classes) {
      this._lastStart = -1;
      return;
    }

    className = className.trim();

    let classesLen = classes.length,
      classLen = className.length;

    if (classLen === 0) {
      this._lastStart = -1;
      return;
    }

    if (classesLen < classLen) {
      this._lastStart = -1;
      return;
    }

    if (classes === className) {
      this._lastStart = 0;
      this._lastEnd = classesLen;
      return;
    }

    let idx = -1,
      idxEnd: number;

    while ((idx = classes.indexOf(className, idx + 1)) >= 0) {

      idxEnd = idx + classLen;

      // a class that is followed by another class
      if ((idx === 0 || classes.charCodeAt(idx - 1) === CharCode.Space) && classes.charCodeAt(idxEnd) === CharCode.Space) {
        this._lastStart = idx;
        this._lastEnd = idxEnd + 1;
        return;
      }

      // last class
      if (idx > 0 && classes.charCodeAt(idx - 1) === CharCode.Space && idxEnd === classesLen) {
        this._lastStart = idx - 1;
        this._lastEnd = idxEnd;
        return;
      }

      // equal - duplicate of cmp above
      if (idx === 0 && idxEnd === classesLen) {
        this._lastStart = 0;
        this._lastEnd = idxEnd;
        return;
      }
    }

    this._lastStart = -1;
  }

  hasClass(node: HTMLElement, className: string): boolean {
    this._findClassName(node, className);
    return this._lastStart !== -1;
  }

  addClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }

  addClass(node: HTMLElement, className: string): void {
    if (!node.className) { // doesn't have it for sure
      node.className = className;
    } else {
      this._findClassName(node, className); // see if it's already there
      if (this._lastStart === -1) {
        node.className = node.className + ' ' + className;
      }
    }
  }

  removeClass(node: HTMLElement, className: string): void {
    this._findClassName(node, className);
    if (this._lastStart === -1) {
      return; // Prevent styles invalidation if not necessary
    } else {
      node.className = node.className.substring(0, this._lastStart) + node.className.substring(this._lastEnd);
    }
  }

  removeClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }

  toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void {
    this._findClassName(node, className);
    if (this._lastStart !== -1 && (shouldHaveIt === void 0 || !shouldHaveIt)) {
      this.removeClass(node, className);
    }
    if (this._lastStart === -1 && (shouldHaveIt === void 0 || shouldHaveIt)) {
      this.addClass(node, className);
    }
  }
};

const _nativeClassList = new class implements IDomClassList {
  hasClass(node: HTMLElement, className: string): boolean {
    return className && node.classList && node.classList.contains(className);
  }

  addClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.addClass(node, name)));
  }

  addClass(node: HTMLElement, className: string): void {
    if (className && node.classList) {
      node.classList.add(className);
    }
  }

  removeClass(node: HTMLElement, className: string): void {
    if (className && node.classList) {
      node.classList.remove(className);
    }
  }

  removeClasses(node: HTMLElement, ...classNames: string[]): void {
    classNames.forEach(nameValue => nameValue.split(' ').forEach(name => this.removeClass(node, name)));
  }

  toggleClass(node: HTMLElement, className: string, shouldHaveIt?: boolean): void {
    if (node.classList) {
      node.classList.toggle(className, shouldHaveIt);
    }
  }
};

// In IE11 there is only partial support for `classList` which makes us keep our
// custom implementation. Otherwise use the native implementation, see: http://caniuse.com/#search=classlist
const _classList: IDomClassList = isIE ? _manualClassList : _nativeClassList;
export const hasClass: (node: HTMLElement, className: string) => boolean = _classList.hasClass.bind(_classList);
export const addClass: (node: HTMLElement, className: string) => void = _classList.addClass.bind(_classList);
export const addClasses: (node: HTMLElement, ...classNames: string[]) => void = _classList.addClasses.bind(_classList);
export const removeClass: (node: HTMLElement, className: string) => void = _classList.removeClass.bind(_classList);
export const removeClasses: (node: HTMLElement, ...classNames: string[]) => void = _classList.removeClasses.bind(_classList);
export const toggleClass: (node: HTMLElement, className: string, shouldHaveIt?: boolean) => void = _classList.toggleClass.bind(_classList);

export function hide(...elements: HTMLElement[]): void {
  for (let element of elements) {
    element.style.display = 'none';
  }
}
