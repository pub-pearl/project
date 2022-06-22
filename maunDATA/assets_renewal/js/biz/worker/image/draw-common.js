(function ($) {
    $.fn.regDrawingUx = function(setting) {
        return new CanvasUI.CreateUiHandler($(this), setting);
    }
})(jQuery);

var CanvasUI = (function() {
    var sourceImage;
    var sourceImage;
    // ABOUT UI
    var $ui_image_area;
    var $ui_image;

    var ui_drawing_canvas;
    var ui_draw_guide_canvas;

    var $ui_drawing_canvas;
    var $ui_draw_guide_canvas;

    // Draw Tool
    var uiContextDrawing;
    var uiContextGuide;

    var currentDrawMode = null;

    var currentMoveMode = false;
    var moveTick = false;           // 우클릭 후 이동했는지 여부를 체크하기 위한 Flag

    // scale
    var currentScale = 1;
    var zoomDelta = 0.1;        // 1줌당 변화량 (단위 scale)
    var globalTimes = 1;

    // moving
    var startX = 0, startY = 0, isMove = false;
    var moveXTemp = 0, moveYTemp = 0;
    var movedX = 0, movedY = 0;

    var initialCanvasWidth = 0;
    var initialCanvasHeight = 0;

    var $TOOLS = new Map();
    var toolname = {
        B : "BBox", S : "Segment"
    };

    var isEditableMode = true;

    function CreateUiHandler($mP, settings) {
        var that = this;
        if(settings != null) {
            that._strokeColor = settings.strokeColor || '#FFCC01';
            that._checkPoint = settings.checkPoint[0];
            that._dragEventCallback = settings.checkPoint[1];
            that._endPoint = settings.checkPoint[2];
            that._leftUiPadding = settings.leftPadding;
            that._bottomUiPadding = settings.bottomPadding;
            that._useTool = settings._useTool;
            that._userMode = settings.userMode;
        }
        init();
        function init() {
            // 그리기 작업공간을 세팅한다.
            $ui_image_area = $mP.find("div.imgArea");
            // Canvas를 준비한다.
            ui_drawing_canvas = $mP.find("canvas#dataSourceCanvas") ? $mP.find("canvas#dataSourceCanvas").get(0) : null;
            ui_draw_guide_canvas = $mP.find("canvas#dataSourceCanvas2") ? $mP.find("canvas#dataSourceCanvas2").get(0) : null;
            // Canvas jQuery객체화
            $ui_drawing_canvas = $(ui_drawing_canvas);
            $ui_draw_guide_canvas = $(ui_draw_guide_canvas);

            // UI에 가려지지 않도록 이미지 로딩 초기사이즈를 조절한다
            initialCanvasWidth = $ui_image_area.get(0).offsetWidth - that._leftUiPadding;
            initialCanvasHeight = $ui_image_area.get(0).offsetHeight - that._bottomUiPadding;

            // Resource를 그리고, Canvas EventHandler를 binding한다.
            if(!$.isEmptyObject($ui_drawing_canvas)) {
                $ui_image = $mP.find("img#dataSource"); // for controlling image tag
                $ui_image.one("load", bindEventHandler);
            }
        }
        function loadingTools() {
            var toolSetting = {
                drawingContext : uiContextDrawing,
                times : globalTimes,
                currentScale : currentScale,
                zeropoint : {x:ui_drawing_canvas.width/2,y:ui_drawing_canvas.height/2},
                zeroCursor : {x:(sourceImage.naturalWidth/2),y:(sourceImage.naturalHeight/2)}
            };
            $TOOLS.set("BBox", $ui_drawing_canvas.BBoxInit(toolSetting));
            $TOOLS.set("Segment", $ui_drawing_canvas.SegmentationInit(toolSetting));
            return $TOOLS;
        }
        // 이미지가 불러와 지면 Canvas 동작을 시작하도록.. 굳이? 싶지만
        function bindEventHandler() {
            sourceImage = $(this).get(0);
            // sizing canvas
            ui_draw_guide_canvas.width = ui_drawing_canvas.width = $ui_image_area.get(0).offsetWidth;   //initialCanvasWidth;//
            ui_draw_guide_canvas.height = ui_drawing_canvas.height = $ui_image_area.get(0).offsetHeight;    //initialCanvasHeight;//

            $ui_draw_guide_canvas.one("mousewheel", zoomControl);

            // $ui_draw_guide_canvas.one("mousedown", startDrawing);
            $ui_draw_guide_canvas.one("mousedown", drawByClick);
            $ui_draw_guide_canvas.one("mouseup", endDrawing);
            // $ui_draw_guide_canvas.one("contextmenu", function(event) {
            //     event.preventDefault();
            // });
            $ui_draw_guide_canvas.contextHandler(function(menuId) {
                console.log("선택한 context menu에 대한 동작 실행", menuId);
            });

            $ui_draw_guide_canvas.one("mousemove", mouseMoving);
            // $ui_draw_guide_canvas.one("dblclick", contextMenu);

            setUiContext();
            mirrorResourceToCanvas();
            // 사용할 그리기 도구를 불러온다
            loadingTools();
        }
        // CANVAS CONTEXT 초기화
        function setUiContext() {
            var fontColor = "#FFFFFF";
            var fontFamily = "bold 14px Calibri";

            uiContextDrawing = ui_drawing_canvas.getContext('2d');
            uiContextDrawing.translate(ui_drawing_canvas.width/2, ui_drawing_canvas.height/2);
            uiContextDrawing.strokeStyle = that._strokeColor;
            uiContextDrawing.fillStyle = that._strokeColor+"20";
            uiContextDrawing.fontColor = fontColor;
            uiContextDrawing.font = fontFamily;

            uiContextGuide = ui_draw_guide_canvas.getContext('2d');
            uiContextGuide.translate(ui_draw_guide_canvas.width/2, ui_draw_guide_canvas.height/2);
            uiContextGuide.strokeStyle = that._strokeColor;
            uiContextGuide.fillStyle = that._strokeColor+"20";
            uiContextGuide.font = fontFamily;

            // resetVariable();
            moveXTemp = moveYTemp = 0;
            currentScale = 1;
        }
        // 리소스 이미지를 CANVAS에 미러링한다.
        function mirrorResourceToCanvas() {
            var times = initialCanvasWidth / sourceImage.naturalWidth;
            globalTimes = times;
            uiContextDrawing.drawImage(
                sourceImage,
                -ui_drawing_canvas.width / 2,       //-(sourceImage.naturalWidth * globalTimes * currentScale) / 2,
                // -ui_drawing_canvas.height / 2 + (sourceImage.naturalHeight * globalTimes * currentScale / 2),
                -(sourceImage.naturalHeight * globalTimes * currentScale) / 2,
                sourceImage.naturalWidth * globalTimes * currentScale,	// 캔버스 위에 그려질 이미지의 넓이
                sourceImage.naturalHeight * globalTimes * currentScale	// 캔버스 위에 그려질 이미지의 높이
            );
        }
        // 현재 비율로 리소스 이미지를 Refresh한다.
        function redrawResourceToCanvas() {
            uiContextDrawing.drawImage(
                sourceImage,
                -ui_drawing_canvas.width / 2,       //-(sourceImage.naturalWidth * globalTimes * currentScale) / 2,
                // -ui_drawing_canvas.height / 2 + (sourceImage.naturalHeight * globalTimes * currentScale / 2),
                -(sourceImage.naturalHeight * globalTimes * currentScale) / 2,
                sourceImage.naturalWidth * globalTimes * currentScale,	// 캔버스 위에 그려질 이미지의 넓이
                sourceImage.naturalHeight * globalTimes * currentScale	// 캔버스 위에 그려질 이미지의 높이
            );
        }

        function zoomControl(event) {
            event.originalEvent.wheelDelta > 0 ? zoomIn() : zoomOut();
            event.preventDefault();
        }
        function zoomIn(event) {
            var scale = currentScale + zoomDelta;
            if(scale < 3.1) {
                currentScale = scale;
                drawGraphic(drawStorage, currentDrawMode);
            }
            if(currentScale != 1) {
                $("button.btn_reset", $mP).addClass("active");
            } else {
                $("button.btn_reset", $mP).removeClass("active");
            }
            return currentScale;
        }
        function zoomOut(event) {
            var scale = currentScale - zoomDelta;
            if(scale > 0.9) {
                currentScale = scale;
                drawGraphic(drawStorage, currentDrawMode);
            }
            if(currentScale != 1) {
                $("button.btn_reset", $mP).addClass("active");
            } else {
                $("button.btn_reset", $mP).removeClass("active");
            }
            return currentScale;
        }
        function zoomReset() {
            var scale = 1;
            currentScale = scale;
            resetMove();
            drawGraphic(drawStorage, currentDrawMode);
            $("button.btn_reset").removeClass("active");
        }

        function setDrawType(drawType) {
            if (drawType != currentDrawMode) {
                if (drawType == 'B') {
                    // Cursor Guide 가 필요한 작업에는 가이드를 가운데로 정렬해 그려준다
                    drawCoordLines(ui_draw_guide_canvas.width / 2, ui_draw_guide_canvas.height / 2);
                } else {
                    clearCoordLines();
                }
            }
            currentDrawMode = drawType;
        }
        function setMoveMode(bMode) {
            currentMoveMode = bMode || false;
            if(currentMoveMode) clearCoordLines();
            if(!currentMoveMode) refresh();
        }
        function drawGraphic(data, defaultDrawMode) {
            // if($.isEmptyObject(data)) {
            //     drawStorage = [];
            //     return;
            // }
            // 새로 그리기 위해 화면을 먼저 클리어
            clearCanvas();
            redrawResourceToCanvas();
            // 각자 툴에 맞게 그리기 형식으로 변환 된 데이터가 들어온다.
            currentDrawMode = defaultDrawMode || 'B';
            var $drawTool = getCurrentDrawTool();
            if(!$.isEmptyObject($drawTool)) {
                if(typeof data === 'undefined') {
                    data = [];
                }
                drawStorage = data;
                // 그리기 데이터를 적절한 붓으로 그리기만 하면 됨
                $drawTool.draw(data, currentScale*globalTimes);
            }
        }
        function refresh() {
            drawGraphic(drawStorage, currentDrawMode);
        }
        function dropGraphic(uuid) {
            var nIndex = 0;
            drawStorage.forEach(item => {
                if(item.uuid == uuid) {
                    drawStorage.splice(nIndex, 1);
                }
                nIndex++;
            });
            drawGraphic(drawStorage, currentDrawMode);
        }
        function syncToGraphic(uuid) {
            var $drawTool = getCurrentDrawTool();
            if(!$.isEmptyObject($drawTool)) {
                clearCanvas();
                redrawResourceToCanvas();
                return $drawTool.syncUnitToDraw(uuid);
            }
        }
        var drawStorage = [];
        var gBoxDragMode = false;
        var gCanvasMoveMode = false;
        var gModifyMode = false;

        function drawByClick(event) {
            let $drawTool = getCurrentDrawTool();
            if(!$.isEmptyObject($drawTool)) {
                if(typeof that._checkPoint === 'function') {
                    let pos = getMousePosForScope(event);
                    pos.x -= moveXTemp;
                    pos.y = pos.y - (ui_drawing_canvas.height/2) + (sourceImage.naturalHeight * currentScale * globalTimes / 2) - moveYTemp;
                    // 왼쪽 버튼 클릭 했을 때
                    if(event.button == 0) {
                        // 이미지 내에서만 동작하도록 제한
                        if (pos.x <= sourceImage.naturalWidth * currentScale * globalTimes && pos.x >= 0
                            && pos.y <= sourceImage.naturalHeight * currentScale * globalTimes && pos.y >= 0
                        ) {
                            if(currentMoveMode) {
                                if(that._userMode == "Inspector") return;
                                // move button 이 활성화 일 때 polygon을 선택하는 동작
                                if(currentDrawMode == 'B') {
                                    clearCanvas();
                                    redrawResourceToCanvas(currentScale);

                                    let selectCellUUID = $drawTool.syncUnit(pos);
                                    that._checkPoint($drawTool, selectCellUUID, 'M');
                                    gModifyMode = !$.isEmpty(selectCellUUID);
                                }
                            }
                            // 그리기 모드일 때
                            else {
                                if(currentDrawMode == 'B') gBoxDragMode = true;
                                if(that._checkPoint($drawTool, pos, 'S') == 'E') {
                                    if(currentDrawMode == 'B') gBoxDragMode = false;
                                }
                            }
                        }
                    }
                    // 오른쪽 버튼 클릭 했을 때 (canvas 이동 모드)
                    if(event.button == 2) {
                        gCanvasMoveMode = true;
                        let pos = getMousePos(event);
                        startX = pos.x;
                        startY = pos.y;
                        movedX = startX;
                        movedY = startY;
                    }
                }
            } else {
                // 그리기 외 동작
            }
        }
        function endingDrawByMouseUp(event) {
            // 왼쪽 버튼을 땠을 때
            if(event.button == 0) {

            }
            // 오른쪽 버튼을 땠을 때
            if(event.button == 2) {
                gCanvasMoveMode = false;
            }
        }
        function movingDrawByMouseDrag(event) {

            // draw coordline
            let pos = getMousePos(event);
            if(!$.isEmpty(currentDrawMode) && currentDrawMode == 'B' && !currentMoveMode) {
                drawCoordLines(pos.x, pos.y);
            }
        }


        function startDrawing(event) {
            var $drawTool = getCurrentDrawTool();
            if(!$.isEmptyObject($drawTool)) {
                var pos = getMousePos(event);
                pos.x -= moveXTemp;
                pos.y = pos.y - (ui_drawing_canvas.height/2) + (sourceImage.naturalHeight * currentScale * globalTimes / 2) - moveYTemp;
                if(typeof that._checkPoint === 'function') {
                    // 왼쪽 버튼을 클릭했을 때
                    if(event.button == 0) {
                        if (pos.x <= sourceImage.naturalWidth * currentScale * globalTimes && pos.x >= 0
                            && pos.y <= sourceImage.naturalHeight * currentScale * globalTimes && pos.y >= 0
                        ) {
                            if (currentMoveMode) {
                                // move button 이 활성화 일 때 (박스를 선택한다)
                                clearCanvas();
                                redrawResourceToCanvas(currentScale);
                                var selectCellUUID = $drawTool.syncUnit(pos);
                                that._checkPoint($drawTool, selectCellUUID, 'M');
                                // gModifyMode = !$.isEmpty(selectCellUUID);
                                if(that._userMode != "Inspector"){
                                    gModifyMode = !$.isEmpty(selectCellUUID);
                                }
                            } else {
                                // 그림을 그리기 시작 (move button 이 비 활성화 일 때)
                                if (currentDrawMode == 'B') gBoxDragMode = true;
                                if (that._userMode != "Inspector" && that._checkPoint($drawTool, pos, 'S') == 'E') {
                                    gBoxDragMode = false;
                                }
                            }
                        }
                    }
                    // 오른쪽 버튼을 클릭했을 때
                    else if(event.button == 2) {
                        gCanvasMoveMode = true;
                        var pos = getMousePos(event);
                        startX = pos.x;
                        startY = pos.y;
                        movedX = startX;
                        movedY = startY;
                    }
                }
            }
        }
        function endDrawing(event) {
            if(event.button == 0) {
                if(currentDrawMode == 'B') {
                    if(!gBoxDragMode) return;   // 드래그 모드가 아니면 리턴
                    gBoxDragMode = false;
                } else {
                    // Seg mode 에 move 모드이면 left click 먹지 않게
                    if(currentMoveMode) return ;
                }
                if(typeof that._checkPoint === 'function') {
                    var $drawTool = getCurrentDrawTool();
                    if(!$.isEmptyObject($drawTool)) {
                        that._checkPoint($drawTool, null, 'E');
                    }
                }
            }
            else if(event.button == 2) {
                gCanvasMoveMode = false;
                if(!moveTick) {
                    if(currentDrawMode == 'S') {
                        // seg에서 우클릭 했을 때
                        contextMenu();
                        // that._checkPoint($drawTool, null, 'P');
                        closePathEnd();
                    }
                } else {
                    console.log("move end");
                }
                moveTick = false;
            }
        }
        function closePathEnd() {
            that._checkPoint(null, null, 'P');
        }
        function contextMenu() {
            if(typeof  that._endPoint === 'function') {
                that._endPoint();
            }
        }
        function mouseMoving(event) {
            clearCoordLines();
            // choice canvas move mode
            if(gCanvasMoveMode) {
                var pos = getMousePos(event);
                var x = pos.x;
                var y = pos.y;

                uiContextDrawing.translate(x - movedX, y - movedY);

                movedX = x;
                movedY = y;

                moveXTemp += movedX - startX;
                moveYTemp += movedY - startY;

                startX = x;
                startY = y;

                drawGraphic(drawStorage, currentDrawMode);

                moveTick = true;
                return;     // 2021.08.29 기준 오류가 발생하면 제거 필요
            }
            // draw mode : Box
            else if(currentDrawMode == 'B') {
                var pos = getMousePos(event);
                pos.x -= moveXTemp;
                pos.y = pos.y - (ui_drawing_canvas.height/2) + (sourceImage.naturalHeight * currentScale * globalTimes / 2) - moveYTemp;
                if(gBoxDragMode) {
                    var $drawTool = getCurrentDrawTool();
                    if(!$.isEmptyObject($drawTool)) {
                        if(typeof that._dragEventCallback === 'function') {
                            // drag 로 Box 를 그리는 동작
                            if(pos.x <= sourceImage.naturalWidth * currentScale * globalTimes && pos.x >= 0
                                && pos.y <= sourceImage.naturalHeight * currentScale * globalTimes && pos.y >= 0
                            ) {
                                clearCanvas();
                                redrawResourceToCanvas(currentScale);
                                that._dragEventCallback($drawTool, pos, 1);
                            }
                        }
                    }
                } else {
                    if(gModifyMode && event.which == 1) {
                        if(that._userMode != "Inspector" && isEditableMode){
                            // 마우스 무빙과 함께 좌클릭을 하고 있는 중이라면
                            if(pos.x <= sourceImage.naturalWidth * currentScale * globalTimes && pos.x >= 0
                                && pos.y <= sourceImage.naturalHeight * currentScale * globalTimes && pos.y >= 0
                            ) {
                                clearCanvas();
                                redrawResourceToCanvas(currentScale);
                                movingPolygon(pos);
                            }
                        }
                    }
                }
                if(currentMoveMode) {
                    var $drawTool = getCurrentDrawTool();
                    if(!$.isEmptyObject($drawTool)) {
                        $drawTool.cursor(pos, this);
                    }
                }
            }
            // draw mode : another (TODO)
            else {}

            // 검수자의 경우 붉은색 가이드라인 필요 없음
            if(that._userMode == "Inspector") return;
            if(that._userMode != "Inspector" && !isEditableMode) return;
            // draw coordline
            var pos = getMousePos(event);
            var x = pos.x;
            var y = pos.y;
            if(!$.isEmpty(currentDrawMode) && currentDrawMode == 'B' && !currentMoveMode) {
                drawCoordLines(x, y);
            }
        }
        function movingPolygon(pos) {
            var $drawTool = getCurrentDrawTool();
            if(!$.isEmptyObject($drawTool)) {
                var movingCell = $drawTool.moveObject(pos);

                if(typeof that._dragEventCallback === 'function') {
                    that._dragEventCallback($drawTool, movingCell, 2);
                }
            }
        }

        function getCurrentDrawTool() {
            if(!$.isEmptyObject($TOOLS)) {
                if(!$.isEmpty(currentDrawMode)) {
                    return $TOOLS.get(toolname[currentDrawMode]);
                } else {
                    $.alert("그리기 모드를 활성화 하세요.");
                    return null;
                }
            } else {
                $.alert("사용 가능한 그리기 툴이 없습니다.");
                return null;
            }
        }
        function getMousePos(event) {
            var rect = ui_draw_guide_canvas.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            }
        }
        function getMousePosForScope(event) {
            let rect = ui_draw_guide_canvas.getBoundingClientRect();
            let pos = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            // pos.x -= moveXTemp;
            // pos.y = pos.y - (ui_drawing_canvas.height/2) + (sourceImage.naturalHeight * currentScale * globalTimes / 2) - moveYTemp;
            return pos;
        }
        function clearCanvas() {
            uiContextDrawing.clearRect(
                -ui_drawing_canvas.width*2*currentScale
                ,-ui_drawing_canvas.height*2*currentScale
                ,ui_drawing_canvas.width*4*currentScale
                ,ui_drawing_canvas.height*4*currentScale
            );
        }
        function resetMove() {
            uiContextDrawing.translate(-moveXTemp, -moveYTemp);
            moveXTemp = 0, moveYTemp = 0;
        }
        function drawCoordLines(x, y) {
            // line
            uiContextGuide.strokeStyle = "#FF0000";
            uiContextGuide.lineWidth = 0.8;
            uiContextGuide.beginPath();
            uiContextGuide.moveTo(x - ui_draw_guide_canvas.width / 2, -ui_draw_guide_canvas.height);
            uiContextGuide.lineTo(x - ui_draw_guide_canvas.width / 2, ui_draw_guide_canvas.height);
            uiContextGuide.moveTo(-ui_draw_guide_canvas.width, y - ui_draw_guide_canvas.height / 2);
            uiContextGuide.lineTo(ui_draw_guide_canvas.width, y - ui_draw_guide_canvas.height / 2);
            uiContextGuide.stroke();

            // dot
            uiContextGuide.strokeStyle = "#FFFFFF";
            uiContextGuide.fillStyle = "#FFFFFF";
            uiContextGuide.beginPath();
            uiContextGuide.arc(x - ui_draw_guide_canvas.width / 2, y - ui_draw_guide_canvas.height / 2, 1, 0, Math.PI * 2);
            uiContextGuide.fill();
            uiContextGuide.stroke();
        }
        function clearCoordLines() {
            if(!uiContextGuide) return;
            uiContextGuide.clearRect(
                -ui_draw_guide_canvas.width*2*currentScale
                ,-ui_draw_guide_canvas.height*2*currentScale
                ,ui_draw_guide_canvas.width*4*currentScale
                ,ui_draw_guide_canvas.height*4*currentScale
            );
        }
        function setEditableMode(status) {
            isEditableMode = status;
        }
        return {
            setDrawType: setDrawType,
            setMoveMode: setMoveMode,
            setEditableMode: setEditableMode,
            drawGraphic: drawGraphic,
            zoomIn: zoomIn,
            zoomOut: zoomOut,
            zoomReset: zoomReset,
            dropGraphic: dropGraphic,
            syncToGraphic: syncToGraphic,
            refresh: refresh
        }
    }
    return {
        CreateUiHandler: CreateUiHandler
    }
})();