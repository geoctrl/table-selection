'use strict';

;
/***********************************
 *
 * Table Selection Component
 *
 **********************************/

function TableSelection(_table, _opts) {

  var self = this,
      opts = {
    ctrlA: _.isBoolean(_opts.ctrlA) ? _opts.ctrlA : true,
    ctrlKey: _.isBoolean(_opts.ctrlKey) ? _opts.ctrlKey : true,
    shiftKey: _.isBoolean(_opts.shiftKey) ? _opts.shiftKey : true,
    activeClass: _.isString(_opts.activeClass) ? _opts.activeClass : 'active'
  },
      elements = {
    table: _table
  },
      actions = {
    lastIndex: null
  };

  /**
   * initialize component
   */
  this.init = function () {
    elements.rows = _getRowArray(elements.table);
    _setEvents(elements.rows);
  };

  this.init();

  /**
   * destroy component
   */
  this.destroy = function () {};

  /**
   * get selected rows
   * @returns [array]
   */
  this.getSelected = function () {
    return _.filter(elements.rows, 'status');
  };

  /**
   * get unselected rows
   * @returns [array]
   */
  this.getUnselected = function () {};

  /**
   * allow manual selection of rows in a range
   * @param start [int]
   * @param end [int]
   */
  this.selectRange = function (start, end) {};

  /**
   * allow manual deselection of rows in a range
   * @param start [int]
   * @param end [int]
   */
  this.deselectRange = function (start, end) {};

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
  this.deselectRows = function (rows) {};

  /**
   * toggle range of rows
   * @param start [int]
   * @param end [int]
   */
  this.toggleRange = function (start, end) {};

  /**
   * allow manual toggling of rows
   * either single or range
   * @param rows [array]
   */
  this.toggleRows = function (rows) {};

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
      if (el.nodeName != "TR") {
        for (var i = 0; i < el.childNodes.length; i++) {
          if (el.childNodes[i].nodeName == 'TBODY') {
            elements.tbody = el.childNodes[i];
            _x = el.childNodes[i];
            _again = true;
            continue _function;
          } else if (el.childNodes[i].nodeName == 'TR') {
            var rowObject = _buildRowObject({
              index: count,
              element: el.childNodes[i]
            });
            count++;
            rowArray.push(rowObject);
          }
        }
      }
      return rowArray;
    }
  }

  function _buildRowObject(row) {
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
    row.element.setAttribute('table-selection-index', row.index);
    return row;
  }

  function _mousedownHandler(e) {
    var row = _getRowObject(e.target);

    // if shift is being pressed
    if (e.shiftKey && opts.shiftKey) {

      // if ctrl is being pressed
    } else if (e.ctrlKey && opts.ctrlKey) {
        // single click
      } else {
          self.deselectAll();
          self.selectRows([row.index]);
        }
  }

  function _getRowObject(_x2) {
    var _again2 = true;

    _function2: while (_again2) {
      var srcElement = _x2;
      _again2 = false;

      if (srcElement.tagName == 'TR') {
        return elements.rows[parseInt(srcElement.getAttribute('table-selection-index'))];
      } else {
        if (!_.isNull(srcElement.parentElement)) {
          _x2 = srcElement.parentElement;
          _again2 = true;
          continue _function2;
        } else {
          return false;
        }
      }
    }
  }

  function _setEvents(el) {
    // mouse down on container
    (_.isElement(elements.tbody) ? elements.tbody : elements.table).addEventListener('mousedown', _mousedownHandler);
  }
}