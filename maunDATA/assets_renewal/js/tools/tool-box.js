// DRAW 'BOX' TOOL
(function ($) {
    $.fn.BBoxInit = function(settings) {
        return BoxToolJS.applyDrawTool($(this), settings);
    };
})(jQuery);

var BoxToolJS = (function() {
    var $ui_canvas;
    var uiContext;

    var dataSet = [];
    var drawingData = [];

    var selectCell = null;
    var selectionHandles = [];

    var cursorBlockSize = 8;
    var currentScale = 1;
    var times = 1;
    var zeropoint = {x:0, y:0};
    var zeroCursor = {x:0, y:0};

    var offsetX = 0;
    var offsetY = 0;

    var expectResize = -1;

    function ResizableBox() {
        this.idx = 0;
        this.x = 0;
        this.y = 0;
        this.width = 1;
        this.height = 1;
        this.fill = '';
        this.text = '';
        this.uuid = '';
    }
    ResizableBox.prototype = {
        draw: function() {
            if($.isEmpty(this.x) || $.isEmpty(this.y)) {
                return;
            }
            var scaleX = (this.x * currentScale) - ($ui_canvas.width / 2);
            var scaleY = (this.y - zeroCursor.y) * currentScale;
            var scaleW = this.width * currentScale;
            var scaleH = this.height * currentScale;

            // ResizeBox 스타일 지정
            uiContext.fillStyle = `${this.fill}00`;
            uiContext.font = '14px sans-serif';
            uiContext.fillRect(scaleX, scaleY, scaleW, scaleH);

            // Box 테두리
            // uiContext.strokeStyle = '#FFFFFF';
            uiContext.lineWidth = 1.5;
            uiContext.strokeStyle = this.fill;
            // uiContext.strokeStyle = this.fill;
            uiContext.listWidth = 5;
            uiContext.strokeRect(scaleX, scaleY, scaleW, scaleH);

            // 선택한 셀 highlight
            if(selectCell === this) {
                var half = cursorBlockSize / 2;

                // moving block
                selectionHandles[0].x = scaleX - half;
                selectionHandles[0].y = scaleY - half;
                selectionHandles[1].x = scaleX + (scaleW/2) - half;
                selectionHandles[1].y = scaleY - half;
                selectionHandles[2].x = scaleX + scaleW - half;
                selectionHandles[2].y = scaleY - half;
                selectionHandles[3].x = scaleX - half;
                selectionHandles[3].y = scaleY + (scaleH/2) - half;
                selectionHandles[4].x = scaleX + scaleW - half;
                selectionHandles[4].y = scaleY + (scaleH/2) - half;
                selectionHandles[5].x = scaleX - half;
                selectionHandles[5].y = scaleY + scaleH - half;
                selectionHandles[6].x = scaleX + (scaleW/2) - half;
                selectionHandles[6].y = scaleY + scaleH - half;
                selectionHandles[7].x = scaleX + scaleW - half;
                selectionHandles[7].y = scaleY + scaleH - half;

                // Resize Box Color
                uiContext.fillStyle = this.fill;
                // uiContext.strokeStyle = '#00000000';
                for (var i = 0; i < 8; i++) {
                    var cursor = selectionHandles[i];
                    uiContext.fillRect(cursor.x, cursor.y,cursorBlockSize, cursorBlockSize);
                    // uiContext.strokeRect(cursor.x, cursor.y,cursorBlockSize, cursorBlockSize);
                }
                // 박스가 선택될 시 박스 색상 채움 (main box)
                uiContext.fillStyle = this.cellfill;
                uiContext.font = '14px sans-serif';
                uiContext.fillRect(scaleX, scaleY, scaleW, scaleH);
            }
            if (this.text) {
                uiContext.strokeStyle = this.cellfill;
                var textX = scaleW > 0 ? scaleX : scaleX + scaleW;
                var textY = scaleH > 0 ? scaleY : scaleY + scaleH;
                uiContext.lineWidth = 1.5;
                uiContext.strokeText(this.text, textX, textY - 6);
                uiContext.fillStyle = '#ffffff';
                uiContext.fillText(this.text, textX, textY - 6);
            }
        }
    };

    function applyDrawTool(canvas, settings) {
        init(canvas, settings);
        function init(canvas, settings) {
            if(!$.isEmptyObject(canvas)) {
                $ui_canvas = canvas.get(0);
                uiContext = settings.drawingContext;
                currentScale = settings.currentScale * settings.times;
                times = settings.times;
                zeropoint = settings.zeropoint;
                zeroCursor = settings.zeroCursor;
            } else {
                $.alert("BBox를 그릴 캔버스가 없습니다.");
            }
            for(var i=0; i<8; i++) {
                var resizeBox = new ResizableBox;
                selectionHandles.push(resizeBox);
            }
        }

        // 전체 Unit 드로잉
        function draw(data, scale) {
            drawingData = data;
            currentScale = scale;
            $.each(drawingData, function(i,v) {
                boxing(v);
            });
        }
        // Data로 Unit 하나를 그린다
        function boxing(v, bSelectCell) {
            var itemBox = new ResizableBox();
            itemBox.idx = v.idx;
            itemBox.x = v.Box.x;
            itemBox.y = v.Box.y;
            itemBox.width = v.Box.w;
            itemBox.height = v.Box.h;
            itemBox.text = v.category_name;
            itemBox.ctg = v.category_id;
            itemBox.fill = v.color;
            itemBox.uuid = v.uuid;
            if(bSelectCell) {
                itemBox.cellfill = v.color+"30";
                selectCell = itemBox;
            }
            itemBox.draw();
        }
        // 선택된 Unit의 실시간 Update
        function drawing(boxinfo) {
            var drawBox = {Box:{}};
            drawBox.Box.x = (boxinfo.Box.x / currentScale);
            drawBox.Box.y = (boxinfo.Box.y / currentScale);
            drawBox.Box.w = boxinfo.Box.w / currentScale;
            drawBox.Box.h = boxinfo.Box.h / currentScale;
            drawBox.category_name = boxinfo.category_name;
            drawBox.category_id = boxinfo.category_id;
            drawBox.color = boxinfo.color;
            // 기존꺼 그리고
            $.each(drawingData, function(i,v) {
                boxing(v);
            });
            // 내꺼도 그리고
            boxing(drawBox);
        }
        function moveObject(pos) {
            var rtnBox = null;
            if(selectCell != null) {
                var scaleCursorX = pos.x / currentScale;
                var scaleCursorY = pos.y / currentScale;

                if(expectResize >= 0) {
                    // 크기 조정
                    selectCell = resizeBox(pos);
                    $.each(drawingData, function(i, v) {
                        if(selectCell.uuid == v.uuid) {
                            v.Box.x = selectCell.x;// - offsetX;
                            v.Box.y = selectCell.y;// - offsetY;
                            v.Box.w = selectCell.width;
                            v.Box.h = selectCell.height;
                            rtnBox = v;
                        }
                    });
                } else {
                    // 이동
                    $.each(drawingData, function(i, v) {
                        if(selectCell.uuid == v.uuid) {
                            v.Box.x = scaleCursorX - offsetX;
                            v.Box.y = scaleCursorY - offsetY;
                            rtnBox = v;
                        }
                    });
                }
                draw(drawingData, currentScale);
            }
            return rtnBox;
        }
        function resizeBox(pos) {
            if(selectCell != null) {
                var scaleCursorX = pos.x / currentScale;
                var scaleCursorY = pos.y / currentScale;

                var oldx = selectCell.x;
                var oldy = selectCell.y;

                var MINIMUM_SIZE = 10;
                switch (expectResize) {
                    case 0:
                        // if(scaleCursorX+MINIMUM_SIZE > $ui_canvas.width) break;
                        // if(scaleCursorY+MINIMUM_SIZE > $ui_canvas.height) break;
                        if(scaleCursorX < 0) scaleCursorX = 0;
                        if(scaleCursorY < 0) scaleCursorY = 0;
                        selectCell.x = selectCell.width >= MINIMUM_SIZE ? scaleCursorX : selectCell.x;
                        selectCell.width += oldx - scaleCursorX;
                        selectCell.y = selectCell.height >= MINIMUM_SIZE ? scaleCursorY : selectCell.y;
                        selectCell.height += oldy - scaleCursorY;
                        break;
                    case 1:
                        // if(scaleCursorY+MINIMUM_SIZE > $ui_canvas.height) break;
                        if(scaleCursorY < 0) scaleCursorY = 0;
                        selectCell.y = selectCell.height >= MINIMUM_SIZE ? scaleCursorY : selectCell.y;
                        selectCell.height += oldy - scaleCursorY;
                        break;
                    case 2:
                        // if(scaleCursorY+MINIMUM_SIZE > $ui_canvas.height) break;
                        // if(scaleCursorX > $ui_canvas.width) scaleCursorX = $ui_canvas.width;
                        if(scaleCursorY < 0) scaleCursorY = 0;
                        selectCell.y = selectCell.height >= MINIMUM_SIZE ? scaleCursorY : selectCell.y;
                        selectCell.width = scaleCursorX - oldx;
                        selectCell.height += oldy - scaleCursorY;
                        break;
                    case 3:
                        // if(scaleCursorX+MINIMUM_SIZE > $ui_canvas.width) break;
                        if(scaleCursorX < 0) scaleCursorX = 0;
                        selectCell.x = selectCell.width >= MINIMUM_SIZE ? scaleCursorX : selectCell.x;
                        selectCell.width += oldx - scaleCursorX;
                        break;
                    case 4:
                        // if(scaleCursorX > $ui_canvas.width) scaleCursorX = $ui_canvas.width;
                        selectCell.width = scaleCursorX - oldx;
                        break;
                    case 5:
                        // if(scaleCursorX+MINIMUM_SIZE > $ui_canvas.width) break;
                        if(scaleCursorX < 0) scaleCursorX = 0;
                        // if(scaleCursorY > $ui_canvas.height) scaleCursorY = $ui_canvas.height;
                        selectCell.x = selectCell.width >= MINIMUM_SIZE ? scaleCursorX : selectCell.x;
                        selectCell.width += oldx - scaleCursorX;
                        selectCell.height = scaleCursorY - oldy;
                        break;
                    case 6:
                        // if(scaleCursorY > $ui_canvas.height) scaleCursorY = $ui_canvas.height;
                        selectCell.height = scaleCursorY - oldy;
                        break;
                    case 7:
                        // if(scaleCursorX > $ui_canvas.width) scaleCursorX = $ui_canvas.width;
                        // if(scaleCursorY > $ui_canvas.height) scaleCursorY = $ui_canvas.height;
                        selectCell.width = scaleCursorX - oldx;
                        selectCell.height = scaleCursorY - oldy;
                        break;
                    default:
                        break;
                }
                if(selectCell.width < MINIMUM_SIZE) {
                    selectCell.width = MINIMUM_SIZE;
                }
                if(selectCell.height < MINIMUM_SIZE) {
                    selectCell.height = MINIMUM_SIZE;
                }
                return selectCell;
            }
        }
        function syncUnit(position) {
            var uuid = null;
            selectCell = null;
            var onceSelect = false;
            $.each(drawingData, function(i,v) {
                var box = v.Box;
                var scaleX = position.x / currentScale;
                var scaleY = position.y / currentScale;

                var bSelectCell = false;
                var pixcelAdv = 5;  // 선택이 유연하도록 5px씩 여유를 준다
                if (!onceSelect && box.x <= scaleX +pixcelAdv && box.x + box.w >= scaleX -pixcelAdv
                    && box.y <= scaleY +pixcelAdv && box.y + box.h >= scaleY -pixcelAdv) {
                    // selected box
                    onceSelect = true;
                    bSelectCell = true;
                    uuid = v.uuid;

                    offsetX = scaleX - v.Box.x;
                    offsetY = scaleY - v.Box.y;
                } else {
                    bSelectCell = false;
                }
                boxing(v, bSelectCell);
            });
            return uuid;
        }
        function syncUnitToDraw(uuid) {
            selectCell = null;
            var onceSelect = false;
            $.each(drawingData, function(i,v) {
                var bSelectCell = false;
                if (uuid == v.uuid) {
                    // selected box
                    onceSelect = true;
                    bSelectCell = true;
                    selectCell = v;
                } else {
                    bSelectCell = false;
                }
                boxing(v, bSelectCell);
            });
        }
        function clearBbox(uuid) {
            var nIndex = 0;
            drawingData.forEach(item => {
                if(item.uuid == uuid) {
                    drawingData.splice(nIndex, 1);
                }
            });
        }
        function appendData(unitInfo) {
            unitInfo.Box.x = (unitInfo.Box.x / currentScale);
            unitInfo.Box.y = (unitInfo.Box.y / currentScale);
            unitInfo.Box.w = unitInfo.Box.w / currentScale;
            unitInfo.Box.h = unitInfo.Box.h / currentScale;

            drawingData.push(unitInfo);
        }
        // Annotation 한 내용을 데이터로 변환할 때 호출
        function getData($this) {
            return drawToSaveData();
        }
        function drawToSaveData() {
            // convert drawingData to dataSet
            return drawingData;
        }
        function cloneNewDrawData(pos, content) {
            let workingDataSet = {};
            workingDataSet.idx = null;
            workingDataSet.contextId = null;
            workingDataSet.uuid = $.genUuid();

            workingDataSet.Box = {};
            workingDataSet.Box.x = pos.x;
            workingDataSet.Box.y = pos.y;
            workingDataSet.Box.w = 0;
            workingDataSet.Box.h = 0;
            workingDataSet.Segmentation = null;
            workingDataSet.category_id = content.category_id;
            workingDataSet.category_name = content.category_name;

            return workingDataSet;
        }
        function cursor(pos, mouse) {
            if(selectCell != null) {
                pos.x = pos.x / currentScale;
                pos.y = pos.y / currentScale;
                for(var i=0; i<8; i++) {
                    var cur = selectionHandles[i];

                    var scaleCursorX = (pos.x * currentScale) - ($ui_canvas.width / 2);
                    var scaleCursorY = (pos.y - zeroCursor.y) * currentScale;

                    if (scaleCursorX >= cur.x && scaleCursorX <= cur.x + (cursorBlockSize) &&
                        scaleCursorY >= cur.y && scaleCursorY <= cur.y + (cursorBlockSize)) {
                        expectResize = i;
                        switch (i) {
                            case 0:
                                mouse.style.cursor = 'nw-resize';
                                break;
                            case 1:
                                mouse.style.cursor = 'n-resize';
                                break;
                            case 2:
                                mouse.style.cursor = 'ne-resize';
                                break;
                            case 3:
                                mouse.style.cursor = 'w-resize';
                                break;
                            case 4:
                                mouse.style.cursor = 'e-resize';
                                break;
                            case 5:
                                mouse.style.cursor = 'sw-resize';
                                break;
                            case 6:
                                mouse.style.cursor = 's-resize';
                                break;
                            case 7:
                                mouse.style.cursor = 'se-resize';
                                break;
                        }
                        return;
                    }
                    // expectResize = -1;
                    mouse.style.cursor='auto';
                }
            }
        }
        return {
            init: init,
            draw: draw,
            drawing: drawing,
            moveObject: moveObject,
            resizeBox: resizeBox,
            appendData: appendData,
            // clearBbox: clearBbox,
            getData: getData,
            syncUnit: syncUnit,
            syncUnitToDraw: syncUnitToDraw,
            cursor: cursor
        }
    }

    return {
        applyDrawTool: applyDrawTool
    }
})();