/***
 * A base class that all special / non-data rows (like Group and GroupTotals) derive from.
 * @class NonDataItem
 * @constructor
 */
export class NonDataItem {
    __nonDataRow = true;
}

/***
 * Information about a group of rows.
 * @class Group
 * @extends Slick.NonDataItem
 * @constructor
 */
export class Group extends NonDataItem {
    __group = true;

    /**
     * Grouping level, starting with 0.
     * @property level
     * @type {Number}
     */
    level = 0;

    /***
     * Number of rows in the group.
     * @property count
     * @type {Integer}
     */
    count = 0;

    /***
     * Grouping value.
     * @property value
     * @type {Object}
     */
    value = null;

    /***
     * Formatted display value of the group.
     * @property title
     * @type {String}
     */
    title = null;

    /***
     * Whether a group is collapsed.
     * @property collapsed
     * @type {Boolean}
     */
    collapsed = false;

    /***
     * Whether a group selection checkbox is checked.
     * @property selectChecked
     * @type {Boolean}
     */
    selectChecked = false;

    /***
     * GroupTotals, if any.
     * @property totals
     * @type {GroupTotals}
     */
    totals = null;

    /**
     * Rows that are part of the group.
     * @property rows
     * @type {Array}
     */
    rows = [];

    /**
     * Sub-groups that are part of the group.
     * @property groups
     * @type {Array}
     */
    groups = null;

    /**
     * A unique key used to identify the group.  This key can be used in calls to DataView
     * collapseGroup() or expandGroup().
     * @property groupingKey
     * @type {Object}
     */
    groupingKey = null;

    equals(group) {
        return this.value === group.value &&
            this.count === group.count &&
            this.collapsed === group.collapsed &&
            this.title === group.title;
    };
}

/***
 * Information about group totals.
 * An instance of GroupTotals will be created for each totals row and passed to the aggregators
 * so that they can store arbitrary data in it.  That data can later be accessed by group totals
 * formatters during the display.
 * @class GroupTotals
 * @extends Slick.NonDataItem
 * @constructor
 */
export class GroupTotals extends NonDataItem {
    __groupTotals = true;

    /***
     * Parent Group.
     * @param group
     * @type {Group}
     */
    group = null;

    /***
     * Whether the totals have been fully initialized / calculated.
     * Will be set to false for lazy-calculated group totals.
     * @param initialized
     * @type {Boolean}
     */
    initialized = false;
}