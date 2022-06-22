// FIXME coding sample용 데이터로써 삭제 요망.
var imageWorkerScript = (function() {
    var $mP;
    var $Object;
    var $UI;
    var $tagController;

    var selectedClass = { category_id: '', category_name: '' };

    // 공통 만들고 삭제할 내용
    var projectType = "P";
    var jobInfo;
    var settings = {};

    var hexColorList = ["#00ffa7","#dffc66","#d314cc","#ff91b3","#6c9ff0","#142eb4","#fd0d7c","#e67864","#32ce39","#0dceb8"];
    var colorTicket = 0;

    var defaultDrawMode;

    function init() {
        $mP = $("div#wrap");
        $Object = $mP.initProject({
            projectId: gProjectId,
            projectType: projectType,
            reloadData: getAnnotationData,
            exportData: annotationToDataSet,
            reloadCallback: reloadJob,
            nextCallback: saveResult
        });
        $UI = $mP.regDrawingUx({
            useTool: ["BBox", "Segment"],
            checkPoint: [polygonGenerator, dragAndDraw, showContextMenu],    // click event callbak, drag event callback
            redraw: null,
            leftPadding : !$.isEmptyObject($("div.aside")) ? $("div.aside").get(0).offsetWidth : 0,
            bottomPadding : !$.isEmptyObject($("div.frame_list_wrap")) ? $("div.frame_list_wrap").get(0).offsetHeight : 0
        });

        bindEventHandler();
        getDocuments();         // get documents : global guide, script
        setController();        // set annotation contoller
        getCurrentJob();        // get job

        // $.getEventPool().add(new DataBuilderEvent({
        //     'onclick': onClick, 'onDblClick': onDblClick
        // }));
    }
    function onClick() { console.log("A"); }
    function onDblClick() { console.log("B"); }

    function setController() {
        // 툴에 관한 세팅은 여기서 모두 정한다
        settings.uiType = '';
        if(!$.isEmpty(templateId)) settings.uiType = templateId;

        ClientToolJS.init(settings);
        $tagController = $("div.tab_cont ul.tag_list", $mP);
    }
    function bindEventHandler() {
        gnbWorkerViewScript.init($Object);  // gnb controller 초기화

        snbWorkerViewScript.init($Object);  // snb controller 초기화
        snbWorkerViewScript.renderToolMenu(menuCallback);   // 프로젝트에 해당하는 tool menu 가져오기

        $(".btn_select_delete", $mP).one("click", removeWorkData);  // annotation 개별 삭제
        $(".btn_all_delete", $mP).one("click", clearWorkData);      // annotation 일괄 삭제 (현재 Job Resource 기준)
    }
    function getDocuments() {
        // 가이드 도큐먼트를 가져온다
        $Object.selectGuideFiles();
        /** 주의 1/3 : 화면 상황에 따라 공통된 스크립트 파일이 있는 경우에만 호출 **/
    }
    /* 작업 가져오기 (최근작업 or 신규작업) */
    function getCurrentJob() {
        $Object.dataSetInit();
        $Object.requestAssignJob(getContext, failCallback);
    }
    /* 작업에 대한 기본 정보를 가져온다 */
    function getContext() {
        $Object.getCurrentJobContext(renderJobContents);
    }

    let gSelectedContentId;
    /* 작업을 위한 Resource와 Contents를 화면에 표시한다 */
    function renderJobContents(data) {
        jobInfo = data.jobInfo;
        // 임시저장, 수정하기, 완료
        gnbWorkerViewScript.setProcess(data.jobInfo);

        /*** 주의 2/3 : 여기부터 화면 전용 시작 ***/
        let dataContext = data.subContext;
        if(!$.isEmptyObject(dataContext)) {
            // frame 이 필요한 경우 여기에서 render
            // $.appendObjectUrl(dataContext);

            var frameViewHtml = $.templates("#renewalFrameWrapper").render(data);
            var $frameNavi = $("div.videoFrameArea", $mP).html(frameViewHtml);
            $frameNavi.addClass("on");
            $frameNavi.frameNavHandler(function() {
                // Next 버튼 Active시 현재 정보 다음 프레임에 저장
                copyBeforeTagData();
            });
            // style script 와 동시 적용하기 위해 eventbinding on 사용함 (one 바꾸지마)
            // 선택되지 않아야할 선택자가 있다면 여기에 추가하고 REF.1.라인에도 추가해야함.
            $frameNavi.find("li.frameBorder").on("click", function() {
                var contentId = $(this).data("contentid");
                // 이중 클릭 방지
                if(gSelectedContentId != contentId) {
                    // 현재 꺼 임시저장 후 이동, 이후 불러오기 전에 새로 그리지 않는다
                    $Object.saveAnnotation();
                    gSelectedContentId = contentId;
                    for(let i=0; i<dataContext.length; i++) {
                        let item = dataContext[i];
                        if(!$.isEmpty(item.contextId) && item.contextId == contentId) {
                            getDetailImageAndShow(item);
                            break;
                        } else {}
                    }
                }
            });
            // REF.1. 선택되지 않아야할 선택자가 있다면 여기에도 추가해야함
            $frameNavi.find("li.frameBorder").eq(0).click();
            // getAnnotationData();
        } else {
            $("button.btn_tagCopy", $mP).hide();
            showSelectedImage(data);
        }

        if(jobInfo.jobType == 'NB') {
            defaultDrawMode = 'B';
        } else if(jobInfo.jobType == 'NS') {
            defaultDrawMode = 'S';
        }
        /*** 주의 2/3 : 여기까지 화면 전용 끝 ***/
        // getAnnotationData();
        refreshData();
    }
    let selectedContextData = null;
    function getDetailImageAndShow(fileData) {
        selectedContextData = fileData;
        $Object.selectCurrentContents(fileData.atchFileId, function(result) {
            showSelectedImage(result);
        });
        // 선택된 이미지의 상세 데이터를 불러온다.
    }
    function showSelectedImage(data) {
        var imageResource = data.atchFile;
        if($.isEmpty(imageResource)) {
            $.alert("원본 데이터 파일을 불러오지 못했습니다."); // 원본 이미지를 불러오지 못했습니다.
            return;
        } else {
            var base64ImageContent = imageResource.replace(/^data:image\/(png|jpeg);base64,/, "");
            var extType = data.extName == ".png"? "image/png" : "image/jpeg";
            var resourceBlob = $.base64ToBlob(base64ImageContent, extType);
            var blobUrl = URL.createObjectURL(resourceBlob);

            $("img#dataSource", $mP).attr("src", blobUrl);
            $(".imgArea", $mP).removeClass("loadingImg");

            getAnnotationData();
        }
    }
    /* 임시저장 후 처리해야 하는 콜백 */
    function saveResult() {
        getCurrentJob();
    }
    /* 현재 Job을 처음부터 새로 고침하는 함수 */
    function reloadJob() {
        $Object.reloadThisJob(getContext, failCallback);
    }

    /*** 주의 3/3 : 여기부터 화면 전용 시작 ***/
    function renderGuideDocuments(data) {
        // 스크립트용 가이드 표시

    }
    /*** 주의 3/3 : 여기까지 화면 전용 끝 ***/
    function removeWorkData() {
        var activeAnnotation = $("ul.tag_list", $mP).find("li.active");
        if(!$.isEmptyObject(activeAnnotation) && activeAnnotation.length > 0) {
            var category = activeAnnotation.find("div").data("category");
            if(category == 'meta') {
                $.alert("단독으로 삭제할 수 없는 항목입니다.");
                return;
            };
            $.confirm("삭제한 내용은 다시 복구 할 수 없습니다.<br>선택한 내용을 삭제하시겠습니까?", function() {
                bSegDrawing = false;
                segmentations = [];
                var contextId = activeAnnotation.find(".tagBox").data("contextId");
                var uuid = activeAnnotation.find(".tagBox").data("uuid");
                if(!$.isEmpty(contextId)) {
                    // 서버에서 해당 context 를 지운다
                    $Object.removeWorkData(contextId);
                }
                activeAnnotation.remove();
                $Object.removeDataSet(uuid);
                $UI.dropGraphic(uuid);
            });
        } else {
            $.alert("삭제할 항목을 선택하세요.");
        }
    }
    function clearWorkData() {
        $.confirm("삭제한 내용은 다시 복구 할 수 없습니다.<br>작업한 내용을 모두 삭제하시겠습니까?", function() {
            var activeAnnotations = $("ul.tag_list", $mP).find("li");
            if(!$.isEmptyObject(activeAnnotations) && activeAnnotations.length > 0) {
                // 서버에서 전체 삭제
                $Object.clearWorkData(getAnnotationData);
                activeAnnotations.remove();
                $Object.clearDataSet();
            }
        });
    }
    function refreshData() {
        colorTicket = 0;
        resetEventHandler();
        gnbWorkerViewScript.loadJobHistory(getContext, failCallback);
    }
    function resetEventHandler() {
        MindsStyle.bindEventHandler(function(uuid) {
            if(currentDrawMode == 'B' || defaultDrawMode == 'B') {
                // 태그 선택하면 박스 선택 되도록
                $("button.btn_move_object").addClass("active");
                $UI.setMoveMode(true);
            }
            // segmentation은 return이 있다.
            var selectedData = $UI.syncToGraphic(uuid);
            if((currentDrawMode == 'S' || defaultDrawMode == 'S')
                && !$.isEmptyObject(selectedData)) {
                bSegDrawing = true;
                gSegInfo = {...selectedData};
                segment = gSegInfo.Segmentation[gSegInfo.Segmentation.length-1];
                segmentations = gSegInfo.Segmentation;
            }
        });
    }

    let redoStack = [];
    let currentDrawMode = null;
    /* Tool Menu 에 따른 개별 동작 등록 (menu code로 구분) */
    function menuCallback($this) {
        if($this.hasClass("btn_move_object")) {
            // moving image
            $UI.setMoveMode($this.hasClass('active'));
        }
        else if($this.hasClass("btn_bounding_box")) {
            selectedClass.category_id = $this.find("input").val();
            selectedClass.category_name = $this.find("label").text();
        }
        else if($this.hasClass("btn_segmentation")) {
            selectedClass.category_id = $this.find("input").val();
            selectedClass.category_name = $this.find("label").text();
        }
        else if($this.hasClass("btn_zoomIn")) {
            $UI.zoomIn();
        }
        else if($this.hasClass("btn_zoomOut")) {
            $UI.zoomOut();
        }
        else if($this.hasClass("btn_reset")) {
            $UI.zoomReset();
        }
        else if($this.hasClass("btn_undo")) {
            if(segment.length > 2) {
                // boxing object
                var y = segment.pop();
                if(!$.isEmpty(y)) {
                    redoStack.push(y);
                }
                var x = segment.pop();
                if(!$.isEmpty(x)) {
                    redoStack.push(x);
                }
                $UI.refresh();
            } else {
                $.confirm("시작점은 취소할 수 없습니다.<br>Segment를 삭제하시겠습니까?", function() {
                    if(!$.isEmpty(gSegInfo.uuid)) {
                        bSegDrawing = false;
                        segmentations = [];
                        var activeAnnotation = $("ul.tag_list", $mP).find("li.active");
                        var contextId = activeAnnotation.find(".tagBox").data("contextId");
                        var uuid = activeAnnotation.find(".tagBox").data("uuid");
                        if(!$.isEmpty(contextId)) {
                            // 서버에서 해당 context 를 지운다
                            $Object.removeWorkData(contextId);
                        }
                        activeAnnotation.remove();
                        $Object.removeDataSet(uuid);
                        $UI.dropGraphic(uuid);
                    }
                });
            }
        }
        else if($this.hasClass("btn_redo")) {
            // boxing object
            var x = redoStack.pop();
            if(!$.isEmpty(x)) {
                segment.push(x);
            }
            var y = redoStack.pop();
            if(!$.isEmpty(y)) {
                segment.push(y);
            }
            $UI.refresh();
        }
        else if($this.hasClass("btn_tagCopy")) {
        }
        else {
            selectedClass.category_id = $this.find("input").val();
            selectedClass.category_name = $this.find("label").text();
            var $parentBtn = $this.parents("div:first").siblings("button");
            if($parentBtn.hasClass("btn_bounding_box")) {
                $UI.setMoveMode(false);
                $UI.setDrawType('B');
                currentDrawMode = 'B';
            }
            else if($parentBtn.hasClass("btn_segmentation")) {
                $UI.setMoveMode(false);
                $UI.setDrawType('S');
                currentDrawMode = 'S';

                bSegDrawing = false;
                segment = [];
                segmentations = [];
            } else {
                console.log("undefind specificity");
            }
        }
        // annotation 영역 이벤트를 위해 handler reset
        resetEventHandler();
    }
    // 작업자가 작업한 태그를 기준으로 DataSet을 만든다.
    function annotationToDataSet() {
        var dataSet = [];
        let $tagList = $("li", $tagController);
        if(!$.isEmptyObject($tagList)) {
            $tagList.each(function(i, item) {
                let data = $(item).exportClientAnnotationData($Object.getDataSet(), selectedContextData);
                if(!$.isEmptyObject(data)) {
                    dataSet.push(data);
                }
            });
        }
        $Object.setDatsSet(dataSet);
    }

    let isOnCopyFlag = false;
    let prepareData = {};
    function getAnnotationData() {
        bSegDrawing = false;
        segmentations = [];
        gSegInfo = {};
        prepareData = {};
        if(isOnCopyFlag) {
            prepareData = $Object.getDataSet();
        }
        $Object.selectWorkData(function(data) {
            if(isOnCopyFlag && $.isEmptyObject(data)) {
                data = prepareData;
            } else {
            }
            isOnCopyFlag = false;
            data.forEach(function(v, i) {
                v.color = hexColorList[colorTicket++%hexColorList.length];
            });
            $Object.setDatsSet(data);
            var drawData = $tagController.renderClientAnnotations(data, jobInfo.jobType, function(data) {
                $UI.refresh();
            })
            $UI.drawGraphic(drawData, currentDrawMode ? currentDrawMode : defaultDrawMode);
            setProcess(jobInfo.jobStatus);
            resetEventHandler();

        });
    }
    function copyBeforeTagData() {
        isOnCopyFlag = true;
    }
    function setProcess(jobStatus) {
        if(jobStatus == 'RQ' || jobStatus == 'IM' || jobStatus == 'IS' || jobStatus == 'IC' || jobStatus == 'CM' || jobStatus == 'NU') {
            $("div.tab_cont", $mP).find("select").each(function() {
                $(this).attr("disabled", true);
            });
            $("div.deleteBox", $mP).find("button").attr('disabled', true);
        } else {
            $("div.tab_cont", $mP).find("select").each(function() {
                $(this).attr("disabled", false);
            });
            $("div.deleteBox", $mP).find("button").attr('disabled', false);
        }
    }
    let boxing = {};
    let segmentations = [];
    let segment = [];
    let gSegInfo = {};
    let gScaleSegTemp = {};
    let bSegDrawing = false;
    var onDrawing = false;
    var boxinfo = {};
    var currentStatus = null;
    function polygonGenerator($drawTool, position, status) {
        isEditable();
        currentStatus = status;
        if(status == 'S') {
            if($.isEmpty(selectedClass.category_id)) {
                $.alert("Class를 선택해 주세요.", function() {
                    if(currentDrawMode == 'B' || defaultDrawMode == 'B') {
                        $("button.btn_bounding_box", $mP).click();
                        $("button.btn_bounding_box", $mP).siblings("div").addClass("active");
                    } else if(currentDrawMode == 'S' || defaultDrawMode == 'S') {
                        $("button.btn_segmentation", $mP).click();
                        $("button.btn_segmentation", $mP).siblings("div").addClass("active");
                    }
                });
                return "E";
            }
            if(currentDrawMode == 'B') {
                // 박스 데이터 생성
                onDrawing = true;
                // 그리기 시작
                boxing = { Box: {} };
                boxing.Box.x = position.x;
                boxing.Box.y = position.y;
                boxing.category_name = selectedClass.category_name;
                boxing.category_id = selectedClass.category_id;
                boxing.color = hexColorList[++colorTicket%hexColorList.length];
            }
            else if(currentDrawMode == 'S') {
                // 세그먼트 데이터 생성
                if($.isEmptyObject(segmentations)) {
                    segmentations = [];
                }
                // 클릭할 때마다 누적
                // 우클릭 했을 때
                if(!bSegDrawing) {
                    bSegDrawing = true;

                    gSegInfo = {};
                    segment = [];
                    segmentations.push(segment);
                    addSegAnnotation();
                }
                segment.push(position.x);
                segment.push(position.y);
            }
        }
        else if(status == 'E') {
            // 그리기 끝
            if(currentDrawMode == 'B') {
                // BOX 그리기 일때
                onDrawing = false;
                if(boxing.Box.w < 0) {
                    boxing.Box.x += boxing.Box.w;
                    boxing.Box.w *= -1;
                }
                if(boxing.Box.h < 0) {
                    boxing.Box.y += boxing.Box.h;
                    boxing.Box.h *= -1;
                }

                // 그래도 최소는 있어야지
                if(boxing.Box.h > 5) {
                    boxing.uuid = $.genUuid();
                    boxing.idx = $("ul.tag_list li").last().find("span.tagNum").html()*1;
                    if(!boxing.idx) {
                        boxing.idx = 0;
                    }
                    // ui 추가
                    $drawTool.appendData(boxing);
                    $Object.appendDataSet($tagController.addClientAnnotation(boxing, "B",function() {
                        $UI.refresh();
                    }));
                    resetEventHandler();
                }
            }
            else if(currentDrawMode == 'S') {
                redoStack = [];
                $drawTool.appendData(gSegInfo);
                $UI.refresh();
                resetEventHandler();
            }
        }
        else if(status == 'P') {
            // 우클릭 했을 때 새 세그먼트 데이터 생성
            if(bSegDrawing) {
                redoStack = [];
                bSegDrawing = false;
                segmentations = [];
            } else {
                // context menu 생성
            }
        }
        else if(status == 'M') {
            // modify , move mode
            $tagController.find("li").removeClass("active");
            if(position != null) {
                var $div = $tagController.find("li div.tagBox[data-uuid="+position+"]");
                var $choiceItem = $div.parent("li");
                $choiceItem.addClass("active");

                var activeListPosition = $choiceItem.position();
                $choiceItem.parent('ul').animate({scrollTop: $choiceItem.parents('ul').scrollTop() + activeListPosition.top}, 200);
            }
        }
    }
    function showContextMenu() {

    }
    // context menu 추가 버튼 클릭시
    function addSegAnnotation() {
        // Segment 그리기 일때
        gSegInfo.Segmentation = segmentations;
        gSegInfo.idx = $("ul.tag_list li").last().find("span.tagNum").html()*1;
        gSegInfo.category_name = selectedClass.category_name;
        gSegInfo.category_id = selectedClass.category_id;
        gSegInfo.color = hexColorList[++colorTicket%hexColorList.length];
        gSegInfo.uuid = $.genUuid();
        if(!gSegInfo.idx) {
            gSegInfo.idx = 0;
        }

        $Object.appendDataSet($tagController.addClientAnnotation(gSegInfo, "S",function() {
            $UI.refresh();
        }));
    }
    function dragAndDraw($drawTool, position, type) {
        if(!isEditable()) {
            if(currentStatus != "M") $drawTool.drawing(boxinfo);
            return;
        }

        if(type == 1) {
            if(!onDrawing) return;
            // drag drawing
            if(!$.isEmptyObject(boxing.Box)) {
                boxing.Box.w = position.x - boxing.Box.x;
                boxing.Box.h = position.y - boxing.Box.y;
            }
            boxing.category_name = selectedClass.category_name;
            boxing.category_id = selectedClass.category_id;

            $drawTool.drawing(boxing);
        } else if(type == 2){
            var uuid = position.uuid;
            $Object.updateData(uuid, position);
        }
    }

    function isEditable() {
        if(jobInfo.jobStatus == "RQ"
            || jobInfo.jobStatus == "IM"
            || jobInfo.jobStatus == "IS"
            || jobInfo.jobStatus == "IC"
            || jobInfo.jobStatus == "CM"
        ) {
            $UI.setEditableMode(false);
            return false;
        } else {
            $UI.setEditableMode(true);
            return true;
        }
    }

    function drawBoundingBox () {
        console.log('drawBoundingBox');
    }
    function drawSegmentation () {
        console.log('drawSegmentation');
    }

    function failCallback(result) {
        console.log(result);
    }

    return {
        init: init
    }
})();
