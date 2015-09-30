'use strict';

;
/***********************************
 *
 * Table Selection Component
 *
 **********************************/

function TableSelection(_table, _opts) {

  var ROW_ATTRIBUTE = 'table-selection-index';

  var self = this,
      opts = {
    ctrlA: _.isBoolean(_opts.ctrlA) ? _opts.ctrlA : true,
    ctrlKey: _.isBoolean(_opts.ctrlKey) ? _opts.ctrlKey : true,
    shiftKey: _.isBoolean(_opts.shiftKey) ? _opts.shiftKey : true,
    activeClass: _.isString(_opts.activeClass) ? _opts.activeClass : 'active',
    autoInit: _.isBoolean(_opts.autoInit) ? _opts.autoInit : true
  },
      elements = {
    table: _table,
    rows: [],
    tbody: null
  },
      actions = {
    init: false,
    lastIndex: null
  };

  /**
   * initialize component
   */
  this.init = function () {
    if (!actions.init) {
      // set rows
      elements.rows = _getRowArray(elements.table);
      // set container
      elements.container = _.isElement(elements.tbody) ? elements.tbody : elements.table;
      _setEvents();
      actions.init = true;
    }
  };

  // auto start initialization
  if (opts.autoInit) {
    this.init();
  }

  /**
   * destroy component
   */
  this.destroy = function () {
    if (actions.init) {
      this.deselectAll();
      _removeEvents();
      _.forEach(elements.rows, function (row) {
        _removeRowAttr(row.element);
      });

      // remove elements
      elements.rows = [];
      elements.container = null;
      actions.init = false;
    }
  };

  /**
   * get all rows
   */
  this.getAll = function () {
    return elements.rows;
  };

  /**
   * get selected rows
   * @returns [array]
   */
  this.getSelected = function () {
    return elements.rows.filter(function (row) {
      return row.status;
    });
  };

  /**
   * get unselected rows
   * @returns [array]
   */
  this.getUnselected = function () {
    return elements.rows.filter(function (row) {
      return !row.status;
    });
  };

  /**
   * allow manual selection of rows in a range
   * @param start [int]
   * @param end [int]
   */
  this.selectRange = function (start, end) {
    for (var i = start < end ? start : end; i <= (start > end ? start : end); i++) {
      elements.rows[i]._setStatus(true);
    }
  };

  /**
   * allow manual deselection of rows in a range
   * @param start [int]
   * @param end [int]
   */
  this.deselectRange = function (start, end) {
    for (var i = start < end ? start : end; i <= (start > end ? start : end); i++) {
      elements.rows[i]._setStatus(false);
    }
  };

  /**
   * allow manual selection of rows
   * @param rows [array]
   */
  this.selectRows = function (rows) {
    _.forEach(rows, function (rowIndex) {
      elements.rows[rowIndex]._setStatus(true);
    });
  };

  /**
   * allow manual deselection of rows
   * @param rows [array]
   */
  this.deselectRows = function (rows) {
    _.forEach(rows, function (rowIndex) {
      elements.rows[rowIndex]._setStatus(false);
    });
  };

  /**
   * toggle range of rows
   * @param start [int]
   * @param end [int]
   */
  this.toggleRange = function (start, end) {
    for (var i = start < end ? start : end; i <= (start > end ? start : end); i++) {
      elements.rows[i]._setStatus(!elements.rows[i]._getStatus());
    }
  };

  /**
   * allow manual toggling of rows
   * @param rows [array]
   */
  this.toggleRows = function (rows) {
    _.forEach(rows, function (rowIndex) {
      elements.rows[rowIndex]._setStatus(!elements.rows[rowIndex]._getStatus());
    });
  };

  /**
   * deselect all rows
   */
  this.deselectAll = function () {
    _.forEach(elements.rows, function (row) {
      row._setStatus(false);
    });
  };

  /**
   * select all rows
   */
  this.selectAll = function () {
    _.forEach(elements.rows, function (row) {
      row._setStatus(true);
    });
  };

  /******************************************************
   * private methods */

  /**
   * get row array
   * creates object for each <TR> element in an array
   * @param el
   * @returns [array of objects]
   * @private
   */
  function _getRowArray(_x) {
    var _again = true;

    _function: while (_again) {
      var el = _x;
      count = rowArray = i = rowObject = undefined;
      _again = false;

      var count = 0,
          rowArray = [];
      // is element a <TR>?
      if (el.nodeName != "TR") {
        // if not loop through all child nodes
        for (var i = 0; i < el.childNodes.length; i++) {
          // is the element a <TBODY>?
          if (el.childNodes[i].nodeName == 'TBODY') {
            // grab the first <TBODY> and restart function
            elements.tbody = el.childNodes[i];
            _x = el.childNodes[i];
            _again = true;
            continue _function;

            // is the element a <TR>?
          } else if (el.childNodes[i].nodeName == 'TR') {
              // awesome - build the object and add it to the rowArray
              var rowObject = _addStatusMethods({
                index: count,
                element: el.childNodes[i]
              });
              // add row attribute to each row
              _setRowAttr(el.childNodes[i], rowObject.index);
              count++;
              rowArray.push(rowObject);
            }
        }
      }
      // return row array
      return rowArray;
    }
  }

  /**
   * build status methods into row object
   * @param row
   * @returns [object]
   * @private
   */
  function _addStatusMethods(row) {
    row.status = false;
    row._setStatus = function (_status, cb) {
      if (_status) {
        this.element.classList.add(opts.activeClass);
      } else {
        this.element.classList.remove(opts.activeClass);
      }
      this.status = _status;
      if (_.isFunction(cb)) cb(row);
    };
    row._getStatus = function () {
      return this.status;
    };
    return row;
  }

  /**
   * get row object
   * matches the table selection attribute index with
   * the row index
   * @param srcElement (event source)
   * @returns {int} index (null for empty)
   * @private
   */
  function _getRowObject(_x2) {
    var _again2 = true;

    _function2: while (_again2) {
      var srcElement = _x2;
      _again2 = false;

      if (srcElement.tagName == 'TR') {
        return elements.rows[parseInt(srcElement.getAttribute(ROW_ATTRIBUTE))];
      } else {
        if (!_.isNull(srcElement.parentElement)) {
          _x2 = srcElement.parentElement;
          _again2 = true;
          continue _function2;
        } else {
          return null;
        }
      }
    }
  }

  function _setRowAttr(rowEl, index) {
    rowEl.setAttribute(ROW_ATTRIBUTE, index);
  }

  function _removeRowAttr(rowEl) {
    rowEl.removeAttribute(ROW_ATTRIBUTE);
  }

  /**
   * check if active element is input/textarea
   * @returns {boolean}
   * @private
   */
  function _activeElementIsInput() {
    return (/input|textarea/g.test(document.activeElement ? document.activeElement.tagName.toLowerCase() : '')
    );
  }

  /**
   * set events
   * @private
   */
  function _setEvents() {
    // mouse down on container
    elements.container.addEventListener('mousedown', _mousedownHandler);
    window.addEventListener('keydown', _keydownHandler);
  }

  /**
   * remove events
   * @private
   */
  function _removeEvents() {
    elements.container.removeEventListener('mousedown', _mousedownHandler);
  }

  /******************************************************
   * event handlers */

  /**
   * mouse down handler
   * @param e event
   * @private
   */
  function _mousedownHandler(e) {
    var row = _getRowObject(e.target);

    // if shift is being pressed
    if (e.shiftKey && opts.shiftKey) {
      if (!_.isNull(actions.lastIndex)) {
        self.deselectAll();
        self.selectRange(actions.lastIndex, row.index);
      } else {
        self.deselectAll();
        self.selectRows([row.index]);
        actions.lastIndex = row.index;
      }
    } else if ((e.ctrlKey || e.metaKey) && opts.ctrlKey) {
      // if ctrl/cmd is being pressed
      self.toggleRows([row.index]);
      actions.lastIndex = row.index;
    } else {
      // if it's a single select
      self.deselectAll();
      self.selectRows([row.index]);
      actions.lastIndex = row.index;
    }
  }

  function _keydownHandler(e) {
    //don't selectAll if an input is focused
    //Ctrl|Cmd + A will trigger selectAll
    if (e.keyCode === 65 && (e.ctrlKey || e.metaKey) && !_activeElementIsInput()) {
      self.selectAll();
    }
  }
}