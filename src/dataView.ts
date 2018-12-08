import { Event } from './core/event';

export interface RefreshHints {
  ignoreDiffsBefore: number
  ignoreDiffsAfter: number
}

export class DataView {
  // private
  idProperty = 'id';  // property holding a unique row id
  items = [];         // data by index
  rows = [];          // data by row
  idxById = {};       // indexes by id
  rowsById = null;    // rows by id; lazy-calculated
  updated = null;     // updated item ids
  suspend = false;    // suspends the recalculation
  refreshHints: RefreshHints = Object.create(null);
  prevRefreshHints: RefreshHints = Object.create(null);

  pagesize = 0;
  pagenum = 0;
  totalRows = 0;
  // events
  onRowCountChanged = new Event();
  onRowsChanged = new Event();

  options: any;

  constructor(options) {
    this.options = options;
  }

  beginUpdate() {
    this.suspend = true;
  }

  endUpdate() {
    this.suspend = false;
    this.refresh();
  }

  setRefreshHints(hints) {
    this.refreshHints = hints;
  }

  updateIdxById(startingIndex = 0) {
    let id;
    for (let i = startingIndex, l = this.items.length; i < l; i++) {
      id = this.items[i][this.idProperty];
      if (id === undefined) {
        throw new Error('Each data element must implement a unique \'id\' property');
      }
      this.idxById[id] = i;
    }
  }

  ensureIdUniqueness() {
    let id;
    for (let i = 0, l = this.items.length; i < l; i++) {
      id = this.items[i][this.idProperty];
      if (id === undefined || this.idxById[id] !== i) {
        throw new Error('Each data element must implement a unique \'id\' property');
      }
    }
  }

  getItems() {
    return this.items;
  }

  setItems(data, objectIdProperty) {
    if (objectIdProperty !== undefined) {
      this.idProperty = objectIdProperty;
    }
    this.items = data;
    this.idxById = {};
    this.updateIdxById();
    this.ensureIdUniqueness();
    this.refresh();
  }

  getItemByIdx(i) {
    return this.items[i];
  }

  getIdxById(id) {
    return this.idxById[id];
  }

  ensureRowsByIdCache() {
    if (!this.rowsById) {
      this.rowsById = {};
      for (let i = 0, l = this.rows.length; i < l; i++) {
        this.rowsById[this.rows[i][this.idProperty]] = i;
      }
    }
  }

  getRowByItem(item) {
    this.ensureRowsByIdCache();
    return this.rowsById[item[this.idProperty]];
  }

  getRowById(id) {
    this.ensureRowsByIdCache();
    return this.rowsById[id];
  }

  getItemById(id) {
    return this.items[this.idxById[id]];
  }

  mapItemsToRows(itemArray) {
    let rows = [];
    this.ensureRowsByIdCache();
    for (let i = 0, l = itemArray.length; i < l; i++) {
      let row = this.rowsById[itemArray[i][this.idProperty]];
      if (row != null) {
        rows[rows.length] = row;
      }
    }
    return rows;
  }

  mapIdsToRows(idArray) {
    let rows = [];
    this.ensureRowsByIdCache();
    for (let i = 0, l = idArray.length; i < l; i++) {
      let row = this.rowsById[idArray[i]];
      if (row != null) {
        rows[rows.length] = row;
      }
    }
    return rows;
  }

  mapRowsToIds(rowArray) {
    let ids = [];
    for (let i = 0, l = rowArray.length; i < l; i++) {
      if (rowArray[i] < this.rows.length) {
        ids[ids.length] = this.rows[rowArray[i]][this.idProperty];
      }
    }
    return ids;
  }

  updateItem(id, item) {
    if (this.idxById[id] === undefined || id !== item[this.idProperty]) {
      throw new Error('Invalid or non-matching id');
    }
    this.items[this.idxById[id]] = item;
    if (!this.updated) {
      this.updated = {};
    }
    this.updated[id] = true;
    this.refresh();
  }

  insertItem(insertBefore, item) {
    this.items.splice(insertBefore, 0, item);
    this.updateIdxById(insertBefore);
    this.refresh();
  }

  addItem(item) {
    this.items.push(item);
    this.updateIdxById(this.items.length - 1);
    this.refresh();
  }

  deleteItem(id) {
    let idx = this.idxById[id];
    if (idx === undefined) {
      throw new Error('Invalid id');
    }
    delete this.idxById[id];
    this.items.splice(idx, 1);
    this.updateIdxById(idx);
    this.refresh();
  }

  getLength() {
    return this.rows.length;
  }

  getItem(i) {
    let item = this.rows[i];

    return item;
  }

  getItemMetadata(i) {
    let item = this.rows[i];
    if (item === undefined) {
      return null;
    }

    return null;
  }

  refresh() {
    if (this.suspend) {
      return;
    }

    let countBefore = this.rows.length;
    let totalRowsBefore = this.totalRows;

    let diff = this.recalc(this.items); // pass as direct refs to avoid closure perf hit

    // if the current page is no longer valid, go to last page and recalc
    // we suffer a performance penalty here, but the main loop (recalc) remains highly optimized
    if (this.pagesize && this.totalRows < this.pagenum * this.pagesize) {
      this.pagenum = Math.max(0, Math.ceil(this.totalRows / this.pagesize) - 1);
      diff = this.recalc(this.items);
    }

    this.updated = null;
    this.prevRefreshHints = this.refreshHints;
    this.refreshHints = Object.create(null);

    if (countBefore !== this.rows.length) {
      this.onRowCountChanged.notify({ previous: countBefore, current: this.rows.length, dataView: self }, null, self);
    }
    if (diff.length > 0) {
      this.onRowsChanged.notify({ rows: diff, dataView: self }, null, self);
    }
  }

  recalc(_items) {
    this.rowsById = null;

    let newRows = _items;

    let diff = this.getRowDiffs(this.rows, newRows);

    this.rows = newRows;

    return diff;
  }

  getRowDiffs(rows, newRows) {
    let item, r, eitherIsNonData, diff = [];
    let from = 0, to = newRows.length;

    if (this.refreshHints && this.refreshHints.ignoreDiffsBefore) {
      from = Math.max(0,
        Math.min(newRows.length, this.refreshHints.ignoreDiffsBefore));
    }

    if (this.refreshHints && this.refreshHints.ignoreDiffsAfter) {
      to = Math.min(newRows.length,
        Math.max(0, this.refreshHints.ignoreDiffsAfter));
    }

    for (let i = from, rl = rows.length; i < to; i++) {
      if (i >= rl) {
        diff[diff.length] = i;
      } else {
        item = newRows[i];
        r = rows[i];

        diff[diff.length] = i;
      }
    }
    return diff;
  }
}
