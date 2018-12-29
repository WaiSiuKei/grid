export const NAMESPACE = {
  svg: 'http://www.w3.org/2000/svg',
  xmlns: 'http://www.w3.org/2000/xmlns/',
  xlink: 'http://www.w3.org/1999/xlink',
  xhtml: 'http://www.w3.org/1999/xhtml',
  math: 'http://www.w3.org/1998/Math/MathML'
};

export function contains(a, b) {
  if (b) {
    while ((b = b.parentNode)) {
      if (b === a) {
        return true;
      }
    }
  }
  return false;
}
