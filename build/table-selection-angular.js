angular.module('tableSelection', [])

  .constant('tableSelectionConstants', {
    ROW_ATTRIBUTE: 'table-selection-index'
  })

  .service('tableSelectionSvc', function() {

    var currentScope = null;

    return {
      getCurrentScope: function () {
        return currentScope;
      },
      setCurrentScope: function (newScope) {
        currentScope = newScope;
      }
    }
  })

  .directive('tableSelection', function(tableSelectionConstants) {

    var tableSelectionCtrl = function($scope, $element) {

      var self = this,
        opts = {
          ctrlA: _.isBoolean($scope.ctrlA)?$scope.ctrlA:true,
          ctrlKey: _.isBoolean($scope.ctrlKey)?$scope.ctrlKey:true,
          shiftKey: _.isBoolean($scope.shiftKey)?$scope.shiftKey:true,
          activeClass: _.isString($scope.activeClass)?$scope.activeClass:'active',
          autoInit: _.isBoolean($scope.autoInit)?$scope.autoInit:true
        },
        actions = {
          init: false,
          lastIndex: null
        };
      $scope.rows = []

      window.addEventListener('keydown', _keydownHandler);

      /**
       * get all rows
       */
      this.getAll = function() {
        return $scope.rows;
      };

      /**
       * get selected rows
       * @returns [array]
       */
      this.getSelected = function() {
        return $scope.rows.filter(function(row) {
          return row.status;
        });
      };

      /**
       * get unselected rows
       * @returns [array]
       */
      this.getUnselected = function() {
        return $scope.rows.filter(function(row) {
          return !row.status;
        });
      };

      /**
       * allow manual selection of rows in a range
       * @param start [int]
       * @param end [int]
       */
      this.selectRange = function(start, end) {
        for (var i=(start<end?start:end);i<=(start>end?start:end);i++) {
          $scope.rows[i]._setStatus(true);
        }
      };

      /**
       * allow manual deselection of rows in a range
       * @param start [int]
       * @param end [int]
       */
      this.deselectRange = function(start, end) {
        for (var i=(start<end?start:end);i<=(start>end?start:end);i++) {
          $scope.rows[i]._setStatus(false);
        }
      };

      /**
       * allow manual selection of rows
       * @param rows [array]
       */
      this.selectRows = function(rows) {
        angular.forEach(rows, function(rowIndex) {
          $scope.rows[rowIndex]._setStatus(true);
        });
      };

      /**
       * allow manual deselection of rows
       * @param rows [array]
       */
      this.deselectRows = function(rows) {
        angular.forEach(rows, function(rowIndex) {
          $scope.rows[rowIndex]._setStatus(false);
        });
      };

      /**
       * toggle range of rows
       * @param start [int]
       * @param end [int]
       */
      this.toggleRange = function(start, end) {
        for (var i=(start<end?start:end);i<=(start>end?start:end);i++) {
          $scope.rows[i]._setStatus(!$scope.rows[i]._getStatus());
        }
      };

      /**
       * allow manual toggling of rows
       * @param rows [array]
       */
      this.toggleRows = function(rows) {
        angular.forEach(rows, function(rowIndex) {
          $scope.rows[rowIndex]._setStatus(!$scope.rows[rowIndex]._getStatus());
        });
      };

      /**
       * deselect all rows
       */
      this.deselectAll = function() {
        angular.forEach($scope.rows, function(row) {
          row._setStatus(false);
        });
      };

      /**
       * select all rows
       */
      this.selectAll = function() {
        angular.forEach($scope.rows, function(row) {
          row._setStatus(true);
        })
      };

      this.addRow = function(data, element, indexKey) {
        var rowObject = {
          key: data[indexKey],
          index: $scope.rows.length,
          data: data,
          element: element,
          status: false,
          _getStatus: function() {
            return this.value;
          },
          _setStatus: function(status) {
            this.value = status;
            if (status) {
              this.element.addClass(opts.activeClass);
            } else {
              this.element.removeClass(opts.activeClass);
            }
          },
          _toggleStatus: function() {
            this.value = !this.value;
          }
        };
        rowObject.element.on('mousedown', _mousedownHandler);
        $scope.rows[rowObject.index] = rowObject;
      };

      /**
       * check if active element is input/textarea
       * @returns {boolean}
       * @private
       */
      function _activeElementIsInput() {
        return /input|textarea/g.test(document.activeElement ? document.activeElement.tagName.toLowerCase() : '');
      }


      /******************************************************
       * event handlers */

      /**
       * mouse down handler
       * @param e event
       * @private
       */
      function _mousedownHandler(e) {
        var eventThis = this;
        var row = $scope.rows.filter(function(row) {
          return row.element[0].getAttribute(tableSelectionConstants.ROW_ATTRIBUTE) == eventThis.getAttribute(tableSelectionConstants.ROW_ATTRIBUTE);
        })[0];

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

      $scope.$on('$destroy', function() {
        window.removeEventListener('keydown', _keydownHandler)
      });
    };

    return {
      restrict: 'A',
      controller: tableSelectionCtrl
    }
  })

  .directive('tableSelectionRow', function(tableSelectionConstants) {

    var tableSelectionRowLink = function(scope, element, attrs, parentCtrl) {

      var opts = {
        indexKey: !_.isUndefined(attrs.indexKey)?attrs.indexKey:'id'
      };

      // we need to differentiate the rows from themselves when they're clicked
      // their ID is the best way to do this
      element[0].setAttribute(tableSelectionConstants.ROW_ATTRIBUTE, scope.row[opts.indexKey]);
      parentCtrl.addRow(scope.row, element, opts.indexKey);

      scope.$watch('row', function() {
        console.log('here')
      })
    };

    return {
      require: '^tableSelection',
      scope: {
        row: '=tableSelectionRow'
      },
      link: tableSelectionRowLink
    }
  });