// DRAW 'SEGMENT' TOOL
(function ($) {
    $.fn.SegmentationInit = function(settings) {
        return SegmentToolJS.applyDrawTool($(this), settings);
    };
})(jQuery);

var SegmentToolJS = (function() {
    var $ui_canvas;
    var uiContext;

    var dataSet = [];
    var drawingData = [];

    var selectCell = null;

    var currentScale = 1;
    var times = 1;
    var zeropoint = {x:0, y:0};
    var zeroCursor = {x:0, y:0};

    var offsetX = 0;
    var offsetY = 0;

    function ModifibleSegment() {
        this.idx = 0;
        this.points = [];
        this.fill = '';
        this.text = '';
        this.uuid = '';
    }
    ModifibleSegment.prototype = {
        draw: function() {
            if($.isEmpty(this.points)) {
                return;
            }
            uiContext.fillStyle = this.fill;

            this.points.forEach(point => {
                let index = 0;
                let x, y;
                uiContext.beginPath();
                point.forEach(position => {
                    if(index % 2 == 0) {
                        x = position;
                    } else {
                        y = position;
                    }
                    if(index % 2) { // 홀수 일때 = Y좌표가 완성됐을 때,
                        let scaleX = (x * currentScale) - ($ui_canvas.width / 2);
                        let scaleY = (y - zeroCursor.y) * currentScale;
                        uiContext.moveTo(scaleX , scaleY);
                        uiContext.arc(scaleX, scaleY, 2, 0, 2 * Math.PI);
                    }
                    index++;
                });
                uiContext.fill();
                uiContext.closePath();
            });

            let startX, startY;
            this.points.forEach(point => {
                let lineIndex = 0;
                let x, y;

                if(selectCell === this) {
                    uiContext.lineWidth = 2.0;
                    uiContext.strokeStyle = this.fill;
                } else {
                    uiContext.lineWidth = 1.0;
                    uiContext.strokeStyle = this.fill+'80';
                }
                uiContext.beginPath();
                point.forEach(position => {
                    if(lineIndex % 2 == 0) {
                        x = position;
                    } else {
                        y = position;
                    }
                    if(lineIndex % 2) { // 홀수 일때 = Y좌표가 완성됐을 때,
                        let scaleX = (x * currentScale) - ($ui_canvas.width / 2);
                        let scaleY = (y - zeroCursor.y) * currentScale;
                        if(lineIndex == 1) {
                            startX = scaleX, startY = scaleY;
                            uiContext.moveTo(scaleX , scaleY);
                        } else {
                            uiContext.lineTo(scaleX, scaleY);
                        }
                    }
                    lineIndex++;
                });
                uiContext.closePath();
                uiContext.stroke();
                uiContext.fillStyle = this.fill+'10';
                uiContext.fill();
            });

            if(this.text) {
                uiContext.strokeStyle = this.fill;
                let textX = startX;
                let textY = startY;
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
                $.alert("Segment를 그릴 캔버스가 없습니다.");
            }

            // $.getEventPool().add(new DataBuilderEvent({
            //     'onclick': onClick, 'onDblClick': onDblClick
            // }));
            //
            // $.getEventPool().call('onclick');
        }
        function onClick() { console.log("C"); }
        function onDblClick() { console.log("D"); }

        // 전체 Unit 드로잉 (Refresh등)
        function draw(data, scale) {
            drawingData = data;
            currentScale = scale;
            $.each(drawingData, function(i,v) {
                segmenting(v);
            });
        }
        // Data로 Unit 하나를 그린다
        function segmenting(v, bSelectCell) {
            var polygon = new ModifibleSegment();
            polygon.idx = v.idx;
            polygon.points = v.Segmentation;
            polygon.fill = v.color;
            polygon.color = v.color;
            polygon.uuid = v.uuid;
            polygon.text = v.category_name;

            if(bSelectCell) {
                selectCell = polygon;
            }
            polygon.draw();
        }
        // 선택된 Unit의 실시간 Update
        function drawing(seginfo) {
            var segment = [];
            segment.Segmentation = seginfo.Segmentation;
            segment.category_name = seginfo.category_name;
            segment.category_id = seginfo.category_id;
            segment.color = seginfo.color;
            segment.uuid = seginfo.uuid;
            segment.idx = seginfo.idx;

            // 이미 그려진 Segments
            $.each(drawingData, function (i,v) {
                segmenting(v);
            });
            // 지금 그리고 있는 Segment
            segmenting(segment);
        }
        // function moveObject
        // function resizeBox
        function syncUnit(position) {
            console.log("sync unit");
        }
        function syncUnitToDraw(uuid) {
            selectCell = null;
            var onceSelect = false;
            var rtnData = null;
            $.each(drawingData, function(i,v) {
                var bSelectCell = false;
                if(uuid == v.uuid) {
                    onceSelect = true;
                    bSelectCell = true;
                    rtnData = v;
                }
                segmenting(v, bSelectCell);
            });
            return rtnData;
        }
        function clearSegment() {
        }
        function appendData(unitInfo) {
            let isAlready = false;
            $.each(drawingData, function (i,v) {
                if(v.uuid == unitInfo.uuid) {
                    isAlready = true;
                    unitInfo.Segmentation.forEach(point => {
                        point.forEach(function(v, i) {
                            if(i < point.length -2) return;
                            point[i] = v / currentScale;
                        });
                    });
                    v.Segmentation = unitInfo.Segmentation;
                }
                segmenting(v, true);
            });
            if(!isAlready) {
                unitInfo.Segmentation.forEach(point => {
                    point.forEach(function(v, i) {
                        if(i < point.length -2) return;
                       point[i] = v / currentScale;
                    });
                });
                drawingData.push(unitInfo);
            }
        }
        // Annotation 한 내용을 데이터로 변환할 때 호출
        function getData($this) {
            return drawToSaveData();
        }
        function drawToSaveData() {
            // convert drawingData to dataSet
            return drawingData;
        }
        return {
            init: init,
            draw: draw,
            drawing: drawing,
            syncUnit: syncUnit,
            syncUnitToDraw: syncUnitToDraw,
            appendData: appendData,
            clear: clearSegment,
            getData: getData,
            drawToSaveData: drawToSaveData
        }
    }

    return {
        applyDrawTool: applyDrawTool
    }
})();