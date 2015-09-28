

/***********************************
 *
 * Table Selection Component
 *
 **********************************/

;
class tableSelection {
  constructor(tableElement, opts) {
    this.elements = {
      table: tableElement
    };
    this.init();
  }

  /**
   * initialize component
   */
  init() {
    this.elements.rows = this.buildRowObject(this.elements.table);
  }

  /**
   * destroy component
   */
  destroy() {

  }

  /**
   * allow manual selection of rows
   * either single or range
   * @param start
   * @param end
   */
  selectRows(start, end) {

  }

  /**
   * allow manual deselection of rows
   * either single or range
   * @param start
   * @param end
   */
  deselectRows(start, end) {

  }

  /**
   * allow manual toggling of rows
   * either single or range
   * @param start
   * @param end
   */
  toggleRows(start, end) {

  }

  /**********************************
   * private methods
   */

  buildRowObject(el) {
    console.log('here')
    console.log(el)
  }
}

class tsUtil {

}