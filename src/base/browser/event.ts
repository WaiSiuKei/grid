export function clientToLocal(e: MouseEvent, ele: Element): { x: number, y: number } {
  const rect = ele.getBoundingClientRect();

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
