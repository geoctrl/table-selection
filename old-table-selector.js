var MOD = 'tableSelector';

// this module only works on the <tbody> level of the table

angular.module(MOD, [])

  .service('tableSelectorSvc', function() {
    var currentScope = '';
    return {
      deselectOthers: function(newScope) {
        if (currentScope != newScope) {
          if (!_.isEmpty(currentScope.items)) {
            currentScope.deselectAll();
          }
          currentScope = newScope;
        }
      },
      clearScope: function() {
        currentScope = '';
      }
    }
  })

  .directive('tableSelector', function() {

    var tableSelectorCtrl = function($scope, $element, $compile, $document, $window, tableSelectorSvc) {

      var dragBox = null,
        moveHandler,
        parentScroll = $document[0].querySelector(`.${$scope.parentScroll}`),
        winNode = angular.element($window)[0],
        body = angular.element($document[0].body),
        tableHeight = $element[0].offsetHeight,
        tableTop = $element[0].getBoundingClientRect().top,
        allItems = [],
        selectionHistory = {
          current: null,
          last: null
        },
        selectionKeys = {
          ctrl: false,
          shift: false
        },
        dragCoors = {
          x: null,
          y: null
        },
        lastDragCoors = {
          x: null,
          y: null
        },
        event = {
          drag: false,
          down: false,
          up: false,
          scrollOffset: 0,
          scrollOffsetOrigin: null,
          dragStart: null
        };



      winNode.addEventListener('mousedown', mouseDownEvent);
      winNode.addEventListener('mouseup', mouseUpEvent);
      winNode.addEventListener('keydown', keyDownEvent);

      /**
       * gets the tag name of the document element that has focus
       * @return {String}
       */
      function getActiveElementTag() {
        return document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      }

      /**
       * tests if the active element is a user input field like input, textarea, etc.
       * @return {Boolean}
       */
      function activeElementIsInput() {
        return /input|textarea/g.test(getActiveElementTag());
      }

      function keyDownEvent(e) {
        //don't selectAll if an input is focused
        //Ctrl|Cmd + A will trigger selectAll
        if (e.keyCode === 65 && (e.ctrlKey || e.metaKey) && !activeElementIsInput()) {
          selectAll();
        }
      }

      function mouseDownEvent(e) {
        if (bubbleParent(e.srcElement)) {
          moveHandler = _.throttle(mouseMoveEvent);
          winNode.addEventListener('mousemove', moveHandler, 50);
          parentScroll.addEventListener('scroll', parentScrollEvent);
          tableTop = $element[0].getBoundingClientRect().top;
          event.down = true;
          event.up = false;
          tableSelectorSvc.deselectOthers($scope);
          if (_.isNull(event.scrollOffsetOrigin)) {
            event.scrollOffsetOrigin = -Math.abs(parentScroll.scrollTop);
          }
          controlClick(e);
          createDragBox();
        }
      }

      function mouseMoveEvent(e) {
        if (_.isNull(dragCoors.x) && event.down) {
          dragCoors.x = e.clientX;
          dragCoors.y = e.clientY;
        }
        lastDragCoors.x = e.clientX;
        lastDragCoors.y = e.clientY;
        if (!_.isNull(dragBox)) {
          updateDragBox(e);
        }

        // drag/selection
        dragSelection();
      }

      function selectAll() {
        angular.forEach(allItems, function(item, key) {
          item.element.addClass('active');
          $scope.items[key].selected = true;
        });
        apply();
      }

      function dragSelection() {
        if (event.down && minDistance(lastDragCoors.x, lastDragCoors.y)) {
          var offset = 0,
            offsetNumber = 0;
          angular.forEach(allItems, function(item, key) {
            var itemHeight = item.element[0].offsetHeight;
            // item variables
            if (item.file.removed) {
              offset++;
            }
            offsetNumber = item.index - offset;
            var itemTop = tableTop + (offsetNumber*itemHeight),
              itemBottom = itemTop + itemHeight;

            // get small/large of the drag coors
            var smInt, lgInt;
            if (lastDragCoors.y > dragCoors.y) {
              lgInt = lastDragCoors.y;
              smInt = dragCoors.y;
            } else {
              lgInt = dragCoors.y - event.scrollOffset;
              smInt = lastDragCoors.y;
            }

            // if the items are within the sm/lg boundaries, activate
            if (itemTop < lgInt && itemBottom > smInt) {
              if (event.dragStart != item.index) {
                item.element.addClass('active');
                item.select = 'drag';
                $scope.items[key].selected = true;
              }
            } else {
              if (item.select == 'drag') {
                item.element.removeClass('active');
                $scope.items[key].selected = false;
              }
            }
          });
          apply();
        }
      }

      /**
       * mouse up event
       * clears variables,
       * @param e
       */
      function mouseUpEvent(e) {
        if (event.down) {
          event.drag = false;
          event.down = false;
          event.up = true;
          event.scrollOffset = 0;
          event.scrollOffsetOrigin = null;
          event.dragStart = null;
          clearCoors();
          removeDragBox();
          winNode.removeEventListener('mousemove', moveHandler, 50);
          parentScroll.removeEventListener('scroll', parentScrollEvent);
        }
      }

      function createDragBox() {
        dragBox = angular.element('<div class="table-selector__drag-box"></div>');
        $compile(dragBox)($scope);
        body.append(dragBox);
      }

      function parentScrollEvent(e) {
        event.scrollOffset = parentScroll.scrollTop+event.scrollOffsetOrigin;
        tableTop = $element[0].getBoundingClientRect().top;
        updateDragBox();
      }

      function updateDragBox() {
        if (minDistance(lastDragCoors.x, lastDragCoors.y)) {
          if (lastDragCoors.x-dragCoors.x < 0) {
            dragBox[0].style.left = lastDragCoors.x + 'px';
            dragBox[0].style.width = dragCoors.x - lastDragCoors.x + 'px';
          } else {
            dragBox[0].style.left = dragCoors.x + 'px';
            dragBox[0].style.width = lastDragCoors.x - dragCoors.x + 'px';
          }
          if (lastDragCoors.y-dragCoors.y < 0 - event.scrollOffset) {
            dragBox[0].style.top = lastDragCoors.y + 'px';
            dragBox[0].style.height = dragCoors.y - lastDragCoors.y - event.scrollOffset  + 'px';
          } else {
            dragBox[0].style.height = lastDragCoors.y - dragCoors.y + event.scrollOffset + 'px';
            dragBox[0].style.top = dragCoors.y - event.scrollOffset + 'px';
          }
        }
      }

      function removeDragBox() {
        dragBox.remove();
        dragBox = null;
      }

      function clearCoors() {
        dragCoors = {
          x: null,
          y: null
        };
        lastDragCoors = {
          x: null,
          y: null
        };
      }

      function minDistance(x,y) {
        var xDistance = x-dragCoors.x>=0?x-dragCoors.x:(x-dragCoors.x)*(-1),
          yDistance = y-dragCoors.y>=0?y-dragCoors.y:(y-dragCoors.y)*(-1);
        return xDistance > 10 || yDistance > 10;
      }

      /**
       * bubble parent
       * check to see if any of the element's parents match the directive element
       * @param element
       * @returns {boolean}
       */
      function bubbleParent(element) {
        if (element == $element[0]) {
          return true;
        } else {
          if (!_.isNull(element.parentElement)) {
            return bubbleParent(element.parentElement);
          } else {
            return false;
          }
        }
      }

      /**
       * control what happens on click
       * @param e (event)
       */
      function controlClick(e) {
        // get row by index on parent TR
        var row = getRowObject(e.srcElement);

        // apply current click
        selectionHistory.current = row.index;

        // set dragging index
        if (_.isNull(event.dragStart)) {
          event.dragStart = row.index;
        }

        // keyboard functionality
        if (e.ctrlKey) {
          ctrlSelect(row);
        }
        else if (e.shiftKey) {
          shiftSelect(row);
        } else {
          singleSelect(row);
        }
        // changes need to be applied manually
        apply();
      }

      /**
       * select row pressing CTRL
       * @param row
       */
      function ctrlSelect(row) {
        if (row.element.hasClass('active')) {
          row.element.removeClass('active');
          $scope.items[row.index].selected = false;
        } else {
          row.element.addClass('active');
          $scope.items[row.index].selected = true;
        }
        selectionHistory.last = row.index;
      }

      /**
       * select row pressing SHIFT
       * @param row
       */
      function shiftSelect(row) {
        if (!_.isNull(selectionHistory.last) && selectionHistory.last != selectionHistory.current) {
          var smIn, lgIn;
          if (selectionHistory.last > selectionHistory.current) {
            smIn = selectionHistory.current;
            lgIn = selectionHistory.last;
          } else {
            smIn = selectionHistory.last;
            lgIn = selectionHistory.current;
          }
          angular.forEach(allItems, function(item, key) {
            if (item.index >= smIn && item.index <= lgIn) {
              item.element.addClass('active');
              $scope.items[key].selected = true;
              item.select = 'shift';
            } else if (item.select == 'shift') {
              item.element.removeClass('active');
              $scope.items[key].selected = false;
            }
          });
        } else {
          selectionHistory.last = row.index;
        }
      }

      function singleSelect(row) {
        angular.forEach(allItems, function(item, key) {
          if (item.index != row.index) {
            item.element.removeClass('active');
            item.select = 'ctrl';
            $scope.items[key].selected = false;
          } else {
            item.element.addClass('active');
            $scope.items[key].selected = true;
          }
        });
        selectionHistory.last = row.index;
      }



      var apply = _.debounce(function() {
        $scope.$apply();
        if($scope.onSelect) {
          //pass an array of selected items
          //have to pass in an object because of ugly angular APIs
          $scope.onSelect({ selectedItems: $scope.items.filter(item => item.selected) });
          $scope.$apply();
        }
      }, 200);

      /**
       * get row object
       * pass in the event 'src' element, and returns the
       * item object
       * @param srcElement
       * @returns elementObject{element, file, index}
       */
      function getRowObject(srcElement) {
        if (srcElement.tagName == 'TR') {
          return allItems[parseInt(srcElement.getAttribute('indexId'))];
        } else {
          if (!_.isNull(srcElement.parentElement)) {
            return getRowObject(srcElement.parentElement);
          } else {
            return false;
          }
        }
      }

      this.addItem = function(element, file, index) {
        allItems[index] = {
          element: element,
          file: file,
          index: index
        };
        // update table height
        tableHeight = $element[0].offsetHeight;
      };

      this.updateFile = function(file, index) {
        allItems[index].file = file;
      };

      $scope.deselectAll = function() {
        angular.forEach(allItems, function(item, key) {
          item.element.removeClass('active');
          $scope.items[key].selected = false;
        });
        apply();
      };

      $scope.$on('$destroy', function() {
        winNode.removeEventListener('mousedown', mouseDownEvent);
        winNode.removeEventListener('mousemove', moveHandler);
        winNode.removeEventListener('mouseup', mouseUpEvent);
        parentScroll.removeEventListener('scroll', parentScrollEvent);
        winNode.removeEventListener('keydown', keyDownEvent);
      });

    };

    return {
      restrict: 'A',
      scope: {
        items: '=',
        parentScroll: '@',
        onSelect: '&'
      },
      controller: tableSelectorCtrl
    };
  })

  .directive('selectItem', function() {
    var selectItemLink = function(scope, element, attrs, parentCtrl) {
      parentCtrl.addItem(element, scope.file, scope.index);
      element.attr('indexId', scope.index);

      scope.$watch('file', function(newVal) {
        parentCtrl.updateFile(newVal, scope.index);
      });
    };

    return {
      require: '^tableSelector',
      scope: {
        index: '=',
        file: '=selectItem'
      },
      link: selectItemLink
    };
  });


export default MOD;
