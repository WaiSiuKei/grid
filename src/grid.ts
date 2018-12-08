import { addClass, addClasses, clearNode, disableSelection, getscrollbarDimensions, hide } from './core/dom';
import { Event, EventData } from './core/event';

function SlickGrid(container, data, columns, options) {
  function registerPlugin(plugin) {
    plugins.unshift(plugin);
    plugin.init(self);
  }

  function unregisterPlugin(plugin) {
    for (let i = plugins.length; i >= 0; i--) {
      if (plugins[i] === plugin) {
        if (plugins[i].destroy) {
          plugins[i].destroy();
        }
        plugins.splice(i, 1);
        break;
      }
    }
  }

  function setSelectionModel(model) {
    if (selectionModel) {
      selectionModel.onSelectedRangesChanged.unsubscribe(handleSelectedRangesChanged);
      if (selectionModel.destroy) {
        selectionModel.destroy();
      }
    }

    selectionModel = model;
    if (selectionModel) {
      selectionModel.init(self);
      selectionModel.onSelectedRangesChanged.subscribe(handleSelectedRangesChanged);
    }
  }

  function getSelectionModel() {
    return selectionModel;
  }

  function getCanvasNode() {
    return $canvas[0];
  }

  function getUID() {
    return uid;
  }

  function getHeaderColumnWidthDiff() {
    return headerColumnWidthDiff;
  }

  function getScrollbarDimensions() {
    return scrollbarDimensions;
  }

  function unbindAncestorScrollEvents() {
    if (!$boundAncestors) {
      return;
    }
    $boundAncestors.off('scroll.' + uid);
    $boundAncestors = null;
  }

  function updateColumnHeader(columnId, title, toolTip) {
    if (!initialized) { return; }
    let idx = getColumnIndex(columnId);
    if (idx == null) {
      return;
    }

    let columnDef = columns[idx];
    let $header = $headers.children().eq(idx);
    if ($header) {
      if (title !== undefined) {
        columns[idx].name = title;
      }
      if (toolTip !== undefined) {
        columns[idx].toolTip = toolTip;
      }

      trigger(self.onBeforeHeaderCellDestroy, {
        'node': $header[0],
        'column': columnDef,
        'grid': self
      });

      $header
        .attr('title', toolTip || '')
        .children().eq(0).html(title);

      trigger(self.onHeaderCellRendered, {
        'node': $header[0],
        'column': columnDef,
        'grid': self
      });
    }
  }

  function getHeader() {
    return $headers[0];
  }

  function getHeaderColumn(columnIdOrIdx) {
    let idx = (typeof columnIdOrIdx === 'number' ? columnIdOrIdx : getColumnIndex(columnIdOrIdx));
    let $rtn = $headers.children().eq(idx);
    return $rtn && $rtn[0];
  }

  function getHeaderRow() {
    return $headerRow[0];
  }

  function getFooterRow() {
    return $footerRow[0];
  }

  function getPreHeaderPanel() {
    return $preHeaderPanel[0];
  }

  function getHeaderRowColumn(columnIdOrIdx) {
    let idx = (typeof columnIdOrIdx === 'number' ? columnIdOrIdx : getColumnIndex(columnIdOrIdx));
    let $rtn = $headerRow.children().eq(idx);
    return $rtn && $rtn[0];
  }

  function getFooterRowColumn(columnIdOrIdx) {
    let idx = (typeof columnIdOrIdx === 'number' ? columnIdOrIdx : getColumnIndex(columnIdOrIdx));
    let $rtn = $footerRow.children().eq(idx);
    return $rtn && $rtn[0];
  }

  function setupColumnReorder() {
    $headers.filter(':ui-sortable').sortable('destroy');
    $headers.sortable({
      containment: 'parent',
      distance: 3,
      axis: 'x',
      cursor: 'default',
      tolerance: 'intersection',
      helper: 'clone',
      placeholder: 'slick-sortable-placeholder ui-state-default slick-header-column',
      start: function (e, ui) {
        ui.placeholder.width(ui.helper.outerWidth() - headerColumnWidthDiff);
        $(ui.helper).addClass('slick-header-column-active');
      },
      beforeStop: function (e, ui) {
        $(ui.helper).removeClass('slick-header-column-active');
      },
      stop: function (e) {
        if (!getEditorLock().commitCurrentEdit()) {
          $(this).sortable('cancel');
          return;
        }

        let reorderedIds = $headers.sortable('toArray');
        let reorderedColumns = [];
        for (let i = 0; i < reorderedIds.length; i++) {
          reorderedColumns.push(columns[getColumnIndex(reorderedIds[i].replace(uid, ''))]);
        }
        setColumns(reorderedColumns);

        trigger(self.onColumnsReordered, { grid: self });
        e.stopPropagation();
        setupColumnResize();
      }
    });
  }

  function getColumnCssRules(idx) {
    let i;
    if (!stylesheet) {
      let sheets = document.styleSheets;
      for (i = 0; i < sheets.length; i++) {
        if ((sheets[i].ownerNode || sheets[i].owningElement) == $style[0]) {
          stylesheet = sheets[i];
          break;
        }
      }

      if (!stylesheet) {
        throw new Error('Cannot find stylesheet.');
      }

      // find and cache column CSS rules
      columnCssRulesL = [];
      columnCssRulesR = [];
      let cssRules = (stylesheet.cssRules || stylesheet.rules);
      let matches, columnIdx;
      for (i = 0; i < cssRules.length; i++) {
        let selector = cssRules[i].selectorText;
        if (matches = /\.l\d+/.exec(selector)) {
          columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
          columnCssRulesL[columnIdx] = cssRules[i];
        } else if (matches = /\.r\d+/.exec(selector)) {
          columnIdx = parseInt(matches[0].substr(2, matches[0].length - 2), 10);
          columnCssRulesR[columnIdx] = cssRules[i];
        }
      }
    }

    return {
      'left': columnCssRulesL[idx],
      'right': columnCssRulesR[idx]
    };
  }

  function removeCssRules() {
    $style.remove();
    stylesheet = null;
  }

  function destroy() {
    getEditorLock().cancelCurrentEdit();

    trigger(self.onBeforeDestroy, { grid: self });

    let i = plugins.length;
    while (i--) {
      unregisterPlugin(plugins[i]);
    }

    if (options.enableColumnReorder) {
      $headers.filter(':ui-sortable').sortable('destroy');
    }

    unbindAncestorScrollEvents();
    $container.off('.slickgrid');
    removeCssRules();

    $canvas.off('draginit dragstart dragend drag');
    $container.empty().removeClass(uid);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // General

  function getEditorLock() {
    return options.editorLock;
  }

  function getEditController() {
    return editController;
  }

  function getColumnIndex(id) {
    return columnsById[id];
  }

  function applyColumnWidths() {
    let x = 0, w, rule;
    for (let i = 0; i < columns.length; i++) {
      w = columns[i].width;

      rule = getColumnCssRules(i);
      rule.left.style.left = x + 'px';
      rule.right.style.right = (canvasWidth - x - w) + 'px';

      x += columns[i].width;
    }
  }

  function setSortColumn(columnId, ascending) {
    setSortColumns([{ columnId: columnId, sortAsc: ascending }]);
  }

  function setSortColumns(cols) {
    sortColumns = cols;
    let numberCols = options.numberedMultiColumnSort && sortColumns.length > 1;
    let headerColumnEls = $headers.children();
    headerColumnEls
      .removeClass('slick-header-column-sorted')
      .find('.slick-sort-indicator')
      .removeClass('slick-sort-indicator-asc slick-sort-indicator-desc');
    headerColumnEls
      .find('.slick-sort-indicator-numbered')
      .text('');

    $.each(sortColumns, function (i, col) {
      if (col.sortAsc == null) {
        col.sortAsc = true;
      }
      let columnIndex = getColumnIndex(col.columnId);
      if (columnIndex != null) {
        headerColumnEls.eq(columnIndex)
          .addClass('slick-header-column-sorted')
          .find('.slick-sort-indicator')
          .addClass(col.sortAsc ? 'slick-sort-indicator-asc' : 'slick-sort-indicator-desc');
        if (numberCols) {
          headerColumnEls.eq(columnIndex)
            .find('.slick-sort-indicator-numbered')
            .text(i + 1);
        }
      }
    });
  }

  function getSortColumns() {
    return sortColumns;
  }

  function handleSelectedRangesChanged(e, ranges) {
    selectedRows = [];
    let hash = {};
    for (let i = 0; i < ranges.length; i++) {
      for (let j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
        if (!hash[j]) {  // prevent duplicates
          selectedRows.push(j);
          hash[j] = {};
        }
        for (let k = ranges[i].fromCell; k <= ranges[i].toCell; k++) {
          if (canCellBeSelected(j, k)) {
            hash[j][columns[k].id] = options.selectedCellCssClass;
          }
        }
      }
    }

    setCellCssStyles(options.selectedCellCssClass, hash);

    trigger(self.onSelectedRowsChanged, { rows: getSelectedRows(), grid: self }, e);
  }

  function getColumns() {
    return columns;
  }

  function setColumns(columnDefinitions) {
    columns = columnDefinitions;

    columnsById = {};
    for (let i = 0; i < columns.length; i++) {
      let m = columns[i] = $.extend({}, columnDefaults, columns[i]);
      columnsById[m.id] = i;
      if (m.minWidth && m.width < m.minWidth) {
        m.width = m.minWidth;
      }
      if (m.maxWidth && m.width > m.maxWidth) {
        m.width = m.maxWidth;
      }
    }

    updateColumnCaches();

    if (initialized) {
      invalidateAllRows();
      createColumnHeaders();
      removeCssRules();
      createCssRules();
      resizeCanvas();
      applyColumnWidths();
      handleScroll();
    }
  }

  function getOptions() {
    return options;
  }

  function setOptions(args, suppressRender) {
    if (!getEditorLock().commitCurrentEdit()) {
      return;
    }

    makeActiveCellNormal();

    if (options.enableAddRow !== args.enableAddRow) {
      invalidateRow(getDataLength());
    }

    options = $.extend(options, args);
    validateAndEnforceOptions();

    $viewport.css('overflow-y', options.autoHeight ? 'hidden' : 'auto');
    if (!suppressRender) { render(); }
  }

  function setData(newData, scrollToTop) {
    data = newData;
    invalidateAllRows();
    updateRowCount();
    if (scrollToTop) {
      scrollTo(0);
    }
  }

  function getData() {
    return data;
  }

  function getDataLengthIncludingAddNew() {
    return getDataLength() + (!options.enableAddRow ? 0
        : (!pagingActive || pagingIsLastPage ? 1 : 0)
    );
  }

  function getDataItem(i) {
    if (data.getItem) {
      return data.getItem(i);
    } else {
      return data[i];
    }
  }

  function getTopPanel() {
    return $topPanel[0];
  }

  function setTopPanelVisibility(visible) {
    if (options.showTopPanel != visible) {
      options.showTopPanel = visible;
      if (visible) {
        $topPanelScroller.slideDown('fast', resizeCanvas);
      } else {
        $topPanelScroller.slideUp('fast', resizeCanvas);
      }
    }
  }

  function setHeaderRowVisibility(visible) {
    if (options.showHeaderRow != visible) {
      options.showHeaderRow = visible;
      if (visible) {
        $headerRowScroller.slideDown('fast', resizeCanvas);
      } else {
        $headerRowScroller.slideUp('fast', resizeCanvas);
      }
    }
  }

  function setFooterRowVisibility(visible) {
    if (options.showFooterRow != visible) {
      options.showFooterRow = visible;
      if (visible) {
        $footerRowScroller.slideDown('fast', resizeCanvas);
      } else {
        $footerRowScroller.slideUp('fast', resizeCanvas);
      }
    }
  }

  function setPreHeaderPanelVisibility(visible) {
    if (options.showPreHeaderPanel != visible) {
      options.showPreHeaderPanel = visible;
      if (visible) {
        $preHeaderPanelScroller.slideDown('fast', resizeCanvas);
      } else {
        $preHeaderPanelScroller.slideUp('fast', resizeCanvas);
      }
    }
  }

  function getContainerNode() {
    return $container.get(0);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Rendering / Scrolling

  function getRowTop(row) {
    return options.rowHeight * row - offset;
  }

  function defaultFormatter(row, cell, value, columnDef, dataContext, grid) {
    if (value == null) {
      return '';
    } else {
      return (value + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }

  function getFormatter(row, column) {
    let rowMetadata = data.getItemMetadata && data.getItemMetadata(row);

    // look up by id, then index
    let columnOverrides = rowMetadata &&
      rowMetadata.columns &&
      (rowMetadata.columns[column.id] || rowMetadata.columns[getColumnIndex(column.id)]);

    return (columnOverrides && columnOverrides.formatter) ||
      (rowMetadata && rowMetadata.formatter) ||
      column.formatter ||
      (options.formatterFactory && options.formatterFactory.getFormatter(column)) ||
      options.defaultFormatter;
  }

  function getEditor(row, cell) {
    let column = columns[cell];
    let rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
    let columnMetadata = rowMetadata && rowMetadata.columns;

    if (columnMetadata && columnMetadata[column.id] && columnMetadata[column.id].editor !== undefined) {
      return columnMetadata[column.id].editor;
    }
    if (columnMetadata && columnMetadata[cell] && columnMetadata[cell].editor !== undefined) {
      return columnMetadata[cell].editor;
    }

    return column.editor || (options.editorFactory && options.editorFactory.getEditor(column));
  }

  function getDataItemValueForColumn(item, columnDef) {
    if (options.dataItemColumnValueExtractor) {
      return options.dataItemColumnValueExtractor(item, columnDef);
    }
    return item[columnDef.field];
  }

  function appendRowHtml(stringArray, row, range, dataLength) {
    let d = getDataItem(row);
    let dataLoading = row < dataLength && !d;
    let rowCss = 'slick-row' +
      (dataLoading ? ' loading' : '') +
      (row === activeRow && options.showCellSelection ? ' active' : '') +
      (row % 2 == 1 ? ' odd' : ' even');

    if (!d) {
      rowCss += ' ' + options.addNewRowCssClass;
    }

    let metadata = data.getItemMetadata && data.getItemMetadata(row);

    if (metadata && metadata.cssClasses) {
      rowCss += ' ' + metadata.cssClasses;
    }

    stringArray.push('<div class=\'ui-widget-content ' + rowCss + '\' style=\'top:' + getRowTop(row) + 'px\'>');

    let colspan, m;
    for (let i = 0, ii = columns.length; i < ii; i++) {
      m = columns[i];
      colspan = 1;
      if (metadata && metadata.columns) {
        let columnData = metadata.columns[m.id] || metadata.columns[i];
        colspan = (columnData && columnData.colspan) || 1;
        if (colspan === '*') {
          colspan = ii - i;
        }
      }

      // Do not render cells outside of the viewport.
      if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
        if (columnPosLeft[i] > range.rightPx) {
          // All columns to the right are outside the range.
          break;
        }

        appendCellHtml(stringArray, row, i, colspan, d);
      }

      if (colspan > 1) {
        i += (colspan - 1);
      }
    }

    stringArray.push('</div>');
  }

  function appendCellHtml(stringArray, row, cell, colspan, item) {
    // stringArray: stringBuilder containing the HTML parts
    // row, cell: row and column index
    // colspan: HTML colspan
    // item: grid data for row

    let m = columns[cell];
    let cellCss = 'slick-cell l' + cell + ' r' + Math.min(columns.length - 1, cell + colspan - 1) +
      (m.cssClass ? ' ' + m.cssClass : '');
    if (row === activeRow && cell === activeCell && options.showCellSelection) {
      cellCss += (' active');
    }

    // TODO:  merge them together in the setter
    for (let key in cellCssClasses) {
      if (cellCssClasses[key][row] && cellCssClasses[key][row][m.id]) {
        cellCss += (' ' + cellCssClasses[key][row][m.id]);
      }
    }

    let value = null, formatterResult = '';
    if (item) {
      value = getDataItemValueForColumn(item, m);
      formatterResult = getFormatter(row, m)(row, cell, value, m, item, self);
      if (formatterResult === null || formatterResult === undefined) { formatterResult = ''; }
    }

    // get addl css class names from object type formatter return and from string type return of onBeforeAppendCell
    let addlCssClasses = trigger(self.onBeforeAppendCell, { row: row, cell: cell, grid: self, value: value, dataContext: item }) || '';
    addlCssClasses += (formatterResult && formatterResult.addClasses ? (addlCssClasses ? ' ' : '') + formatterResult.addClasses : '');

    stringArray.push('<div class=\'' + cellCss + (addlCssClasses ? ' ' + addlCssClasses : '') + '\'>');

    // if there is a corresponding row (if not, this is the Add New row or this data hasn't been loaded yet)
    if (item) {
      stringArray.push(Object.prototype.toString.call(formatterResult) !== '[object Object]' ? formatterResult : formatterResult.text);
    }

    stringArray.push('</div>');

    rowsCache[row].cellRenderQueue.push(cell);
    rowsCache[row].cellColSpans[cell] = colspan;
  }

  function invalidate() {
    updateRowCount();
    invalidateAllRows();
    render();
  }

  function queuePostProcessedRowForCleanup(cacheEntry, postProcessedRow, rowIdx) {
    postProcessgroupId++;

    // store and detach node for later async cleanup
    for (let columnIdx in postProcessedRow) {
      if (postProcessedRow.hasOwnProperty(columnIdx)) {
        postProcessedCleanupQueue.push({
          actionType: 'C',
          groupId: postProcessgroupId,
          node: cacheEntry.cellNodesByColumnIdx[columnIdx | 0],
          columnIdx: columnIdx | 0,
          rowIdx: rowIdx
        });
      }
    }
    postProcessedCleanupQueue.push({
      actionType: 'R',
      groupId: postProcessgroupId,
      node: cacheEntry.rowNode
    });
    $(cacheEntry.rowNode).detach();
  }

  function queuePostProcessedCellForCleanup(cellnode, columnIdx, rowIdx) {
    postProcessedCleanupQueue.push({
      actionType: 'C',
      groupId: postProcessgroupId,
      node: cellnode,
      columnIdx: columnIdx,
      rowIdx: rowIdx
    });
    $(cellnode).detach();
  }

  function invalidateRows(rows) {
    let i, rl;
    if (!rows || !rows.length) {
      return;
    }
    vScrollDir = 0;
    rl = rows.length;
    for (i = 0; i < rl; i++) {
      if (currentEditor && activeRow === rows[i]) {
        makeActiveCellNormal();
      }
      if (rowsCache[rows[i]]) {
        removeRowFromCache(rows[i]);
      }
    }
    if (options.enableAsyncPostRenderCleanup) { startPostProcessingCleanup(); }
  }

  function invalidateRow(row) {
    if (!row && row !== 0) { return; }
    invalidateRows([row]);
  }

  function applyFormatResultToCellNode(formatterResult, cellNode, suppressRemove) {
    if (formatterResult === null || formatterResult === undefined) { formatterResult = ''; }
    if (Object.prototype.toString.call(formatterResult) !== '[object Object]') {
      cellNode.innerHTML = formatterResult;
      return;
    }
    cellNode.innerHTML = formatterResult.text;
    if (formatterResult.removeClasses && !suppressRemove) {
      $(cellNode).removeClass(formatterResult.removeClasses);
    }
    if (formatterResult.addClasses) {
      $(cellNode).addClass(formatterResult.addClasses);
    }
  }

  function updateCell(row, cell) {
    let cellNode = getCellNode(row, cell);
    if (!cellNode) {
      return;
    }

    let m = columns[cell], d = getDataItem(row);
    if (currentEditor && activeRow === row && activeCell === cell) {
      currentEditor.loadValue(d);
    } else {
      let formatterResult = d ? getFormatter(row, m)(row, cell, getDataItemValueForColumn(d, m), m, d, self) : '';
      applyFormatResultToCellNode(formatterResult, cellNode);
      invalidatePostProcessingResults(row);
    }
  }

  function updateRow(row) {
    let cacheEntry = rowsCache[row];
    if (!cacheEntry) {
      return;
    }

    ensureCellNodesInRowsCache(row);

    let formatterResult, d = getDataItem(row);

    for (let columnIdx in cacheEntry.cellNodesByColumnIdx) {
      if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
        continue;
      }

      columnIdx = columnIdx | 0;
      let m = columns[columnIdx],
        node = cacheEntry.cellNodesByColumnIdx[columnIdx];

      if (row === activeRow && columnIdx === activeCell && currentEditor) {
        currentEditor.loadValue(d);
      } else if (d) {
        formatterResult = getFormatter(row, m)(row, columnIdx, getDataItemValueForColumn(d, m), m, d, self);
        applyFormatResultToCellNode(formatterResult, node);
      } else {
        node.innerHTML = '';
      }
    }

    invalidatePostProcessingResults(row);
  }

  function updatePagingStatusFromView(pagingInfo) {
    pagingActive = (pagingInfo.pageSize !== 0);
    pagingIsLastPage = (pagingInfo.pageNum == pagingInfo.totalPages - 1);
  }

  function ensureCellNodesInRowsCache(row) {
    let cacheEntry = rowsCache[row];
    if (cacheEntry) {
      if (cacheEntry.cellRenderQueue.length) {
        let lastChild = cacheEntry.rowNode.lastChild;
        while (cacheEntry.cellRenderQueue.length) {
          let columnIdx = cacheEntry.cellRenderQueue.pop();
          cacheEntry.cellNodesByColumnIdx[columnIdx] = lastChild;
          lastChild = lastChild.previousSibling;
        }
      }
    }
  }

  function cleanUpCells(range, row) {
    let totalCellsRemoved = 0;
    let cacheEntry = rowsCache[row];

    // Remove cells outside the range.
    let cellsToRemove = [];
    for (let i in cacheEntry.cellNodesByColumnIdx) {
      // I really hate it when people mess with Array.prototype.
      if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(i)) {
        continue;
      }

      // This is a string, so it needs to be cast back to a number.
      i = i | 0;

      let colspan = cacheEntry.cellColSpans[i];
      if (columnPosLeft[i] > range.rightPx ||
        columnPosRight[Math.min(columns.length - 1, i + colspan - 1)] < range.leftPx) {
        if (!(row == activeRow && i == activeCell)) {
          cellsToRemove.push(i);
        }
      }
    }

    let cellToRemove, node;
    postProcessgroupId++;
    while ((cellToRemove = cellsToRemove.pop()) != null) {
      node = cacheEntry.cellNodesByColumnIdx[cellToRemove];
      if (options.enableAsyncPostRenderCleanup && postProcessedRows[row] && postProcessedRows[row][cellToRemove]) {
        queuePostProcessedCellForCleanup(node, cellToRemove, row);
      } else {
        cacheEntry.rowNode.removeChild(node);
      }

      delete cacheEntry.cellColSpans[cellToRemove];
      delete cacheEntry.cellNodesByColumnIdx[cellToRemove];
      if (postProcessedRows[row]) {
        delete postProcessedRows[row][cellToRemove];
      }
      totalCellsRemoved++;
    }
  }

  function invalidatePostProcessingResults(row) {
    // change status of columns to be re-rendered
    for (let columnIdx in postProcessedRows[row]) {
      if (postProcessedRows[row].hasOwnProperty(columnIdx)) {
        postProcessedRows[row][columnIdx] = 'C';
      }
    }
    postProcessFromRow = Math.min(postProcessFromRow, row);
    postProcessToRow = Math.max(postProcessToRow, row);
    startPostProcessing();
  }

  function handleHeaderScroll() {
    handleElementScroll($headerScroller[0]);
  }

  function handleHeaderRowScroll() {
    handleElementScroll($headerRowScroller[0]);
  }

  function handleFooterRowScroll() {
    handleElementScroll($footerRowScroller[0]);
  }

  function handlePreHeaderPanelScroll() {
    handleElementScroll($preHeaderPanelScroller[0]);
  }

  function handleElementScroll(element) {
    let scrollLeft = element.scrollLeft;
    if (scrollLeft != $viewport[0].scrollLeft) {
      $viewport[0].scrollLeft = scrollLeft;
    }
  }

  function asyncPostProcessRows() {
    let dataLength = getDataLength();
    while (postProcessFromRow <= postProcessToRow) {
      let row = (vScrollDir >= 0) ? postProcessFromRow++ : postProcessToRow--;
      let cacheEntry = rowsCache[row];
      if (!cacheEntry || row >= dataLength) {
        continue;
      }

      if (!postProcessedRows[row]) {
        postProcessedRows[row] = {};
      }

      ensureCellNodesInRowsCache(row);
      for (let columnIdx in cacheEntry.cellNodesByColumnIdx) {
        if (!cacheEntry.cellNodesByColumnIdx.hasOwnProperty(columnIdx)) {
          continue;
        }

        columnIdx = columnIdx | 0;

        let m = columns[columnIdx];
        let processedStatus = postProcessedRows[row][columnIdx]; // C=cleanup and re-render, R=rendered
        if (m.asyncPostRender && processedStatus !== 'R') {
          let node = cacheEntry.cellNodesByColumnIdx[columnIdx];
          if (node) {
            m.asyncPostRender(node, row, getDataItem(row), m, (processedStatus === 'C'));
          }
          postProcessedRows[row][columnIdx] = 'R';
        }
      }

      h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
      return;
    }
  }

  function asyncPostProcessCleanupRows() {
    if (postProcessedCleanupQueue.length > 0) {
      let groupId = postProcessedCleanupQueue[0].groupId;

      // loop through all queue members with this groupID
      while (postProcessedCleanupQueue.length > 0 && postProcessedCleanupQueue[0].groupId == groupId) {
        let entry = postProcessedCleanupQueue.shift();
        if (entry.actionType == 'R') {
          $(entry.node).remove();
        }
        if (entry.actionType == 'C') {
          let column = columns[entry.columnIdx];
          if (column.asyncPostRenderCleanup && entry.node) {
            // cleanup must also remove element
            column.asyncPostRenderCleanup(entry.node, entry.rowIdx, column);
          }
        }
      }

      // call this function again after the specified delay
      h_postrenderCleanup = setTimeout(asyncPostProcessCleanupRows, options.asyncPostRenderCleanupDelay);
    }
  }

  function updateCellCssStylesOnRenderedRows(addedHash, removedHash) {
    let node, columnId, addedRowHash, removedRowHash;
    for (let row in rowsCache) {
      removedRowHash = removedHash && removedHash[row];
      addedRowHash = addedHash && addedHash[row];

      if (removedRowHash) {
        for (columnId in removedRowHash) {
          if (!addedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
            node = getCellNode(row, getColumnIndex(columnId));
            if (node) {
              $(node).removeClass(removedRowHash[columnId]);
            }
          }
        }
      }

      if (addedRowHash) {
        for (columnId in addedRowHash) {
          if (!removedRowHash || removedRowHash[columnId] != addedRowHash[columnId]) {
            node = getCellNode(row, getColumnIndex(columnId));
            if (node) {
              $(node).addClass(addedRowHash[columnId]);
            }
          }
        }
      }
    }
  }

  function addCellCssStyles(key, hash) {
    if (cellCssClasses[key]) {
      throw new Error('addCellCssStyles: cell CSS hash with key \'' + key + '\' already exists.');
    }

    cellCssClasses[key] = hash;
    updateCellCssStylesOnRenderedRows(hash, null);

    trigger(self.onCellCssStylesChanged, { 'key': key, 'hash': hash, 'grid': self });
  }

  function removeCellCssStyles(key) {
    if (!cellCssClasses[key]) {
      return;
    }

    updateCellCssStylesOnRenderedRows(null, cellCssClasses[key]);
    delete cellCssClasses[key];

    trigger(self.onCellCssStylesChanged, { 'key': key, 'hash': null, 'grid': self });
  }

  function setCellCssStyles(key, hash) {
    let prevHash = cellCssClasses[key];

    cellCssClasses[key] = hash;
    updateCellCssStylesOnRenderedRows(hash, prevHash);

    trigger(self.onCellCssStylesChanged, { 'key': key, 'hash': hash, 'grid': self });
  }

  function getCellCssStyles(key) {
    return cellCssClasses[key];
  }

  function flashCell(row, cell, speed) {
    speed = speed || 100;
    if (rowsCache[row]) {
      let $cell = $(getCellNode(row, cell));

      function toggleCellClass(times) {
        if (!times) {
          return;
        }
        setTimeout(function () {
            $cell.queue(function () {
              $cell.toggleClass(options.cellFlashingCssClass).dequeue();
              toggleCellClass(times - 1);
            });
          },
          speed);
      }

      toggleCellClass(4);
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Interactivity

  function handleMouseWheel(e) {
    let rowNode = $(e.target).closest('.slick-row')[0];
    if (rowNode != rowNodeFromLastMouseWheelEvent) {
      if (zombieRowNodeFromLastMouseWheelEvent && zombieRowNodeFromLastMouseWheelEvent != rowNode) {
        if (options.enableAsyncPostRenderCleanup && zombieRowPostProcessedFromLastMouseWheelEvent) {
          queuePostProcessedRowForCleanup(zombieRowCacheFromLastMouseWheelEvent,
            zombieRowPostProcessedFromLastMouseWheelEvent);
        } else {
          $canvas[0].removeChild(zombieRowNodeFromLastMouseWheelEvent);
        }
        zombieRowNodeFromLastMouseWheelEvent = null;
        zombieRowCacheFromLastMouseWheelEvent = null;
        zombieRowPostProcessedFromLastMouseWheelEvent = null;

        if (options.enableAsyncPostRenderCleanup) { startPostProcessingCleanup(); }
      }
      rowNodeFromLastMouseWheelEvent = rowNode;
    }
  }

  function handleDragInit(e, dd) {
    let cell = getCellFromEvent(e);
    if (!cell || !cellExists(cell.row, cell.cell)) {
      return false;
    }

    let retval = trigger(self.onDragInit, dd, e);
    if (e.isImmediatePropagationStopped()) {
      return retval;
    }

    // if nobody claims to be handling drag'n'drop by stopping immediate propagation,
    // cancel out of it
    return false;
  }

  function handleDragStart(e, dd) {
    let cell = getCellFromEvent(e);
    if (!cell || !cellExists(cell.row, cell.cell)) {
      return false;
    }

    let retval = trigger(self.onDragStart, dd, e);
    if (e.isImmediatePropagationStopped()) {
      return retval;
    }

    return false;
  }

  function handleDrag(e, dd) {
    return trigger(self.onDrag, dd, e);
  }

  function handleDragEnd(e, dd) {
    trigger(self.onDragEnd, dd, e);
  }

  function handleKeyDown(e) {
    trigger(self.onKeyDown, { row: activeRow, cell: activeCell, grid: self }, e);
    let handled = e.isImmediatePropagationStopped();
    let keyCode = Slick.keyCode;

    if (!handled) {
      if (!e.shiftKey && !e.altKey) {
        if (options.editable && currentEditor && currentEditor.keyCaptureList) {
          if (currentEditor.keyCaptureList.indexOf(e.which) > -1) {
            return;
          }
        }
        if (e.which == keyCode.HOME) {
          handled = (e.ctrlKey) ? navigateTop() : navigateRowStart();
        } else if (e.which == keyCode.END) {
          handled = (e.ctrlKey) ? navigateBottom() : navigateRowEnd();
        }
      }
    }
    if (!handled) {
      if (!e.shiftKey && !e.altKey && !e.ctrlKey) {
        // editor may specify an array of keys to bubble
        if (options.editable && currentEditor && currentEditor.keyCaptureList) {
          if (currentEditor.keyCaptureList.indexOf(e.which) > -1) {
            return;
          }
        }
        if (e.which == keyCode.ESCAPE) {
          if (!getEditorLock().isActive()) {
            return; // no editing mode to cancel, allow bubbling and default processing (exit without cancelling the event)
          }
          cancelEditAndSetFocus();
        } else if (e.which == keyCode.PAGE_DOWN) {
          navigatePageDown();
          handled = true;
        } else if (e.which == keyCode.PAGE_UP) {
          navigatePageUp();
          handled = true;
        } else if (e.which == keyCode.LEFT) {
          handled = navigateLeft();
        } else if (e.which == keyCode.RIGHT) {
          handled = navigateRight();
        } else if (e.which == keyCode.UP) {
          handled = navigateUp();
        } else if (e.which == keyCode.DOWN) {
          handled = navigateDown();
        } else if (e.which == keyCode.TAB) {
          handled = navigateNext();
        } else if (e.which == keyCode.ENTER) {
          if (options.editable) {
            if (currentEditor) {
              // adding new row
              if (activeRow === getDataLength()) {
                navigateDown();
              } else {
                commitEditAndSetFocus();
              }
            } else {
              if (getEditorLock().commitCurrentEdit()) {
                makeActiveCellEditable();
              }
            }
          }
          handled = true;
        }
      } else if (e.which == keyCode.TAB && e.shiftKey && !e.ctrlKey && !e.altKey) {
        handled = navigatePrev();
      }
    }

    if (handled) {
      // the event has been handled so don't let parent element (bubbling/propagation) or browser (default) handle it
      e.stopPropagation();
      e.preventDefault();
      try {
        e.originalEvent.keyCode = 0; // prevent default behaviour for special keys in IE browsers (F3, F5, etc.)
      }
        // ignore exceptions - setting the original event's keycode throws access denied exception for "Ctrl"
        // (hitting control key only, nothing else), "Shift" (maybe others)
      catch (error) {
      }
    }
  }

  function handleClick(e) {
    if (!currentEditor) {
      // if this click resulted in some cell child node getting focus,
      // don't steal it back - keyboard events will still bubble up
      // IE9+ seems to default DIVs to tabIndex=0 instead of -1, so check for cell clicks directly.
      if (e.target != document.activeElement || $(e.target).hasClass('slick-cell')) {
        setFocus();
      }
    }

    let cell = getCellFromEvent(e);
    if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
      return;
    }

    trigger(self.onClick, { row: cell.row, cell: cell.cell, grid: self }, e);
    if (e.isImmediatePropagationStopped()) {
      return;
    }

    // this optimisation causes trouble - MLeibman #329
    //if ((activeCell != cell.cell || activeRow != cell.row) && canCellBeActive(cell.row, cell.cell)) {
    if (canCellBeActive(cell.row, cell.cell)) {
      if (!getEditorLock().isActive() || getEditorLock().commitCurrentEdit()) {
        scrollRowIntoView(cell.row, false);

        let preClickModeOn = (e.target && e.target.className === Slick.preClickClassName);
        setActiveCellInternal(getCellNode(cell.row, cell.cell), null, preClickModeOn);
      }
    }
  }

  function handleContextMenu(e) {
    let $cell = $(e.target).closest('.slick-cell', $canvas);
    if ($cell.length === 0) {
      return;
    }

    // are we editing this cell?
    if (activeCellNode === $cell[0] && currentEditor !== null) {
      return;
    }

    trigger(self.onContextMenu, { grid: self }, e);
  }

  function handleDblClick(e) {
    let cell = getCellFromEvent(e);
    if (!cell || (currentEditor !== null && activeRow == cell.row && activeCell == cell.cell)) {
      return;
    }

    trigger(self.onDblClick, { row: cell.row, cell: cell.cell, grid: self }, e);
    if (e.isImmediatePropagationStopped()) {
      return;
    }

    if (options.editable) {
      gotoCell(cell.row, cell.cell, true);
    }
  }

  function handleHeaderMouseEnter(e) {
    trigger(self.onHeaderMouseEnter, {
      'column': $(this).data('column'),
      'grid': self
    }, e);
  }

  function handleHeaderMouseLeave(e) {
    trigger(self.onHeaderMouseLeave, {
      'column': $(this).data('column'),
      'grid': self
    }, e);
  }

  function handleHeaderClick(e) {
    if (columnResizeDragging) return;
    let $header = $(e.target).closest('.slick-header-column', '.slick-header-columns');
    let column = $header && $header.data('column');
    if (column) {
      trigger(self.onHeaderClick, { column: column, grid: self }, e);
    }
  }

  function handleMouseEnter(e) {
    trigger(self.onMouseEnter, { grid: self }, e);
  }

  function handleMouseLeave(e) {
    trigger(self.onMouseLeave, { grid: self }, e);
  }

  function cellExists(row, cell) {
    return !(row < 0 || row >= getDataLength() || cell < 0 || cell >= columns.length);
  }

  function getCellFromPoint(x, y) {
    let row = getRowFromPosition(y);
    let cell = 0;

    let w = 0;
    for (let i = 0; i < columns.length && w < x; i++) {
      w += columns[i].width;
      cell++;
    }

    if (cell < 0) {
      cell = 0;
    }

    return { row: row, cell: cell - 1 };
  }

  function getCellFromNode(cellNode) {
    // read column number from .l<columnNumber> CSS class
    let cls = /l\d+/.exec(cellNode.className);
    if (!cls) {
      throw new Error('getCellFromNode: cannot get cell - ' + cellNode.className);
    }
    return parseInt(cls[0].substr(1, cls[0].length - 1), 10);
  }

  function getRowFromNode(rowNode) {
    for (let row in rowsCache) {
      if (rowsCache[row].rowNode === rowNode) {
        return row | 0;
      }
    }

    return null;
  }

  function getCellFromEvent(e) {
    let $cell = $(e.target).closest('.slick-cell', $canvas);
    if (!$cell.length) {
      return null;
    }

    let row = getRowFromNode($cell[0].parentNode);
    let cell = getCellFromNode($cell[0]);

    if (row == null || cell == null) {
      return null;
    } else {
      return {
        'row': row,
        'cell': cell
      };
    }
  }

  function getCellNodeBox(row, cell) {
    if (!cellExists(row, cell)) {
      return null;
    }

    let y1 = getRowTop(row);
    let y2 = y1 + options.rowHeight - 1;
    let x1 = 0;
    for (let i = 0; i < cell; i++) {
      x1 += columns[i].width;
    }
    let x2 = x1 + columns[cell].width;

    return {
      top: y1,
      left: x1,
      bottom: y2,
      right: x2
    };
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Cell switching

  function resetActiveCell() {
    setActiveCellInternal(null, false);
  }

  function setFocus() {
    if (tabbingDirection == -1) {
      $focusSink[0].focus();
    } else {
      $focusSink2[0].focus();
    }
  }

  function scrollCellIntoView(row, cell, doPaging) {
    scrollRowIntoView(row, doPaging);

    let colspan = getColspan(row, cell);
    internalScrollColumnIntoView(columnPosLeft[cell], columnPosRight[cell + (colspan > 1 ? colspan - 1 : 0)]);
  }

  function internalScrollColumnIntoView(left, right) {
    let scrollRight = scrollLeft + viewportW;

    if (left < scrollLeft) {
      $viewport.scrollLeft(left);
      handleScroll();
      render();
    } else if (right > scrollRight) {
      $viewport.scrollLeft(Math.min(left, right - $viewport[0].clientWidth));
      handleScroll();
      render();
    }
  }

  function scrollColumnIntoView(cell) {
    internalScrollColumnIntoView(columnPosLeft[cell], columnPosRight[cell]);
  }

  function setActiveCellInternal(newCell, opt_editMode, preClickModeOn, suppressActiveCellChangedEvent) {
    if (activeCellNode !== null) {
      makeActiveCellNormal();
      $(activeCellNode).removeClass('active');
      if (rowsCache[activeRow]) {
        $(rowsCache[activeRow].rowNode).removeClass('active');
      }
    }

    let activeCellChanged = (activeCellNode !== newCell);
    activeCellNode = newCell;

    if (activeCellNode != null) {
      activeRow = getRowFromNode(activeCellNode.parentNode);
      activeCell = activePosX = getCellFromNode(activeCellNode);

      if (opt_editMode == null) {
        opt_editMode = (activeRow == getDataLength()) || options.autoEdit;
      }

      if (options.showCellSelection) {
        $(activeCellNode).addClass('active');
        $(rowsCache[activeRow].rowNode).addClass('active');
      }

      if (options.editable && opt_editMode && isCellPotentiallyEditable(activeRow, activeCell)) {
        clearTimeout(h_editorLoader);

        if (options.asyncEditorLoading) {
          h_editorLoader = setTimeout(function () {
            makeActiveCellEditable(undefined, preClickModeOn);
          }, options.asyncEditorLoadDelay);
        } else {
          makeActiveCellEditable(undefined, preClickModeOn);
        }
      }
    } else {
      activeRow = activeCell = null;
    }

    // this optimisation causes trouble - MLeibman #329
    //if (activeCellChanged) {
    if (!suppressActiveCellChangedEvent) { trigger(self.onActiveCellChanged, getActiveCell()); }
    //}
  }

  function clearTextSelection() {
    if (document.selection && document.selection.empty) {
      try {
        //IE fails here if selected element is not in dom
        document.selection.empty();
      } catch (e) { }
    } else if (window.getSelection) {
      let sel = window.getSelection();
      if (sel && sel.removeAllRanges) {
        sel.removeAllRanges();
      }
    }
  }

  function isCellPotentiallyEditable(row, cell) {
    let dataLength = getDataLength();
    // is the data for this row loaded?
    if (row < dataLength && !getDataItem(row)) {
      return false;
    }

    // are we in the Add New row?  can we create new from this cell?
    if (columns[cell].cannotTriggerInsert && row >= dataLength) {
      return false;
    }

    // does this cell have an editor?
    if (!getEditor(row, cell)) {
      return false;
    }

    return true;
  }

  function makeActiveCellNormal() {
    if (!currentEditor) {
      return;
    }
    trigger(self.onBeforeCellEditorDestroy, { editor: currentEditor, grid: self });
    currentEditor.destroy();
    currentEditor = null;

    if (activeCellNode) {
      let d = getDataItem(activeRow);
      $(activeCellNode).removeClass('editable invalid');
      if (d) {
        let column = columns[activeCell];
        let formatter = getFormatter(activeRow, column);
        let formatterResult = formatter(activeRow, activeCell, getDataItemValueForColumn(d, column), column, d, self);
        applyFormatResultToCellNode(formatterResult, activeCellNode);
        invalidatePostProcessingResults(activeRow);
      }
    }

    // if there previously was text selected on a page (such as selected text in the edit cell just removed),
    // IE can't set focus to anything else correctly
    if (navigator.userAgent.toLowerCase().match(/msie/)) {
      clearTextSelection();
    }

    getEditorLock().deactivate(editController);
  }

  function makeActiveCellEditable(editor, preClickModeOn) {
    if (!activeCellNode) {
      return;
    }
    if (!options.editable) {
      throw new Error('Grid : makeActiveCellEditable : should never get called when options.editable is false');
    }

    // cancel pending async call if there is one
    clearTimeout(h_editorLoader);

    if (!isCellPotentiallyEditable(activeRow, activeCell)) {
      return;
    }

    let columnDef = columns[activeCell];
    let item = getDataItem(activeRow);

    if (trigger(self.onBeforeEditCell, { row: activeRow, cell: activeCell, item: item, column: columnDef, grid: self }) === false) {
      setFocus();
      return;
    }

    getEditorLock().activate(editController);
    $(activeCellNode).addClass('editable');

    let useEditor = editor || getEditor(activeRow, activeCell);

    // don't clear the cell if a custom editor is passed through
    if (!editor && !useEditor.suppressClearOnEdit) {
      activeCellNode.innerHTML = '';
    }

    currentEditor = new useEditor({
      grid: self,
      gridPosition: absBox($container[0]),
      position: absBox(activeCellNode),
      container: activeCellNode,
      column: columnDef,
      item: item || {},
      commitChanges: commitEditAndSetFocus,
      cancelChanges: cancelEditAndSetFocus
    });

    if (item) {
      currentEditor.loadValue(item);
      if (preClickModeOn && currentEditor.preClick) {
        currentEditor.preClick();
      }
    }

    serializedEditorValue = currentEditor.serializeValue();

    if (currentEditor.position) {
      handleActiveCellPositionChange();
    }
  }

  function commitEditAndSetFocus() {
    // if the commit fails, it would do so due to a validation error
    // if so, do not steal the focus from the editor
    if (getEditorLock().commitCurrentEdit()) {
      setFocus();
      if (options.autoEdit) {
        navigateDown();
      }
    }
  }

  function cancelEditAndSetFocus() {
    if (getEditorLock().cancelCurrentEdit()) {
      setFocus();
    }
  }

  function absBox(elem) {
    let box = {
      top: elem.offsetTop,
      left: elem.offsetLeft,
      bottom: 0,
      right: 0,
      width: $(elem).outerWidth(),
      height: $(elem).outerHeight(),
      visible: true
    };
    box.bottom = box.top + box.height;
    box.right = box.left + box.width;

    // walk up the tree
    let offsetParent = elem.offsetParent;
    while ((elem = elem.parentNode) != document.body) {
      if (elem == null) break;

      if (box.visible && elem.scrollHeight != elem.offsetHeight && $(elem).css('overflowY') != 'visible') {
        box.visible = box.bottom > elem.scrollTop && box.top < elem.scrollTop + elem.clientHeight;
      }

      if (box.visible && elem.scrollWidth != elem.offsetWidth && $(elem).css('overflowX') != 'visible') {
        box.visible = box.right > elem.scrollLeft && box.left < elem.scrollLeft + elem.clientWidth;
      }

      box.left -= elem.scrollLeft;
      box.top -= elem.scrollTop;

      if (elem === offsetParent) {
        box.left += elem.offsetLeft;
        box.top += elem.offsetTop;
        offsetParent = elem.offsetParent;
      }

      box.bottom = box.top + box.height;
      box.right = box.left + box.width;
    }

    return box;
  }

  function getActiveCellPosition() {
    return absBox(activeCellNode);
  }

  function getGridPosition() {
    return absBox($container[0]);
  }

  function handleActiveCellPositionChange() {
    if (!activeCellNode) {
      return;
    }

    trigger(self.onActiveCellPositionChanged, { grid: self });

    if (currentEditor) {
      let cellBox = getActiveCellPosition();
      if (currentEditor.show && currentEditor.hide) {
        if (!cellBox.visible) {
          currentEditor.hide();
        } else {
          currentEditor.show();
        }
      }

      if (currentEditor.position) {
        currentEditor.position(cellBox);
      }
    }
  }

  function getCellEditor() {
    return currentEditor;
  }

  function getActiveCell() {
    if (!activeCellNode) {
      return null;
    } else {
      return { row: activeRow, cell: activeCell, grid: self };
    }
  }

  function getActiveCellNode() {
    return activeCellNode;
  }

  function scrollRowIntoView(row, doPaging) {
    let rowAtTop = row * options.rowHeight;
    let rowAtBottom = (row + 1) * options.rowHeight - viewportH + (viewportHasHScroll ? scrollbarDimensions.height : 0);

    // need to page down?
    if ((row + 1) * options.rowHeight > scrollTop + viewportH + offset) {
      scrollTo(doPaging ? rowAtTop : rowAtBottom);
      render();
    }
    // or page up?
    else if (row * options.rowHeight < scrollTop + offset) {
      scrollTo(doPaging ? rowAtBottom : rowAtTop);
      render();
    }
  }

  function scrollRowToTop(row) {
    scrollTo(row * options.rowHeight);
    render();
  }

  function scrollPage(dir) {
    let deltaRows = dir * numVisibleRows;
    scrollTo((getRowFromPosition(scrollTop) + deltaRows) * options.rowHeight);
    render();

    if (options.enableCellNavigation && activeRow != null) {
      let row = activeRow + deltaRows;
      let dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
      if (row >= dataLengthIncludingAddNew) {
        row = dataLengthIncludingAddNew - 1;
      }
      if (row < 0) {
        row = 0;
      }

      let cell = 0, prevCell = null;
      let prevActivePosX = activePosX;
      while (cell <= activePosX) {
        if (canCellBeActive(row, cell)) {
          prevCell = cell;
        }
        cell += getColspan(row, cell);
      }

      if (prevCell !== null) {
        setActiveCellInternal(getCellNode(row, prevCell));
        activePosX = prevActivePosX;
      } else {
        resetActiveCell();
      }
    }
  }

  function navigatePageDown() {
    scrollPage(1);
  }

  function navigatePageUp() {
    scrollPage(-1);
  }

  function navigateTop() {
    navigateToRow(0);
  }

  function navigateBottom() {
    navigateToRow(getDataLength() - 1);
  }

  function navigateToRow(row) {
    let num_rows = getDataLength();
    if (!num_rows) return true;

    if (row < 0) row = 0;
    else if (row >= num_rows) row = num_rows - 1;

    scrollCellIntoView(row, 0, true);
    if (options.enableCellNavigation && activeRow != null) {
      let cell = 0, prevCell = null;
      let prevActivePosX = activePosX;
      while (cell <= activePosX) {
        if (canCellBeActive(row, cell)) {
          prevCell = cell;
        }
        cell += getColspan(row, cell);
      }

      if (prevCell !== null) {
        setActiveCellInternal(getCellNode(row, prevCell));
        activePosX = prevActivePosX;
      } else {
        resetActiveCell();
      }
    }
    return true;
  }

  function getColspan(row, cell) {
    let metadata = data.getItemMetadata && data.getItemMetadata(row);
    if (!metadata || !metadata.columns) {
      return 1;
    }

    let columnData = metadata.columns[columns[cell].id] || metadata.columns[cell];
    let colspan = (columnData && columnData.colspan);
    if (colspan === '*') {
      colspan = columns.length - cell;
    } else {
      colspan = colspan || 1;
    }

    return colspan;
  }

  function findFirstFocusableCell(row) {
    let cell = 0;
    while (cell < columns.length) {
      if (canCellBeActive(row, cell)) {
        return cell;
      }
      cell += getColspan(row, cell);
    }
    return null;
  }

  function findLastFocusableCell(row) {
    let cell = 0;
    let lastFocusableCell = null;
    while (cell < columns.length) {
      if (canCellBeActive(row, cell)) {
        lastFocusableCell = cell;
      }
      cell += getColspan(row, cell);
    }
    return lastFocusableCell;
  }

  function gotoRight(row, cell, posX) {
    if (cell >= columns.length) {
      return null;
    }

    do {
      cell += getColspan(row, cell);
    }
    while (cell < columns.length && !canCellBeActive(row, cell));

    if (cell < columns.length) {
      return {
        'row': row,
        'cell': cell,
        'posX': cell
      };
    }
    return null;
  }

  function gotoLeft(row, cell, posX) {
    if (cell <= 0) {
      return null;
    }

    let firstFocusableCell = findFirstFocusableCell(row);
    if (firstFocusableCell === null || firstFocusableCell >= cell) {
      return null;
    }

    let prev = {
      'row': row,
      'cell': firstFocusableCell,
      'posX': firstFocusableCell
    };
    let pos;
    while (true) {
      pos = gotoRight(prev.row, prev.cell, prev.posX);
      if (!pos) {
        return null;
      }
      if (pos.cell >= cell) {
        return prev;
      }
      prev = pos;
    }
  }

  function gotoDown(row, cell, posX) {
    let prevCell;
    let dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
    while (true) {
      if (++row >= dataLengthIncludingAddNew) {
        return null;
      }

      prevCell = cell = 0;
      while (cell <= posX) {
        prevCell = cell;
        cell += getColspan(row, cell);
      }

      if (canCellBeActive(row, prevCell)) {
        return {
          'row': row,
          'cell': prevCell,
          'posX': posX
        };
      }
    }
  }

  function gotoUp(row, cell, posX) {
    let prevCell;
    while (true) {
      if (--row < 0) {
        return null;
      }

      prevCell = cell = 0;
      while (cell <= posX) {
        prevCell = cell;
        cell += getColspan(row, cell);
      }

      if (canCellBeActive(row, prevCell)) {
        return {
          'row': row,
          'cell': prevCell,
          'posX': posX
        };
      }
    }
  }

  function gotoNext(row, cell, posX) {
    if (row == null && cell == null) {
      row = cell = posX = 0;
      if (canCellBeActive(row, cell)) {
        return {
          'row': row,
          'cell': cell,
          'posX': cell
        };
      }
    }

    let pos = gotoRight(row, cell, posX);
    if (pos) {
      return pos;
    }

    let firstFocusableCell = null;
    let dataLengthIncludingAddNew = getDataLengthIncludingAddNew();

    // if at last row, cycle through columns rather than get stuck in the last one
    if (row === dataLengthIncludingAddNew - 1) { row--; }

    while (++row < dataLengthIncludingAddNew) {
      firstFocusableCell = findFirstFocusableCell(row);
      if (firstFocusableCell !== null) {
        return {
          'row': row,
          'cell': firstFocusableCell,
          'posX': firstFocusableCell
        };
      }
    }
    return null;
  }

  function gotoPrev(row, cell, posX) {
    if (row == null && cell == null) {
      row = getDataLengthIncludingAddNew() - 1;
      cell = posX = columns.length - 1;
      if (canCellBeActive(row, cell)) {
        return {
          'row': row,
          'cell': cell,
          'posX': cell
        };
      }
    }

    let pos;
    let lastSelectableCell;
    while (!pos) {
      pos = gotoLeft(row, cell, posX);
      if (pos) {
        break;
      }
      if (--row < 0) {
        return null;
      }

      cell = 0;
      lastSelectableCell = findLastFocusableCell(row);
      if (lastSelectableCell !== null) {
        pos = {
          'row': row,
          'cell': lastSelectableCell,
          'posX': lastSelectableCell
        };
      }
    }
    return pos;
  }

  function gotoRowStart(row, cell, posX) {
    let newCell = findFirstFocusableCell(row);
    if (newCell === null) return null;

    return {
      'row': row,
      'cell': newCell,
      'posX': posX
    };
  }

  function gotoRowEnd(row, cell, posX) {
    let newCell = findLastFocusableCell(row);
    if (newCell === null) return null;

    return {
      'row': row,
      'cell': newCell,
      'posX': posX
    };
  }

  function navigateRight() {
    return navigate('right');
  }

  function navigateLeft() {
    return navigate('left');
  }

  function navigateDown() {
    return navigate('down');
  }

  function navigateUp() {
    return navigate('up');
  }

  function navigateNext() {
    return navigate('next');
  }

  function navigatePrev() {
    return navigate('prev');
  }

  function navigateRowStart() {
    return navigate('home');
  }

  function navigateRowEnd() {
    return navigate('end');
  }

  /**
   * @param {string} dir Navigation direction.
   * @return {boolean} Whether navigation resulted in a change of active cell.
   */
  function navigate(dir) {
    if (!options.enableCellNavigation) {
      return false;
    }

    if (!activeCellNode && dir != 'prev' && dir != 'next') {
      return false;
    }

    if (!getEditorLock().commitCurrentEdit()) {
      return true;
    }
    setFocus();

    let tabbingDirections = {
      'up': -1,
      'down': 1,
      'left': -1,
      'right': 1,
      'prev': -1,
      'next': 1,
      'home': -1,
      'end': 1
    };
    tabbingDirection = tabbingDirections[dir];

    let stepFunctions = {
      'up': gotoUp,
      'down': gotoDown,
      'left': gotoLeft,
      'right': gotoRight,
      'prev': gotoPrev,
      'next': gotoNext,
      'home': gotoRowStart,
      'end': gotoRowEnd
    };
    let stepFn = stepFunctions[dir];
    let pos = stepFn(activeRow, activeCell, activePosX);
    if (pos) {
      let isAddNewRow = (pos.row == getDataLength());
      scrollCellIntoView(pos.row, pos.cell, !isAddNewRow && options.emulatePagingWhenScrolling);
      setActiveCellInternal(getCellNode(pos.row, pos.cell));
      activePosX = pos.posX;
      return true;
    } else {
      setActiveCellInternal(getCellNode(activeRow, activeCell));
      return false;
    }
  }

  function getCellNode(row, cell) {
    if (rowsCache[row]) {
      ensureCellNodesInRowsCache(row);
      return rowsCache[row].cellNodesByColumnIdx[cell];
    }
    return null;
  }

  function setActiveCell(row, cell, opt_editMode, preClickModeOn, suppressActiveCellChangedEvent) {
    if (!initialized) { return; }
    if (row > getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
      return;
    }

    if (!options.enableCellNavigation) {
      return;
    }

    scrollCellIntoView(row, cell, false);
    setActiveCellInternal(getCellNode(row, cell), opt_editMode, preClickModeOn, suppressActiveCellChangedEvent);
  }

  function canCellBeActive(row, cell) {
    if (!options.enableCellNavigation || row >= getDataLengthIncludingAddNew() ||
      row < 0 || cell >= columns.length || cell < 0) {
      return false;
    }

    let rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
    if (rowMetadata && typeof rowMetadata.focusable !== 'undefined') {
      return !!rowMetadata.focusable;
    }

    let columnMetadata = rowMetadata && rowMetadata.columns;
    if (columnMetadata && columnMetadata[columns[cell].id] && typeof columnMetadata[columns[cell].id].focusable !== 'undefined') {
      return !!columnMetadata[columns[cell].id].focusable;
    }
    if (columnMetadata && columnMetadata[cell] && typeof columnMetadata[cell].focusable !== 'undefined') {
      return !!columnMetadata[cell].focusable;
    }

    return !!columns[cell].focusable;
  }

  function canCellBeSelected(row, cell) {
    if (row >= getDataLength() || row < 0 || cell >= columns.length || cell < 0) {
      return false;
    }

    let rowMetadata = data.getItemMetadata && data.getItemMetadata(row);
    if (rowMetadata && typeof rowMetadata.selectable !== 'undefined') {
      return !!rowMetadata.selectable;
    }

    let columnMetadata = rowMetadata && rowMetadata.columns && (rowMetadata.columns[columns[cell].id] || rowMetadata.columns[cell]);
    if (columnMetadata && typeof columnMetadata.selectable !== 'undefined') {
      return !!columnMetadata.selectable;
    }

    return !!columns[cell].selectable;
  }

  function gotoCell(row, cell, forceEdit) {
    if (!initialized) { return; }
    if (!canCellBeActive(row, cell)) {
      return;
    }

    if (!getEditorLock().commitCurrentEdit()) {
      return;
    }

    scrollCellIntoView(row, cell, false);

    let newCell = getCellNode(row, cell);

    // if selecting the 'add new' row, start editing right away
    setActiveCellInternal(newCell, forceEdit || (row === getDataLength()) || options.autoEdit);

    // if no editor was created, set the focus back on the grid
    if (!currentEditor) {
      setFocus();
    }
  }

  //////////////////////////////////////////////////////////////////////////////////////////////
  // IEditor implementation for the editor lock

  function commitCurrentEdit() {
    let item = getDataItem(activeRow);
    let column = columns[activeCell];

    if (currentEditor) {
      if (currentEditor.isValueChanged()) {
        let validationResults = currentEditor.validate();

        if (validationResults.valid) {
          if (activeRow < getDataLength()) {
            let editCommand = {
              row: activeRow,
              cell: activeCell,
              editor: currentEditor,
              serializedValue: currentEditor.serializeValue(),
              prevSerializedValue: serializedEditorValue,
              execute: function () {
                this.editor.applyValue(item, this.serializedValue);
                updateRow(this.row);
                trigger(self.onCellChange, {
                  row: this.row,
                  cell: this.cell,
                  item: item,
                  grid: self
                });
              },
              undo: function () {
                this.editor.applyValue(item, this.prevSerializedValue);
                updateRow(this.row);
                trigger(self.onCellChange, {
                  row: this.row,
                  cell: this.cell,
                  item: item,
                  grid: self
                });
              }
            };

            if (options.editCommandHandler) {
              makeActiveCellNormal();
              options.editCommandHandler(item, column, editCommand);
            } else {
              editCommand.execute();
              makeActiveCellNormal();
            }

          } else {
            let newItem = {};
            currentEditor.applyValue(newItem, currentEditor.serializeValue());
            makeActiveCellNormal();
            trigger(self.onAddNewRow, { item: newItem, column: column, grid: self });
          }

          // check whether the lock has been re-acquired by event handlers
          return !getEditorLock().isActive();
        } else {
          // Re-add the CSS class to trigger transitions, if any.
          $(activeCellNode).removeClass('invalid');
          $(activeCellNode).width();  // force layout
          $(activeCellNode).addClass('invalid');

          trigger(self.onValidationError, {
            editor: currentEditor,
            cellNode: activeCellNode,
            validationResults: validationResults,
            row: activeRow,
            cell: activeCell,
            column: column,
            grid: self
          });

          currentEditor.focus();
          return false;
        }
      }

      makeActiveCellNormal();
    }
    return true;
  }

  function cancelCurrentEdit() {
    makeActiveCellNormal();
    return true;
  }

  function rowsToRanges(rows) {
    let ranges = [];
    let lastCell = columns.length - 1;
    for (let i = 0; i < rows.length; i++) {
      ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
    }
    return ranges;
  }

  function getSelectedRows() {
    if (!selectionModel) {
      throw new Error('Selection model is not set');
    }
    return selectedRows;
  }

  function setSelectedRows(rows) {
    if (!selectionModel) {
      throw new Error('Selection model is not set');
    }
    selectionModel.setSelectedRanges(rowsToRanges(rows));
  }
}

export class Grid {

  // scroller
  th;   // virtual height
  h;    // real scrollable height
  ph;   // page height
  n;    // number of pages
  cj;   // "jumpiness" coefficient

  page = 0;       // current page
  offset = 0;     // current page offset
  vScrollDir = 1;

  // private
  initialized = false;
  $container: HTMLElement;
  uid: string = 'slickgrid_' + Math.round(1000000 * Math.random());

  $headerScroller: HTMLElement;
  $headers: HTMLElement;
  $headerRow: HTMLElement;
  $headerRowScroller: HTMLElement;
  $headerRowSpacer: HTMLElement;
  $footerRow: HTMLElement;
  $footerRowScroller: HTMLElement;
  $footerRowSpacer: HTMLElement;
  $preHeaderPanel: HTMLElement;
  $preHeaderPanelScroller: HTMLElement;
  $preHeaderPanelSpacer: HTMLElement;
  $topPanelScroller: HTMLElement;
  $topPanel: HTMLElement;
  $viewport: HTMLElement;
  $canvas: HTMLElement;
  $style: HTMLStyleElement;
  $boundAncestors: HTMLElement;

  stylesheet;
  columnCssRulesL;
  columnCssRulesR;
  viewportH: number;
  viewportW: number;
  canvasWidth;
  viewportHasHScroll: boolean;
  viewportHasVScroll: boolean;
  headerColumnWidthDiff = 0;
  headerColumnHeightDiff = 0; // border+padding
  cellWidthDiff = 0;
  cellHeightDiff = 0;
  jQueryNewWidthBehaviour = false;
  absoluteColumnMinWidth;

  tabbingDirection = 1;
  activePosX;
  activeRow;

  activeCell;
  activeCellNode = null;
  currentEditor = null;
  serializedEditorValue;
  editController;

  rowsCache = {};
  renderedRows = 0;
  numVisibleRows;
  prevScrollTop = 0;
  scrollTop = 0;
  lastRenderedScrollTop = 0;
  lastRenderedScrollLeft = 0;
  prevScrollLeft = 0;
  scrollLeft = 0;

  selectionModel;
  selectedRows = [];

  plugins = [];
  cellCssClasses = {};

  columnsById = {};
  sortColumns = [];
  columnPosLeft = [];
  columnPosRight = [];

  pagingActive = false;
  pagingIsLastPage = false;

  // async call handles
  h_editorLoader = null;
  h_render: number;
  h_postrender = null;
  h_postrenderCleanup = null;
  postProcessedRows = {};
  postProcessToRow = null;
  postProcessFromRow = null;
  postProcessedCleanupQueue = [];
  postProcessgroupId = 0;

  // perf counters
  counter_rows_rendered = 0;
  counter_rows_removed = 0;

  // These two variables work around a bug with inertial scrolling in Webkit/Blink on Mac.
  // See http://crbug.com/312427.
  rowNodeFromLastMouseWheelEvent;  // this node must not be deleted while inertial scrolling
  zombieRowNodeFromLastMouseWheelEvent;  // node that was hidden instead of getting deleted
  zombieRowCacheFromLastMouseWheelEvent;  // row cache for above node
  zombieRowPostProcessedFromLastMouseWheelEvent;  // post processing references for above node

  // store css attributes if display:none is active in container or parent
  cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };
  $hiddenParents;
  columnResizeDragging = false;

  columnDefaults: any;
  options: any;
  scrollbarDimensions: { width: number, height: number };
  columns: any;

  // Events
  onScroll = new Event();
  onSort = new Event();
  onHeaderMouseEnter = new Event();
  onHeaderMouseLeave = new Event();
  onHeaderContextMenu = new Event();
  onHeaderClick = new Event();
  onHeaderCellRendered = new Event();
  onBeforeHeaderCellDestroy = new Event();
  onHeaderRowCellRendered = new Event();
  onFooterRowCellRendered = new Event();
  onBeforeHeaderRowCellDestroy = new Event();
  onBeforeFooterRowCellDestroy = new Event();
  onMouseEnter = new Event();
  onMouseLeave = new Event();
  onClick = new Event();
  onDblClick = new Event();
  onContextMenu = new Event();
  onKeyDown = new Event();
  onAddNewRow = new Event();
  onBeforeAppendCell = new Event();
  onValidationError = new Event();
  onViewportChanged = new Event();
  onColumnsReordered = new Event();
  onColumnsResized = new Event();
  onCellChange = new Event();
  onBeforeEditCell = new Event();
  onBeforeCellEditorDestroy = new Event();
  onBeforeDestroy = new Event();
  onActiveCellChanged = new Event();
  onActiveCellPositionChanged = new Event();
  onDragInit = new Event();
  onDragStart = new Event();
  onDrag = new Event();
  onDragEnd = new Event();
  onSelectedRowsChanged = new Event();
  onCellCssStylesChanged = new Event();

  constructor(container: HTMLElement, data, columns, options) {
    // settings
    let defaults = {
      alwaysShowVerticalScroll: false,
      explicitInitialization: false,
      rowHeight: 25,
      defaultColumnWidth: 80,
      enableAddRow: false,
      leaveSpaceForNewRows: false,
      editable: false,
      autoEdit: true,
      enableCellNavigation: true,
      enableColumnReorder: true,
      asyncEditorLoading: false,
      asyncEditorLoadDelay: 100,
      forceFitColumns: false,
      enableAsyncPostRender: false,
      asyncPostRenderDelay: 50,
      enableAsyncPostRenderCleanup: false,
      asyncPostRenderCleanupDelay: 40,
      autoHeight: false,
      showHeaderRow: false,
      headerRowHeight: 25,
      createFooterRow: false,
      showFooterRow: false,
      footerRowHeight: 25,
      createPreHeaderPanel: false,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 25,
      showTopPanel: false,
      topPanelHeight: 25,
      formatterFactory: null,
      editorFactory: null,
      cellFlashingCssClass: 'flashing',
      selectedCellCssClass: 'selected',
      multiSelect: true,
      enableTextSelectionOnCells: false,
      dataItemColumnValueExtractor: null,
      fullWidthRows: false,
      multiColumnSort: false,
      numberedMultiColumnSort: false,
      tristateMultiColumnSort: false,
      sortColNumberInSeparateSpan: false,
      forceSyncScrolling: false,
      addNewRowCssClass: 'new-row',
      preserveCopiedSelectionOnPaste: false,
      showCellSelection: true,
      viewportClass: null,
      minRowBuffer: 3,
      emulatePagingWhenScrolling: true, // when scrolling off bottom of viewport, place new row at top of viewport
      editorCellNavOnLRKeys: false
    };

    this.columnDefaults = {
      name: '',
      resizable: true,
      sortable: false,
      minWidth: 30,
      rerenderOnResize: false,
      headerCssClass: null,
      defaultSortAsc: true,
      focusable: true,
      selectable: true
    };

    this.$container = container;

    this.columns = columns;
    this.options = { ...defaults, ...options };

    this.validateAndEnforceOptions();

    this.columnDefaults.width = options.defaultColumnWidth;

    this.columnsById = {};

    for (let i = 0; i < columns.length; i++) {
      let m = columns[i] = { ...this.columnDefaults, ...columns[i] };
      this.columnsById[m.id] = i;
      if (m.minWidth && m.width < m.minWidth) {
        m.width = m.minWidth;
      }
      if (m.maxWidth && m.width > m.maxWidth) {
        m.width = m.maxWidth;
      }
    }

    clearNode(this.$container);

    this.$container.style.overflow = 'hidden';
    this.$container.style.outline = '0';

    addClasses(this.$container, this.uid, 'ui-widget');

    // set up a positioning container if needed
    if (!/relative|absolute|fixed/.test(this.$container.style.position)) {
      this.$container.style.position = 'relative';
    }

    this.$headerScroller = document.createElement('div');
    addClasses(this.$headerScroller, 'slick-header', 'ui-state-default');
    this.$container.appendChild(this.$headerScroller);

    this.$headers = document.createElement('div');
    addClass(this.$headers, 'slick-header-columns');
    this.$headers.style.left = '-1000px';
    this.$container.appendChild(this.$headers);

    this.$headerRowScroller = document.createElement('div');
    addClasses(this.$headerRowScroller, 'slick-headerrow', 'ui-state-default');
    this.$container.appendChild(this.$headerRowScroller);

    this.$headerRow = document.createElement('div');
    addClass(this.$headerRow, 'slick-headerrow-columns');
    this.$headerRowScroller.appendChild(this.$headerRow);

    this.$headerRowSpacer = document.createElement('div');
    addClass(this.$headerRow, 'slick-headerrow-spacer');
    this.$headerRowScroller.appendChild(this.$headerRowSpacer);

    if (!options.showHeaderRow) {
      hide(this.$headerRowScroller);
    }

    this.$viewport = document.createElement('div');
    addClass(this.$viewport, 'slick-viewport');
    this.$container.appendChild(this.$viewport);
    this.$viewport.style.overflowX = options.forceFitColumns ? 'hidden' : 'auto';
    this.$viewport.style.overflowY = options.alwaysShowVerticalScroll ? 'scroll' : (options.autoHeight ? 'hidden' : 'auto');

    if (options.viewportClass) {
      addClasses(this.$viewport, options.viewportClass);
    }

    this.$canvas = document.createElement('div');
    addClass(this.$canvas, 'grid-canvas');
    this.$viewport.appendChild(this.$canvas);

    this.scrollbarDimensions = getscrollbarDimensions(this.$viewport);

    this.$headers.style.width = this.getHeadersWidth() + 'px';
    this.$headerRowSpacer.style.width = this.getCanvasWidth() + this.scrollbarDimensions.width + 'px';

    if (!options.explicitInitialization) {
      this.init();
    }
  }

  validateAndEnforceOptions() {
    if (this.options.autoHeight) {
      this.options.leaveSpaceForNewRows = false;
    }
  }

  getHeadersWidth() {
    let headersWidth = this.getColumnTotalWidth(!this.options.autoHeight);
    return Math.max(headersWidth, this.viewportW) + 1000;
  }

  getColumnTotalWidth(includeScrollbar) {
    let totalWidth = 0;
    for (let i = 0, ii = this.columns.length; i < ii; i++) {
      let width = this.columns[i].width;
      totalWidth += width;
    }
    if (includeScrollbar) {
      totalWidth += this.scrollbarDimensions.width;
    }
    return totalWidth;
  }

  getCanvasWidth() {
    let availableWidth = this.viewportHasVScroll ? this.viewportW - this.scrollbarDimensions.width : this.viewportW;
    let rowWidth = 0;
    let i = this.columns.length;
    while (i--) {
      rowWidth += this.columns[i].width;
    }
    return this.options.fullWidthRows ? Math.max(rowWidth, availableWidth) : rowWidth;
  }

  public init() {
    if (!this.initialized) {
      this.initialized = true;

      this.viewportW = this.$container.clientWidth;

      // header columns and cells may have different padding/border skewing width calculations (box-sizing, hello?)
      // calculate the diff so we can set consistent sizes
      this.measureCellPaddingAndBorder();

      // for usability reasons, all text selection in SlickGrid is disabled
      // with the exception of input and textarea elements (selection must
      // be enabled there so that editors work as expected); note that
      // selection in grid cells (grid body) is already unavailable in
      // all browsers except IE
      disableSelection(this.$headers); // disable all text selection in header (including input and textarea)

      this.updateColumnCaches();
      this.createColumnHeaders();
      this.createCssRules();
      this.resizeCanvas();

      this.$viewport.addEventListener('scroll', this.handleScroll.bind(this));
    }
  }

  measureCellPaddingAndBorder() {
    let h = ['borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight'];
    let v = ['borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'];

    let el = document.createElement('div');
    addClass(el, 'slick-header-column');
    el.style.visibility = 'hidden';
    this.$headers.appendChild(el);

    this.headerColumnWidthDiff = this.headerColumnHeightDiff = 0;
    if (el.style.boxSizing !== 'border-box') {
      h.forEach(a => {
        this.headerColumnWidthDiff += parseFloat(el.style[a]) || 0;
      });
      v.forEach(a => {
        this.headerColumnHeightDiff += parseFloat(el.style[a]) || 0;
      });
    }

    el.remove();

    let r = document.createElement('div');
    addClass(r, 'slick-row');

    el = document.createElement('div');
    addClass(el, 'slick-cell');
    el.style.visibility = 'hidden';
    r.appendChild(el);
    this.$canvas.appendChild(r);

    this.cellWidthDiff = this.cellHeightDiff = 0;

    if (el.style.boxSizing !== 'border-box') {
      h.forEach(a => {
        this.cellWidthDiff += parseFloat(el.style[a]) || 0;
      });
      v.forEach(a => {
        this.cellHeightDiff += parseFloat(el.style[a]) || 0;
      });
    }

    el.remove();
    r.remove();

    this.absoluteColumnMinWidth = Math.max(this.headerColumnWidthDiff, this.cellWidthDiff);
  }

  updateColumnCaches() {
    // Pre-calculate cell boundaries.
    this.columnPosLeft = [];
    this.columnPosRight = [];
    let x = 0;
    for (let i = 0, ii = this.columns.length; i < ii; i++) {
      this.columnPosLeft[i] = x;
      this.columnPosRight[i] = x + this.columns[i].width;
      x += this.columns[i].width;
    }
  }

  createColumnHeaders() {
    clearNode(this.$headers);
    this.$headers.style.width = this.getHeadersWidth() + 'px';

    clearNode(this.$headerRow);

    for (let i = 0; i < this.columns.length; i++) {
      let m = this.columns[i];

      let header = document.createElement('div');
      addClass(header, 'slick-header-column');

      let span = document.createElement('span');
      addClasses(span, 'slick-column-name', m.name, m.headerCssClass);
      header.appendChild(span);

      header.style.width = m.width - this.headerColumnWidthDiff + 'px';
      header.id = this.uid + m.id;
      header.title = m.toolTip || '';

      this.$headers.appendChild(header);

      if (this.options.showHeaderRow) {
        let headerRowCell = document.createElement('div');
        addClasses(headerRowCell, 'slick-headerrow-column', `l${i}`, `r${i}`);
        this.$headerRow.appendChild(headerRowCell);
      }
    }
  }

  createCssRules() {
    this.$style = document.createElement('style');
    this.$style.type = 'text/css';
    this.$style.media = 'screen';

    let rowHeight = (this.options.rowHeight - this.cellHeightDiff);
    let rules = [
      '.' + this.uid + ' .slick-header-column { left: 1000px; }',
      '.' + this.uid + ' .slick-top-panel { height:' + this.options.topPanelHeight + 'px; }',
      '.' + this.uid + ' .slick-preheader-panel { height:' + this.options.preHeaderPanelHeight + 'px; }',
      '.' + this.uid + ' .slick-headerrow-columns { height:' + this.options.headerRowHeight + 'px; }',
      '.' + this.uid + ' .slick-footerrow-columns { height:' + this.options.footerRowHeight + 'px; }',
      '.' + this.uid + ' .slick-cell { height:' + rowHeight + 'px; }',
      '.' + this.uid + ' .slick-row { height:' + this.options.rowHeight + 'px; }'
    ];

    for (let i = 0; i < this.columns.length; i++) {
      rules.push('.' + this.uid + ' .l' + i + ' { }');
      rules.push('.' + this.uid + ' .r' + i + ' { }');
    }

    this.$style.appendChild(document.createTextNode(rules.join(' ')));

    document.head.appendChild(this.$style);
  }

  resizeCanvas() {
    if (!this.initialized) { return; }
    if (this.options.autoHeight) {
      this.viewportH = this.options.rowHeight * this.getDataLengthIncludingAddNew();
    } else {
      this.viewportH = this.getViewportHeight();
    }

    this.numVisibleRows = Math.ceil(this.viewportH / this.options.rowHeight);
    this.viewportW = this.$container.clientWidth;
    if (!this.options.autoHeight) {
      this.$viewport.style.height = this.viewportH + 'px';
    }

    if (this.options.forceFitColumns) {
      this.autosizeColumns();
    }

    this.updateRowCount();
    this.handleScroll();
    // Since the width has changed, force the render() to reevaluate virtually rendered cells.
    this.lastRenderedScrollLeft = -1;
    this.render();
  }

  handleScroll() {
    let { scrollTop, scrollLeft } = this.$viewport;
    let vScrollDist = Math.abs(scrollTop - this.prevScrollTop);
    let hScrollDist = Math.abs(scrollLeft - this.prevScrollLeft);

    if (hScrollDist) {
      this.prevScrollLeft = scrollLeft;
      this.$headerScroller.scrollLeft = scrollLeft;
      this.$topPanelScroller.scrollLeft = scrollLeft;
      this.$headerRowScroller.scrollLeft = scrollLeft;
    }

    if (vScrollDist) {
      this.vScrollDir = this.prevScrollTop < scrollTop ? 1 : -1;
      this.prevScrollTop = scrollTop;

      // switch virtual pages if needed
      if (vScrollDist < this.viewportH) {
        this.scrollTo(scrollTop + this.offset);
      } else {
        let oldOffset = this.offset;
        if (this.h == this.viewportH) {
          this.page = 0;
        } else {
          this.page = Math.min(this.n - 1, Math.floor(scrollTop * ((this.th - this.viewportH) / (this.h - this.viewportH)) * (1 / this.ph)));
        }
        this.offset = Math.round(this.page * this.cj);
        if (oldOffset != this.offset) {
          this.invalidateAllRows();
        }
      }
    }

    if (hScrollDist || vScrollDist) {
      if (this.h_render) {
        clearTimeout(this.h_render);
      }

      if (Math.abs(this.lastRenderedScrollTop - scrollTop) > 20 ||
        Math.abs(this.lastRenderedScrollLeft - scrollLeft) > 20) {
        if (this.options.forceSyncScrolling || (
          Math.abs(this.lastRenderedScrollTop - scrollTop) < this.viewportH &&
          Math.abs(this.lastRenderedScrollLeft - scrollLeft) < this.viewportW)) {
          this.render();
        } else {
          this.h_render = setTimeout(this.render.bind(this), 50);
        }

        this.trigger(this.onViewportChanged, { grid: self });
      }
    }

    this.trigger(this.onScroll, { scrollLeft: scrollLeft, scrollTop: scrollTop, grid: self });
  }

  scrollTo(y) {
    y = Math.max(y, 0);
    y = Math.min(y, this.th - this.viewportH + (this.viewportHasHScroll ? this.scrollbarDimensions.height : 0));

    let oldOffset = this.offset;

    this.page = Math.min(this.n - 1, Math.floor(y / this.ph));
    this.offset = Math.round(this.page * this.cj);
    let newScrollTop = y - this.offset;

    if (this.offset != oldOffset) {
      let range = this.getVisibleRange(newScrollTop);
      this.cleanupRows(range);
      this.updateRowPositions();
    }

    if (this.prevScrollTop != newScrollTop) {
      this.vScrollDir = (this.prevScrollTop + oldOffset < newScrollTop + this.offset) ? 1 : -1;
      this.$viewport.scrollTop = (this.lastRenderedScrollTop = this.scrollTop = this.prevScrollTop = newScrollTop);

      this.trigger(this.onViewportChanged, { grid: this });
    }
  }

  public invalidateAllRows() {
    for (let row in this.rowsCache) {
      this.removeRowFromCache(row);
    }
    if (this.options.enableAsyncPostRenderCleanup) {
      this.startPostProcessingCleanup();
    }
  }

  private getDataLengthIncludingAddNew() {
    return this.getDataLength() + (!this.options.enableAddRow ? 0 : (!this.pagingActive || this.pagingIsLastPage ? 1 : 0));
  }

  getViewportHeight() {
    return parseFloat(this.$container.style.height) -
      parseFloat(this.$container.style.paddingTop) -
      parseFloat(this.$container.style.paddingBottom) -
      parseFloat(this.$headerScroller.style.height) -
      this.getVBoxDelta(this.$headerScroller) -
      (this.options.showTopPanel ? this.options.topPanelHeight + this.getVBoxDelta(this.$topPanelScroller) : 0) -
      (this.options.showHeaderRow ? this.options.headerRowHeight + this.getVBoxDelta(this.$headerRowScroller) : 0) -
      (this.options.createFooterRow && this.options.showFooterRow ? this.options.footerRowHeight + this.getVBoxDelta(this.$footerRowScroller) : 0) -
      (this.options.createPreHeaderPanel && this.options.showPreHeaderPanel ? this.options.preHeaderPanelHeight + this.getVBoxDelta(this.$preHeaderPanelScroller) : 0);
  }

  autosizeColumns() {
    let i, c,
      widths = [],
      shrinkLeeway = 0,
      total = 0,
      prevTotal,
      availWidth = this.viewportHasVScroll ? this.viewportW - this.scrollbarDimensions.width : this.viewportW;

    for (i = 0; i < this.columns.length; i++) {
      c = this.columns[i];
      widths.push(c.width);
      total += c.width;
      if (c.resizable) {
        shrinkLeeway += c.width - Math.max(c.minWidth, this.absoluteColumnMinWidth);
      }
    }

    // shrink
    prevTotal = total;
    while (total > availWidth && shrinkLeeway) {
      let shrinkProportion = (total - availWidth) / shrinkLeeway;
      for (i = 0; i < this.columns.length && total > availWidth; i++) {
        c = this.columns[i];
        let width = widths[i];
        if (!c.resizable || width <= c.minWidth || width <= this.absoluteColumnMinWidth) {
          continue;
        }
        let absMinWidth = Math.max(c.minWidth, this.absoluteColumnMinWidth);
        let shrinkSize = Math.floor(shrinkProportion * (width - absMinWidth)) || 1;
        shrinkSize = Math.min(shrinkSize, width - absMinWidth);
        total -= shrinkSize;
        shrinkLeeway -= shrinkSize;
        widths[i] -= shrinkSize;
      }
      if (prevTotal <= total) {  // avoid infinite loop
        break;
      }
      prevTotal = total;
    }

    // grow
    prevTotal = total;
    while (total < availWidth) {
      let growProportion = availWidth / total;
      for (i = 0; i < this.columns.length && total < availWidth; i++) {
        c = this.columns[i];
        let currentWidth = widths[i];
        let growSize;

        if (!c.resizable || c.maxWidth <= currentWidth) {
          growSize = 0;
        } else {
          growSize = Math.min(Math.floor(growProportion * currentWidth) - currentWidth, (c.maxWidth - currentWidth) || 1000000) || 1;
        }
        total += growSize;
        widths[i] += (total <= availWidth ? growSize : 0);
      }
      if (prevTotal >= total) {  // avoid infinite loop
        break;
      }
      prevTotal = total;
    }

    let reRender = false;
    for (i = 0; i < this.columns.length; i++) {
      if (this.columns[i].rerenderOnResize && this.columns[i].width != widths[i]) {
        reRender = true;
      }
      this.columns[i].width = widths[i];
    }

    this.applyColumnHeaderWidths();
    this.updateCanvasWidth(true);
    if (reRender) {
      this.invalidateAllRows();
      this.render();
    }
  }

  render() {
    if (!this.initialized) {
      return;
    }
    let visible = this.getVisibleRange();
    let rendered = this.getRenderedRange();

    // remove rows no longer in the viewport
    this.cleanupRows(rendered);

    // add new rows & missing cells in existing rows
    if (this.lastRenderedScrollLeft != this.scrollLeft) {
      this.cleanUpAndRenderCells(rendered);
    }

    // render missing rows
    this.renderRows(rendered);

    this.postProcessFromRow = visible.top;
    this.postProcessToRow = Math.min(this.getDataLengthIncludingAddNew() - 1, visible.bottom);
    this.startPostProcessing();

    this.lastRenderedScrollTop = this.scrollTop;
    this.lastRenderedScrollLeft = this.scrollLeft;
    this.h_render = null;
  }

  trigger(evt, args, e?) {
    e = e || new EventData();
    args = args || {};
    args.grid = self;
    return evt.notify(args, e, self);
  }

  private getVisibleRange(viewportTop?, viewportLeft?) {
    if (viewportTop == null) {
      viewportTop = this.scrollTop;
    }
    if (viewportLeft == null) {
      viewportLeft = this.scrollLeft;
    }

    return {
      top: this.getRowFromPosition(viewportTop),
      bottom: this.getRowFromPosition(viewportTop + this.viewportH) + 1,
      leftPx: viewportLeft,
      rightPx: viewportLeft + this.viewportW
    };
  }

  updateRowCount() {
    if (!this.initialized) { return; }

    let dataLength = this.getDataLength();
    let dataLengthIncludingAddNew = getDataLengthIncludingAddNew();
    let numberOfRows = dataLengthIncludingAddNew +
      (options.leaveSpaceForNewRows ? numVisibleRows - 1 : 0);

    let oldViewportHasVScroll = viewportHasVScroll;
    // with autoHeight, we do not need to accommodate the vertical scroll bar
    viewportHasVScroll = options.alwaysShowVerticalScroll || !options.autoHeight && (numberOfRows * options.rowHeight > viewportH);
    viewportHasHScroll = (canvasWidth > viewportW - scrollbarDimensions.width);

    makeActiveCellNormal();

    // remove the rows that are now outside of the data range
    // this helps avoid redundant calls to .removeRow() when the size of the data decreased by thousands of rows
    let r1 = dataLength - 1;
    for (let i in rowsCache) {
      if (i > r1) {
        removeRowFromCache(i);
      }
    }
    if (options.enableAsyncPostRenderCleanup) { startPostProcessingCleanup(); }

    if (activeCellNode && activeRow > r1) {
      resetActiveCell();
    }

    let oldH = h;
    th = Math.max(options.rowHeight * numberOfRows, viewportH - scrollbarDimensions.height);
    if (th < maxSupportedCssHeight) {
      // just one page
      h = ph = th;
      n = 1;
      cj = 0;
    } else {
      // break into pages
      h = maxSupportedCssHeight;
      ph = h / 100;
      n = Math.floor(th / ph);
      cj = (th - h) / (n - 1);
    }

    if (h !== oldH) {
      $canvas.css('height', h);
      scrollTop = $viewport[0].scrollTop;
    }

    let oldScrollTopInRange = (scrollTop + offset <= th - viewportH);

    if (th == 0 || scrollTop == 0) {
      page = offset = 0;
    } else if (oldScrollTopInRange) {
      // maintain virtual position
      scrollTo(scrollTop + offset);
    } else {
      // scroll to bottom
      scrollTo(th - viewportH);
    }

    if (h != oldH && options.autoHeight) {
      resizeCanvas();
    }

    if (options.forceFitColumns && oldViewportHasVScroll != viewportHasVScroll) {
      autosizeColumns();
    }
    updateCanvasWidth(false);
  }

  cleanupRows(rangeToKeep) {
    for (let i in rowsCache) {
      if (((i = parseInt(i, 10)) !== activeRow) && (i < rangeToKeep.top || i > rangeToKeep.bottom)) {
        removeRowFromCache(i);
      }
    }
    if (options.enableAsyncPostRenderCleanup) { startPostProcessingCleanup(); }
  }

  updateRowPositions() {
    for (let row in rowsCache) {
      rowsCache[row].rowNode.style.top = getRowTop(row) + 'px';
    }
  }

  removeRowFromCache(row) {
    let cacheEntry = rowsCache[row];
    if (!cacheEntry) {
      return;
    }

    if (cacheEntry.rowNode) {
      if (rowNodeFromLastMouseWheelEvent === cacheEntry.rowNode) {
        cacheEntry.rowNode.style.display = 'none';
        zombieRowNodeFromLastMouseWheelEvent = rowNodeFromLastMouseWheelEvent;
        zombieRowCacheFromLastMouseWheelEvent = cacheEntry;
        zombieRowPostProcessedFromLastMouseWheelEvent = postProcessedRows[row];
        // ignore post processing cleanup in this case - it will be dealt with later
      } else {
        if (options.enableAsyncPostRenderCleanup && postProcessedRows[row]) {
          queuePostProcessedRowForCleanup(cacheEntry, postProcessedRows[row], row);
        } else {
          $canvas[0].removeChild(cacheEntry.rowNode);
        }
      }
    }

    delete rowsCache[row];
    delete postProcessedRows[row];
    renderedRows--;
    counter_rows_removed++;
  }

  startPostProcessingCleanup() {
    if (!options.enableAsyncPostRenderCleanup) {
      return;
    }
    clearTimeout(h_postrenderCleanup);
    h_postrenderCleanup = setTimeout(asyncPostProcessCleanupRows, options.asyncPostRenderCleanupDelay);
  }

  getDataLength() {
    if (this.data.getLength) {
      return this.data.getLength();
    } else {
      return this.data.length;
    }
  }

  getVBoxDelta($el) {
    let p = ['borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom'];
    let delta = 0;
    p.forEach(a => {
      delta += parseFloat($el.style[a]) || 0;
    });
    return delta;
  }

  applyColumnHeaderWidths() {
    if (!this.initialized) { return; }
    let h: HTMLElement;

    for (let i = 0, headers = this.$headers.children, ii = this.columns.length; i < ii; i++) {
      h = headers[i];

      if (h.clientW !== columns[i].width - headerColumnWidthDiff) {
        h.width(columns[i].width - headerColumnWidthDiff);
      }

    }

    updateColumnCaches();
  }

  updateCanvasWidth(forceColumnWidthsUpdate) {
    let oldCanvasWidth = canvasWidth;
    canvasWidth = getCanvasWidth();

    if (canvasWidth != oldCanvasWidth) {
      $canvas.width(canvasWidth);
      $headerRow.width(canvasWidth);
      if (options.createFooterRow) { $footerRow.width(canvasWidth); }
      if (options.createPreHeaderPanel) { $preHeaderPanel.width(canvasWidth); }
      $headers.width(getHeadersWidth());
      viewportHasHScroll = (canvasWidth > viewportW - scrollbarDimensions.width);
    }

    let w = canvasWidth + (viewportHasVScroll ? scrollbarDimensions.width : 0);
    $headerRowSpacer.width(w);
    if (options.createFooterRow) { $footerRowSpacer.width(w); }
    if (options.createPreHeaderPanel) { $preHeaderPanelSpacer.width(w); }

    if (canvasWidth != oldCanvasWidth || forceColumnWidthsUpdate) {
      applyColumnWidths();
    }
  }

  getRenderedRange(viewportTop?, viewportLeft?) {
    let range = this.getVisibleRange(viewportTop, viewportLeft);
    let buffer = Math.round(this.viewportH / this.options.rowHeight);
    let minBuffer = this.options.minRowBuffer;

    if (this.vScrollDir == -1) {
      range.top -= buffer;
      range.bottom += minBuffer;
    } else if (this.vScrollDir == 1) {
      range.top -= minBuffer;
      range.bottom += buffer;
    } else {
      range.top -= minBuffer;
      range.bottom += minBuffer;
    }

    range.top = Math.max(0, range.top);
    range.bottom = Math.min(this.getDataLengthIncludingAddNew() - 1, range.bottom);

    range.leftPx -= this.viewportW;
    range.rightPx += this.viewportW;

    range.leftPx = Math.max(0, range.leftPx);
    range.rightPx = Math.min(this.canvasWidth, range.rightPx);

    return range;
  }

  cleanUpAndRenderCells(range) {
    let cacheEntry;
    let stringArray = [];
    let processedRows = [];
    let cellsAdded;
    let totalCellsAdded = 0;
    let colspan;

    for (let row = range.top, btm = range.bottom; row <= btm; row++) {
      cacheEntry = this.rowsCache[row];
      if (!cacheEntry) {
        continue;
      }

      // cellRenderQueue populated in renderRows() needs to be cleared first
      ensureCellNodesInRowsCache(row);

      cleanUpCells(range, row);

      // Render missing cells.
      cellsAdded = 0;

      let metadata = data.getItemMetadata && data.getItemMetadata(row);
      metadata = metadata && metadata.columns;

      let d = getDataItem(row);

      // TODO:  shorten this loop (index? heuristics? binary search?)
      for (let i = 0, ii = columns.length; i < ii; i++) {
        // Cells to the right are outside the range.
        if (columnPosLeft[i] > range.rightPx) {
          break;
        }

        // Already rendered.
        if ((colspan = cacheEntry.cellColSpans[i]) != null) {
          i += (colspan > 1 ? colspan - 1 : 0);
          continue;
        }

        colspan = 1;
        if (metadata) {
          let columnData = metadata[columns[i].id] || metadata[i];
          colspan = (columnData && columnData.colspan) || 1;
          if (colspan === '*') {
            colspan = ii - i;
          }
        }

        if (columnPosRight[Math.min(ii - 1, i + colspan - 1)] > range.leftPx) {
          appendCellHtml(stringArray, row, i, colspan, d);
          cellsAdded++;
        }

        i += (colspan > 1 ? colspan - 1 : 0);
      }

      if (cellsAdded) {
        totalCellsAdded += cellsAdded;
        processedRows.push(row);
      }
    }

    if (!stringArray.length) {
      return;
    }

    let x = document.createElement('div');
    x.innerHTML = stringArray.join('');

    let processedRow;
    let node;
    while ((processedRow = processedRows.pop()) != null) {
      cacheEntry = rowsCache[processedRow];
      let columnIdx;
      while ((columnIdx = cacheEntry.cellRenderQueue.pop()) != null) {
        node = x.lastChild;
        cacheEntry.rowNode.appendChild(node);
        cacheEntry.cellNodesByColumnIdx[columnIdx] = node;
      }
    }
  }

  renderRows(range) {
    let parentNode = this.$canvas,
      stringArray = [],
      rows = [],
      needToReselectCell = false,
      dataLength = getDataLength();

    for (let i = range.top, ii = range.bottom; i <= ii; i++) {
      if (rowsCache[i]) {
        continue;
      }
      renderedRows++;
      rows.push(i);

      // Create an entry right away so that appendRowHtml() can
      // start populatating it.
      rowsCache[i] = {
        'rowNode': null,

        // ColSpans of rendered cells (by column idx).
        // Can also be used for checking whether a cell has been rendered.
        'cellColSpans': [],

        // Cell nodes (by column idx).  Lazy-populated by ensureCellNodesInRowsCache().
        'cellNodesByColumnIdx': [],

        // Column indices of cell nodes that have been rendered, but not yet indexed in
        // cellNodesByColumnIdx.  These are in the same order as cell nodes added at the
        // end of the row.
        'cellRenderQueue': []
      };

      appendRowHtml(stringArray, i, range, dataLength);
      if (activeCellNode && activeRow === i) {
        needToReselectCell = true;
      }
      counter_rows_rendered++;
    }

    if (!rows.length) { return; }

    let x = document.createElement('div');
    x.innerHTML = stringArray.join('');

    for (let i = 0, ii = rows.length; i < ii; i++) {
      rowsCache[rows[i]].rowNode = parentNode.appendChild(x.firstChild);
    }

    if (needToReselectCell) {
      activeCellNode = getCellNode(activeRow, activeCell);
    }

  }

  startPostProcessing() {
    if (!options.enableAsyncPostRender) {
      return;
    }
    clearTimeout(h_postrender);
    h_postrender = setTimeout(asyncPostProcessRows, options.asyncPostRenderDelay);
  }

  getRowFromPosition(y) {
    return Math.floor((y + offset) / options.rowHeight);
  }
}
