(function ($) {
    $.fn.regDrawingUx = function(setting) {
        return new CanvasUI.CreateUiHandler($(this), setting);
    }
})(jQuery);

let CanvasUI = (function() {
    // controller
    let $ui_image_area;
    let $ui_image;

    let sourceImage;

    let ui_drawing_canvas, ui_draw_guide_canvas;
    let $ui_drawing_canvas, $ui_draw_guide_canvas;

    let $TOOLS = new Map();     // draw tool map
    let toolname = { B: 'BBox', S: 'Segment' }; // draw tool map key

    // context
    let uiContextDrawing;
    let uiContextGuide;

    // variable
    let currentDrawMode = null;
    let currentMoveMode = false;

    // scale (currentScale = 현재반영된 스케일, zoomDelta = 1 tick당 zoom변화량, globalTimes = resourceImage 실측률)
    let currentScale = 1, zoomDelta = 0.1, globalTimes = 1;

    // moving
    let startX = 0, startY = 0, isMove = false; // 움직이기 시작한 마우스 좌표
    let moveXTemp = 0, moveYTemp = 0;       // 캔버스 이동 거리
    let movedX = 0, movedY = 0;             // 움직인 마우스 좌표


    function CreateUiHandler($mP, settings) {
        let that = this;

        if(!$.isEmptyObject(settings)) {
            that._clickEventCallback = settings.operationCallback.leftClick;
            that._dragEventCallback = settings.operationCallback.dragAndDraw;
            that._rightClickEventCallback = settings.operationCallback.rightClick;
        }
        init();
        function init() {
            // 그리기 작업공간을 세팅한다.
            $ui_image_area = $mP.find("div.imgArea");
            if($.isEmptyObject($ui_image_area)) {
                $.alert("이미지 작업을 위한 요소를 확인할 수 없습니다. [div.imgArea]필요");
                return null;
            }
            // Canvas Element
            ui_drawing_canvas = $mP.find("canvas#dataSourceCanvas") ? $mP.find("canvas#dataSourceCanvas").get(0) : null;
            ui_draw_guide_canvas = $mP.find("canvas#dataSourceCanvas2") ? $mP.find("canvas#dataSourceCanvas2").get(0) : null;
            // Canvas jQuery 객체화
            $ui_drawing_canvas = $(ui_drawing_canvas);
            $ui_draw_guide_canvas = $(ui_draw_guide_canvas);

            // UI에 가려지지 않도록 이미지 로딩 초기 사이즈를 조절한다.

            // Resource를 그리고, Canvas EventHandler를 binding한다.
            if(!$.isEmptyObject($ui_drawing_canvas)) {
                $ui_image = $mP.find("img#dataSource");
                $ui_image.one("load", bindEventHandler);
            }
        }
        // 이미지가 불러 와 지면 Canvas 동작을 시작하도록
        function bindEventHandler() {
            sourceImage = $(this).get(0);
            // sizing canvas

            $ui_draw_guide_canvas.one("mousewheel", zoomControl);
            $ui_draw_guide_canvas.one("mousedown", byMouseDOWN);
            $ui_draw_guide_canvas.one("mouseup", byMouseUP)
            $ui_draw_guide_canvas.one("mousemove", byMouseMOVE);
            $ui_draw_guide_canvas.one("contextmenu", function(event) { event.preventDefault(); });  // system context 메뉴 안뜨게

            setUiContext();
            mirrorResourceToCanvas();


        }

        return {

        }
    }
    return {
        CreateUiHandler: CreateUiHandler
    }
})();