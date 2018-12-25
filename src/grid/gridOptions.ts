import { ScrollbarVisibility } from 'src/base/common/scrollable';

export interface InternalEditorScrollbarOptions {
  readonly arrowSize: number;
  readonly vertical: ScrollbarVisibility;
  readonly horizontal: ScrollbarVisibility;
  readonly useShadows: boolean;
  readonly verticalHasArrows: boolean;
  readonly horizontalHasArrows: boolean;
  readonly handleMouseWheel: boolean;
  readonly horizontalScrollbarSize: number;
  readonly horizontalSliderSize: number;
  readonly verticalScrollbarSize: number;
  readonly verticalSliderSize: number;
  readonly mouseWheelScrollSensitivity: number;
  readonly fastScrollSensitivity: number;
}

export interface InternalEditorViewOptions {
  readonly scrollbar: InternalEditorScrollbarOptions;
}

export interface IGridOptions {
  readonly layoutInfo: GridLayoutInfo;
  readonly viewInfo: InternalEditorViewOptions;
  lineHeight: number
}

export interface GridLayoutInfo {

  /**
   * Full editor width.
   */
  readonly width: number;
  /**
   * Full editor height.
   */
  readonly height: number;

  /**
   * Left position for the content (actual text)
   */
  readonly contentLeft: number;
  /**
   * The width of the content (actual text)
   */
  readonly contentWidth: number;
  /**
   * The height of the content (actual height)
   */
  readonly contentHeight: number;

  /**
   * The width of the vertical scrollbar.
   */
  readonly verticalScrollbarWidth: number;
  /**
   * The height of the horizontal scrollbar.
   */
  readonly horizontalScrollbarHeight: number;
}

export const GRID_DEFAULTS: Partial<IGridOptions> = {
  viewInfo: {
    scrollbar: {
      vertical: ScrollbarVisibility.Visible,
      horizontal: ScrollbarVisibility.Visible,
      arrowSize: 11,
      useShadows: true,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      horizontalScrollbarSize: 10,
      horizontalSliderSize: 10,
      verticalScrollbarSize: 14,
      verticalSliderSize: 14,
      handleMouseWheel: true,
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,
    }
  }
};
