

/***********************************
 *
 * Table Selection Component
 *
 **********************************/

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

;

var tableSelection = (function () {
  function tableSelection(tableElement, opts) {
    _classCallCheck(this, tableSelection);

    this.elements = {
      table: tableElement
    };
    this.init();
  }

  /**
   * initialize component
   */

  _createClass(tableSelection, [{
    key: 'init',
    value: function init() {
      this.elements.rows = this.buildRowObject(this.elements.table);
    }

    /**
     * destroy component
     */
  }, {
    key: 'destroy',
    value: function destroy() {}

    /**
     * allow manual selection of rows
     * either single or range
     * @param start
     * @param end
     */
  }, {
    key: 'selectRows',
    value: function selectRows(start, end) {}

    /**
     * allow manual deselection of rows
     * either single or range
     * @param start
     * @param end
     */
  }, {
    key: 'deselectRows',
    value: function deselectRows(start, end) {}

    /**
     * allow manual toggling of rows
     * either single or range
     * @param start
     * @param end
     */
  }, {
    key: 'toggleRows',
    value: function toggleRows(start, end) {}

    /**********************************
     * private methods
     */

  }, {
    key: 'buildRowObject',
    value: function buildRowObject(el) {
      console.log('here');
      console.log(el);
    }
  }]);

  return tableSelection;
})();

var tsUtil = function tsUtil() {
  _classCallCheck(this, tsUtil);
};