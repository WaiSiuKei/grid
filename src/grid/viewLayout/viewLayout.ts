import { IViewLayout, Viewport } from 'src/grid/viewModel/viewModel';
import { Disposable, IDisposable } from 'src/base/common/lifecycle';
import { INewScrollPosition, IScrollDimensions, IScrollPosition, Scrollable, ScrollbarVisibility, ScrollEvent } from 'src/base/common/scrollable';
import { IConfiguration } from 'src/grid/gridCommon';
import { LinesLayout } from 'src/grid/viewLayout/linesLayout';
import { Emitter, Event } from 'src/base/common/event';

const SMOOTH_SCROLLING_TIME = 125;

export class ViewLayout extends Disposable implements IViewLayout {

  private readonly _configuration: IConfiguration;
  private readonly _linesLayout: LinesLayout;

  public readonly scrollable: Scrollable;
  public readonly onDidScroll: Event<ScrollEvent>;

  constructor(configuration: IConfiguration, lineCount: number, scheduleAtNextAnimationFrame: (callback: () => void) => IDisposable) {
    super();

    this._configuration = configuration;
    this._linesLayout = new LinesLayout(lineCount, this._configuration.grid.lineHeight);

    this.scrollable = this._register(new Scrollable(0, scheduleAtNextAnimationFrame));
    this._configureSmoothScrollDuration();

    this.scrollable.setScrollDimensions({
      width: configuration.grid.layoutInfo.contentWidth,
      height: configuration.grid.layoutInfo.contentHeight
    });
    this.onDidScroll = this.scrollable.onScroll;

    this._updateHeight();
  }

  public dispose(): void {
    super.dispose();
  }

  public onHeightMaybeChanged(): void {
    this._updateHeight();
  }

  private _configureSmoothScrollDuration(): void {
    this.scrollable.setSmoothScrollDuration(SMOOTH_SCROLLING_TIME);
  }

  private _getHorizontalScrollbarHeight(scrollDimensions: IScrollDimensions): number {
    if (this._configuration.grid.viewInfo.scrollbar.horizontal === ScrollbarVisibility.Hidden) {
      // horizontal scrollbar not visible
      return 0;
    }
    if (scrollDimensions.width >= scrollDimensions.scrollWidth) {
      // horizontal scrollbar not visible
      return 0;
    }
    return this._configuration.grid.viewInfo.scrollbar.horizontalScrollbarSize;
  }

  private _getTotalHeight(): number {
    const scrollDimensions = this.scrollable.getScrollDimensions();

    let result = this._linesLayout.getLinesTotalHeight();
    result += this._getHorizontalScrollbarHeight(scrollDimensions);

    return Math.max(scrollDimensions.height, result);
  }

  private _updateHeight(): void {
    this.scrollable.setScrollDimensions({
      scrollHeight: this._getTotalHeight()
    });
  }

  // ---- Layouting logic

  public getCurrentViewport(): Viewport {
    const scrollDimensions = this.scrollable.getScrollDimensions();
    const currentScrollPosition = this.scrollable.getCurrentScrollPosition();
    return new Viewport(
      currentScrollPosition.scrollTop,
      currentScrollPosition.scrollLeft,
      scrollDimensions.width,
      scrollDimensions.height
    );
  }

  public getFutureViewport(): Viewport {
    const scrollDimensions = this.scrollable.getScrollDimensions();
    const currentScrollPosition = this.scrollable.getFutureScrollPosition();
    return new Viewport(
      currentScrollPosition.scrollTop,
      currentScrollPosition.scrollLeft,
      scrollDimensions.width,
      scrollDimensions.height
    );
  }

  private _computeScrollWidth(maxLineWidth: number, viewportWidth: number): number {
    return Math.max(maxLineWidth, viewportWidth);
  }

  public onMaxLineWidthChanged(maxLineWidth: number): void {
    let newScrollWidth = this._computeScrollWidth(maxLineWidth, this.getCurrentViewport().width);
    this.scrollable.setScrollDimensions({
      scrollWidth: newScrollWidth
    });

    // The height might depend on the fact that there is a horizontal scrollbar or not
    this._updateHeight();
  }

  // ---- view state

  public saveState(): { scrollTop: number; scrollTopWithoutViewZones: number; scrollLeft: number; } {
    const currentScrollPosition = this.scrollable.getFutureScrollPosition();
    let scrollTop = currentScrollPosition.scrollTop;
    return {
      scrollTop: scrollTop,
      scrollTopWithoutViewZones: scrollTop,
      scrollLeft: currentScrollPosition.scrollLeft
    };
  }

  // ---- IScrollingProvider

  public getScrollWidth(): number {
    const scrollDimensions = this.scrollable.getScrollDimensions();
    return scrollDimensions.scrollWidth;
  }
  public getScrollHeight(): number {
    const scrollDimensions = this.scrollable.getScrollDimensions();
    return scrollDimensions.scrollHeight;
  }

  public getCurrentScrollLeft(): number {
    const currentScrollPosition = this.scrollable.getCurrentScrollPosition();
    return currentScrollPosition.scrollLeft;
  }
  public getCurrentScrollTop(): number {
    const currentScrollPosition = this.scrollable.getCurrentScrollPosition();
    return currentScrollPosition.scrollTop;
  }

  public validateScrollPosition(scrollPosition: INewScrollPosition): IScrollPosition {
    return this.scrollable.validateScrollPosition(scrollPosition);
  }

  public setScrollPositionNow(position: INewScrollPosition): void {
    this.scrollable.setScrollPositionNow(position);
  }

  public setScrollPositionSmooth(position: INewScrollPosition): void {
    this.scrollable.setScrollPositionSmooth(position);
  }

  public deltaScrollNow(deltaScrollLeft: number, deltaScrollTop: number): void {
    const currentScrollPosition = this.scrollable.getCurrentScrollPosition();
    this.scrollable.setScrollPositionNow({
      scrollLeft: currentScrollPosition.scrollLeft + deltaScrollLeft,
      scrollTop: currentScrollPosition.scrollTop + deltaScrollTop
    });
  }
}
