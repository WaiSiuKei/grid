/**
 * Layouting of objects that take vertical space (by having a height) and push down other objects.
 *
 * These objects are basically either text (lines) or spaces between those lines (whitespaces).
 * This provides commodity operations for working with lines that contain whitespace that pushes lines lower (vertically).
 * This is written with no knowledge of an editor in mind.
 */
export class LinesLayout {

  /**
   * Keep track of the total number of lines.
   * This is useful for doing binary searches or for doing hit-testing.
   */
  private _lineCount: number;

  /**
   * The height of a line in pixels.
   */
  private _lineHeight: number;

  constructor(lineCount: number, lineHeight: number) {
    this._lineCount = lineCount;
    this._lineHeight = lineHeight;
  }

  /**
   * Change the height of a line in pixels.
   */
  public setLineHeight(lineHeight: number): void {
    this._lineHeight = lineHeight;
  }

  /**
   * Set the number of lines.
   *
   * @param lineCount New number of lines.
   */
  public onFlushed(lineCount: number): void {
    this._lineCount = lineCount;
  }

  /**
   * Get the sum of heights for all objects.
   *
   * @return The sum of heights for all objects.
   */
  public getLinesTotalHeight(): number {
    let linesHeight = this._lineHeight * this._lineCount;
    return linesHeight;
  }
}
