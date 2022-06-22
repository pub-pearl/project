var videoInspectorScript = (function() {
    var $mP;
    var $Object;
    var $tagController;

    // 공통 만들고 삭제할 내용
    var projectType = "V";
    var defaultJobType = "VW";
    var jobClassName = "videowrite";

    var settings = {};

    function init() {
        $mP = $("div#wrap");
        $Object = $mP.initInspectorProject({
            projectId: gProjectId,
            projectType: projectType,
            jobType: defaultJobType,
            jobClassName: jobClassName,
            reloadData: getAnnotationData,
            reloadCallback: reloadJob,
            nextCallback: saveResult
        });
        bindEventHandler();
        getDocuments();         // get documents : global guide, script
        setController();        // set annotation contoller
        getCurrentJob();        // get job
    }
    function setController() {
        // 툴에 관한 세팅은 여기서 모두 정한다
        settings.isReturn = false;
        settings.role = 1;

        WriteToolJS.init(settings);
        $tagController = $("div.tab_cont ul.tag_list", $mP);
    }
    function bindEventHandler() {
        gnbInspectorViewScript.init($Object);  // gnb controller 초기화

        snbInspectorViewScript.init($Object);  // snb controller 초기화
    }
    function getDocuments() {
        // 가이드 도큐먼트를 가져온다
        $Object.selectGuideFiles();
        /** 주의 1/3 : 화면 상황에 따라 공통된 스크립트 파일이 있는 경우에만 호출 **/
        $Object.selectGuideScripts(renderGuideDocuments, clearGuideDocument);
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
        /*** 주의 2/3 : 여기부터 화면 전용 시작 ***/
        var url = contextPath + "/biz/video/videoDownload.do?jobId=" + data.jobInfo.jobId;
        $(".videoBox .video", $mP).attr("src", url);
        $($('.video')[0]).on('error', function (event){
            $.alert("원본 데이터 파일을 불러오지 못했습니다."); // 원본 이미지를 불러오지 못했습니다.
            $(this).off(event);
        });
        $($('.video')[0]).one('loadstart', function() {
            MindsJS.commIndicator.show();

        })
        $($('.video')[0]).one('loadeddata',function() {
            //video객체가 완전히 로드된 후
            MindsJS.commIndicator.hide();
        });
        /*** 주의 2/3 : 여기까지 화면 전용 끝 ***/

        getAnnotationData();
        refreshData();
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
        if(!$.isEmptyObject(data) && data.docType == 'S') {
            $("div.scrt_txt", $mP).html($.templates("#videoCommScriptTemplate").render(data.documents));
        } else {
            clearGuideDocument();
        }
    }
    function clearGuideDocument() {
        $("div.scrt_txt", $mP).html("");
    }
    /*** 주의 3/3 : 여기까지 화면 전용 끝 ***/

    function refreshData() {
        resetEventHandler();
    }
    function resetEventHandler() {
        MindsStyle.bindEventHandler();
    }

    /* Tool Menu 에 따른 개별 동작 등록 (menu code로 구분) */
    // function menuCallback($this) {
    //     var tagType = $this.data("btn-id");
    //     // text 입력 영역 추가
    //     if(tagType == 0) {
    //         getEmptyTextBox();
    //     }
    //     // annotation 영역 이벤트를 위해 handler reset
    //     resetEventHandler();
    // }
    // function getEmptyTextBox() {
    //     $tagController.addWriteAnnotation();
    //
    //     // 값을 저장할 시점을 찾아야 한다.
    //     $Object.setDatsSet(annotationToDataSet());
    // }

    // function annotationToDataSet() {
    //     var dataSet = [];
    //     let $tagList = $("li", $tagController);
    //     if(!$.isEmptyObject($tagList)) {
    //         $tagList.each(function(i, item) {
    //             let data = $(item).exportWriteAnnotationData();
    //             if(!$.isEmptyObject(data)) {
    //                 dataSet.push(data);
    //             }
    //         });
    //     }
    //     return dataSet;
    // }

    function getAnnotationData() {
        $Object.selectWorkData(function(data) {
            console.log(data);
            $tagController.renderWriteAnnotations(data);
            resetEventHandler();
        });
    }

    function failCallback(result) {
        console.log(result);
    }

    return {
        init: init
    }
})();