let imageWorkerScript = (function() {
    let $mP;
    let $Object;
    let $UI;
    let $tagController;

    let selectedClass = { category_id: '', category_name: '' };

    let jobInfo;
    let settings = {};

    let defaultDrawMode;

    let hexColorList = ["#00ffa7","#dffc66","#d314cc","#ff91b3","#6c9ff0","#142eb4","#fd0d7c","#e67864","#32ce39","#0dceb8"];
    let colorTicket = 0;

    function init() {
        $mP = $("div#wrap");
        $Object = $mP.initProject({
            projectId: gProjectId,
            projectType: 'P',
            exrpotData: annotationToDataSet,    // save 관련 기능
            reloadData: getAnnotationData,      // load 관련 기능
            reloadCallback: reloadJob,          // history 관련 기능
            nextCallback: saveResult,           // save 관련 기능
            menuCallback: menuCallback,         // menu callback
        });
        $UI = $mP.regDrawingUx({
            useTool: ["BBox", "Segment"],
            operationCallback: {
                leftClick: leftClickFromCanvas,
                dragAndDraw: dragAndDrawFromCanvas,
                rightClick: rightClickFromCanvas
            },
            redraw: null
        });

        bindEventHandler();
        getDocuments();
        setController();
        getCurrentJob();
    }
    function bindEventHandler() {
        $(".btn_select_delete", $mP).one("click", removeWorkData);  // annotation 개별 삭제
        $(".btn_all_delete", $mP).one("click", clearWorkData);      // annotation 일괄 삭제 (현재 Job Resource 기준)
    }
    function menuCallback($this) {
    }
    // 가이드 문서를 가져온다
    function getDocuments() {
        $Object.selectGuideFiles();
        /** 주의 1/3 : 화면상황에 따라 공통 스크립트가 있으면 여기 구현 **/
    }
    function setController() {
        $mP.regAnnotatinUx({
            uiType : "renewalObjectTemplate"
        });
        $tagController = $("div.tab_cont ul.tag_list", $mP);
    }

    /***
     * Get Job's Information
     */
    function getCurrentJob() {
        $Object.dataSetInit();
        $Object.requestAssignJob(getContext, failCallback);
    }
    function getContext() {
        $Object.getCurrentJobContext(renderJobContents);
    }
    function renderJobContents(data) {
        jobInfo = data.jobInfo;
        // 임시저장, 수정하기, 완료 버튼의 활성화 여부를 세팅
        gnbWorkerViewScript.setProcess(jobInfo);

        // frame이 필요한 경우 여기에서 Render
        let isFrame = false;
        if(isFrame) {}

        /** 화면전용 **/
        /** //여기까지 화면전용 **/

        // get work data
        getAnnotationData();
        // refreshData();
    }

    function removeWorkData() {

    }
    function clearWorkData() {

    }

    function annotationToDataSet() {

    }
    function getAnnotationData() {

        $Object.selectWorkData(function(data) {
            data.forEach(function(v, i) {
                v.color = hexColorList[colorTicket++%hexColorList.length];
            });
            $Object.setDatsSet(data);

        });
    }
    function reloadJob() {

    }
    function saveResult() {

    }

    // drawing
    function leftClickFromCanvas() {

    }
    function dragAndDrawFromCanvas() {

    }
    function rightClickFromCanvas() {

    }

    // Generic function
    function failCallback() {}


    return {
        init: init
    }
})();