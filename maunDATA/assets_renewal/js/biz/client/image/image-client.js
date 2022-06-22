// FIXME coding sample용 데이터로써 삭제 요망.
var imageInspectorScript = (function() {
    var $mP;
    var $Object;
    var $UI;
    var $tagController;

    var selectedClass = { category_id: '', category_name: '' };

    // 공통 만들고 삭제할 내용
    var projectType = "P";
    var jobInfo;
    var settings = {};

    var defaultDrawMode;

    function init() {
        $mP = $("div#wrap");
        $Object = $mP.initClientProject({
            projectId: gProjectId,
            projectType: projectType,
            reloadData: getAnnotationData,
            exportData: annotationToDataSet,
            reloadCallback: reloadJob,
            nextCallback: saveResult
        });
        $UI = $mP.regDrawingUx({
            useTool: ["BBox", "Segment"],
            checkPoint: [activeBoxAndTag],
            redraw: null,
            leftPadding : !$.isEmptyObject($("div.aside")) ? $("div.aside").get(0).offsetWidth : 0,
            bottomPadding : !$.isEmptyObject($("div.frame_list_wrap")) ? $("div.frame_list_wrap").get(0).offsetHeight : 0,
            userMode : "Inspector"
        });

        //bindEventHandler();
        getDocuments();         // get documents : global guide, script
        setController();        // set annotation contoller
        getCurrentJob();        // get job
    }
    function setController() {
        // 툴에 관한 세팅은 여기서 모두 정한다
        settings.uiType = '';
        if(!$.isEmpty(templateId)) settings.uiType = templateId;

        ClientToolJS.init(settings);
        $tagController = $("div.tab_cont ul.tag_list", $mP);
    }
    function bindEventHandler() {
        gnbClientViewScript.init($Object, getContext, failCallback, jobInfo.jobId);  // gnb controller 초기화

        snbInspectorViewScript.init($Object);  // snb controller 초기화
        snbInspectorViewScript.renderToolMenu(menuCallback);   // 프로젝트에 해당하는 tool menu 가져오기
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
    /* 작업을 위한 Resource와 Contents를 화면에 표시한다 */
    function renderJobContents(data) {
        jobInfo = data.jobInfo;
        bindEventHandler();
        // 임시저장, 수정하기, 완료
        gnbClientViewScript.setProcess(data.jobInfo);

        // frame 이 필요한 경우 여기에서 render
        var isFrame = false;
        if(isFrame) {}

        /*** 주의 2/3 : 여기부터 화면 전용 시작 ***/
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
        }

        if(jobInfo.jobType == 'NB') {
            defaultDrawMode = 'B';
        } else if(jobInfo.jobType == 'NS') {
            defaultDrawMode = 'S';
        }
        /*** 주의 2/3 : 여기까지 화면 전용 끝 ***/
        getAnnotationData();
        refreshData();

        // 초기 로딩 시 객체 선택 모드(move object)로 설정
        $("button.btn_move_object").addClass("active");
        $UI.setMoveMode(true);
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
                $Object.clearWorkData();
                activeAnnotations.remove();
                getCurrentJob();
            }
        });
    }
    function refreshData() {
        colorTicket = 0;
        resetEventHandler();
        $("button.btn_reset").removeClass("active");
        gnbClientViewScript.loadJobHistory(getContext, failCallback);
    }
    function resetEventHandler() {
        MindsStyle.bindEventHandler(function(uuid) {
            // 태그 선택하면 박스 선택 되도록
            $("button.btn_move_object").addClass("active");
            $UI.setMoveMode(true);
            $UI.syncToGraphic(uuid);
        });
    }

    let currentDrawMode = null;
    /* Tool Menu 에 따른 개별 동작 등록 (menu code로 구분) */
    function menuCallback($this) {
        if($this.hasClass("btn_move_object")) {
            // moving image
            $UI.setMoveMode($this.hasClass('active'));
        }
        else if($this.hasClass("btn_bounding_box")) {
            // selectedClass.category_id = $this.find("input").val();
            // selectedClass.category_name = $this.find("label").text();
        }
        else if($this.hasClass("btn_segmentation")) {
        }
        else if($this.hasClass("btn_zoomIn")) {
            if($UI.zoomIn() < 3.1) {
                $("button.btn_reset").addClass("active");
            } else {
                $("button.btn_reset").removeClass("active");
            }
        }
        else if($this.hasClass("btn_zoomOut")) {
            var scale = $UI.zoomOut();
            if(scale > 1) {
                $("button.btn_reset").addClass("active");
            }
            else {
                $("button.btn_reset").removeClass("active");
            }
        }
        else if($this.hasClass("btn_reset")) {
            $UI.zoomReset();
            $("button.btn_reset").removeClass("active");
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
                let data = $(item).exportClientAnnotationData($Object.getDataSet());
                if(!$.isEmptyObject(data)) {
                    dataSet.push(data);
                }
            });
        }
        $Object.setDatsSet(dataSet);
    }

    var hexColorList = ["#00ffa7","#dffc66","#d314cc","#ff91b3","#6c9ff0","#142eb4","#fd0d7c","#e67864","#32ce39","#0dceb8"];
    var colorTicket = 0;
    function getAnnotationData() {
        $Object.selectWorkData(function(data) {
            data.forEach(function(v, i) {
                v.color = hexColorList[colorTicket++%hexColorList.length];
            });
            $Object.setDatsSet(data);
            var drawData = $tagController.renderClientAnnotations(data, jobInfo.jobType, function(data) {
                $UI.refresh();
            });
            $("select").attr("disabled", true);
            // $UI.drawGraphic(drawData);
            $UI.drawGraphic(drawData, currentDrawMode ? currentDrawMode : defaultDrawMode);
            resetEventHandler();
        });
    }

    function activeBoxAndTag($drawTool, position, status) {
        if(status == 'M') {
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
