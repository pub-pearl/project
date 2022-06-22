// FIXME 변수 workData는 coding sample용 데이터로써 확인 후 삭제 요망.
var workData = [
    {
        "idx" : 1,
        "contentId" : "WCID_000000315",
        "content" : "SB_W_2",
        "contentType" : "string",
        "contentCtg" : "weather",
        "status" : "",
        "uuid" : "uuid_CTNT_000000001",
        "childContent" : null
    },
    {
        "idx" : 2,
        "contentId" : "WCID_000000316",
        "content" : "SB_T_1",
        "contentType" : "string",
        "contentCtg" : "time",
        "status" : "",
        "uuid" : "uuid_CTNT_000000002",
        "childContent" : null
    },
    {
        "idx" : 3,
        "contentId" : "WCID_000000317",
        "content" : [
            {
                "idx" : 1,
                "contentId" : "",
                "content" : [10, 10, 50, 50],
                "contentType" : "array",
                "contentCtg" : "box",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 2,
                "contentId" : "",
                "content" : [[10, 10, 20, 20, 30, 30, 40, 40], [100, 100, 200, 200, 300, 300, 400, 400]],
                "contentType" : "array",
                "contentCtg" : "segment",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx": 3,
                "contentId": "",
                "content": "SB_1_1", // 1 1톤화몰
                "contentType": "string",
                "contentCtg": "category",
                "status": "",
                "uuid": "",
                "childContent": []
            },
            {
                "idx" : 4,
                "contentId" : "",
                "content" : "SB_2_3", // 3 폭연장
                "contentType" : "string",
                "contentCtg" : "illegal",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 5,
                "contentId" : "",
                "content" : "SB_3_1", // 1 덮개 무
                "contentType" : "string",
                "contentCtg" : "cover",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 6,
                "contentId" : "",
                "content" : "SB_4_2", // 2 플라스틱
                "contentType" : "string",
                "contentCtg" : "payload",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 7,
                "contentId" : "",
                "content" : "SB_5_3", // 3 아님
                "contentType" : "string",
                "contentCtg" : "curve",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            }
        ],
        "contentType" : "object",
        "contentCtg" : "noa",
        "status" : "RQ",
        "uuid" : "uuid_CTNT_000000003",
        "childContent" : []
    },
    {
        "idx" : 4,
        "contentId" : "WCID_000000318",
        "content" : [
            {
                "idx" : 1,
                "contentId" : "",
                "content" : [100, 100, 50, 50],
                "contentType" : "array",
                "contentCtg" : "box",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 2,
                "contentId" : "",
                "content" : [100, 100, 20, 20, 30, 30, 40, 40],
                "contentType" : "array",
                "contentCtg" : "segment",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx": 3,
                "contentId": "",
                "content": "SB_1_2",
                "contentType": "string",
                "contentCtg": "category",
                "status": "",
                "uuid": "",
                "childContent": []
            },
            {
                "idx" : 4,
                "contentId" : "",
                "content" : "SB_2_2",
                "contentType" : "string",
                "contentCtg" : "illegal",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 5,
                "contentId" : "",
                "content" : "SB_3_2",
                "contentType" : "string",
                "contentCtg" : "cover",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 6,
                "contentId" : "",
                "content" : "SB_4_2",
                "contentType" : "string",
                "contentCtg" : "payload",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            },
            {
                "idx" : 7,
                "contentId" : "",
                "content" : "SB_5_2",
                "contentType" : "string",
                "contentCtg" : "curve",
                "status" : "",
                "uuid" : "",
                "childContent" : null
            }
        ],
        "contentType" : "object",
        "contentCtg" : "noa",
        "status" : "RJ",
        "uuid" : "uuid_CTNT_000000004",
        "childContent" : [{"idx" : 0,"contentId" : "","content" : "코멘트11 입니다.","contentType" : "string","contentCtg" : "comment","status" : "RQ","uuid" : "","childContent" : null},{"idx" : 0,"contentId" : "","content" : "코멘트22 입니다.","contentType" : "string","contentCtg" : "comment","status" : "DN","uuid" : "","childContent" : null}]
    }
];
// FIXME drawingData = 현재는 sample 데이터 임. 실제 저장할 데이터로 변경 요함.
var drawingData = [
    {
        "idx": 1,
        "contextId": "WCID_000000317",
        "Box": {
            "x": 23.63527954501675,
            "y": 64.57908115232155,
            "w": 123.98820600950329,
            "h": 134.06583963053035
        },
        "Segmentation": [
            [23.6, 64.5, 123.9, 135.3, 13.5, 16.7],
            [23.6, 64.5, 123.9, 135.3, 13.5, 16.7]
        ],
        "color": "#00ffa7",
        "category_id": null,
        "category_name": null,
        "uuid": null
    },
    {
        "idx": 2,
        "contextId": "WCID_000000318",
        "Box": {
            "x": 23.63527954501675,
            "y": 64.57908115232155,
            "w": 123.98820600950329,
            "h": 134.06583963053035
        },
        "Segmentation": [
            [23.6, 64.5, 123.9, 135.3, 13.5, 16.7],
            [23.6, 64.5, 123.9, 135.3, 13.5, 16.7]
        ],
        "color": "#00ffa7",
        "category_id": null,
        "category_name": null,
        "uuid": null
    },
    {
        "idx": 3,
        "contextId": "WCID_000000319",
        "Box": {
            "x": 73.63527954501675,
            "y": 104.57908115232155,
            "w": 123.98820600950329,
            "h": 134.06583963053035
        },
        "Segmentation": [
            [23.6, 64.5, 123.9, 135.3, 13.5, 16.7],
            [23.6, 64.5, 123.9, 135.3, 13.5, 16.7]
        ],
        "color": "#00ffa7",
        "category_id": null,
        "category_name": null,
        "uuid": null
    }
];
var imageNoahWorkerScript = (function() {
    var $mP;
    var $Object;
    var $tagController;

    // 공통 만들고 삭제할 내용
    var projectType = "P";
    var defaultJobType = "NB";
    var jobClassName = "noahsnc";

    var settings = {};
    let dataset = {
        annotations: [],
        annotation: {
            idx: 0, contentId: '', content: '', contentType: '', contentCtg: '', status: '', uuid : '', childContent: []
        },
        cloneDataSet() {
            for(let key in this.annotation) {
                if(key == 'idx') this.annotation[key] = 0;
                else if(key == 'childContent') this.annotation[key] = [];
                else this.annotation[key] = '';
            }
            return JSON.parse(JSON.stringify(this.annotation));
        }
    }
    function init() {
        $mP = $("div#wrap");
        $Object = $mP.initProject({
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
        // setSaveData(); // FIXME 삭제필요.
    }
    function setController() {
        // 툴에 관한 세팅은 여기서 모두 정한다
        settings.uiType = "renewalObjectTemplate";

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
    /* 작업을 위한 Resource와 Contents를 화면에 표시한다 */
    function renderJobContents(data) {
        // 임시저장, 수정하기, 완료
        gnbWorkerViewScript.setProcess(data.jobInfo);

        /*** 주의 2/3 : 여기부터 화면 전용 시작 ***/

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

    }
    /*** 주의 3/3 : 여기까지 화면 전용 끝 ***/
    function removeWorkData() {
        var activeAnnotation = $("ul.tag_list", $mP).find("li.active");
        if(!$.isEmptyObject(activeAnnotation) && activeAnnotation.length > 0) {
            $.confirm("삭제한 내용은 다시 복구 할 수 없습니다.<br>선택한 내용을 삭제하시겠습니까?", function() {
                var contextId = activeAnnotation.find(".tagBox").data("contextId");
                var uuid = activeAnnotation.find(".tagBox").data("uuid");
                if(!$.isEmpty(contextId)) {
                    // 서버에서 해당 context 를 지운다
                    $Object.removeWorkData(contextId);
                }
                activeAnnotation.remove();
                $Object.removeDataSet(uuid);
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
            }
        });
    }
    function refreshData() {
        resetEventHandler();
        gnbWorkerViewScript.loadJobHistory(getContext, failCallback);
    }
    function resetEventHandler() {
        MindsStyle.bindEventHandler();
    }

    /* Tool Menu 에 따른 개별 동작 등록 (menu code로 구분) */
    function menuCallback($this) {
        var tagType = $this.data("btn-id");
        // text 입력 영역 추가
        if(tagType == 0) {
        }
        // annotation 영역 이벤트를 위해 handler reset
        resetEventHandler();
    }

    function annotationToDataSet() {
        // var dataSet = [];
        // let $tagList = $("li", $tagController);
        // if(!$.isEmptyObject($tagList)) {
        //     $tagList.each(function(i, item) {
        //         let data = $(item).exportWriteAnnotationData();
        //         if(!$.isEmptyObject(data)) {
        //             dataSet.push(data);
        //         }
        //     });
        // }
        // return dataSet;
    }

    function getAnnotationData() {
        $Object.selectWorkData(function(data) {
            $Object.setDatsSet(data);
            $tagController.renderClientAnnotations(data);
            resetEventHandler();

            setWorkData(data);  // FIXME workData to drawingData
            console.log('setSaveData', setSaveData()) // drawingData to workData
        });
    }

    /** display work data */
    function setWorkData(workData) {
        var workingData = []; // FIXME 확인용 코드임. 삭제 요망.
        $tagController.html("");
        // setting a object html with categories
        // $objectHtml = $.templates("#objectTemplate").render(category);
        if(!$.isEmptyObject(workData)) {
            // var contentList = workData[0].content;
            var contentList = workData;
            if(typeof contentList === 'object') {
            // if(typeof item === 'object') {
                let idx = 1;
                var objCurrNum = 0;
                contentList.forEach(item => {
                    if(!$.isEmptyObject(item)) {
                        if(item.contentCtg == 'weather') {
                            item.category = metaCategory.W;
                            var $objectHtmlTemp = $.templates("#metaDataTemplate").render(item);
                            var $workData = $tagController.append($objectHtmlTemp);
                            if(!$.isEmptyObject(item.content)) {
                                $workData.find("select[name="+item.contentCtg+"]").last().val(item.content);
                            }
                        }
                        else if(item.contentCtg == 'time') {
                            item.category = metaCategory.T;
                            var $objectHtmlTemp = $.templates("#metaDataTemplate").render(item);
                            var $workData = $tagController.append($objectHtmlTemp);
                            if(!$.isEmptyObject(item.content)) {
                                $workData.find("select[name="+item.contentCtg+"]").last().val(item.content);
                            }
                        }
                        else if(item.contentCtg == 'noa') { // object 세팅
                            item.category = category;
                            var $objectHtmlTemp = $.templates("#renewalObjectTemplate").render(item);
                            var $workData = $tagController.append($objectHtmlTemp);

                            if(!$.isEmptyObject(item.content)) {
                                let workingDataSet = {};
                                workingDataSet.idx = idx++;
                                workingDataSet.contextId = item.contentId;
                                workingDataSet.uuid = item.uuid;
                                //workingDataSet.color = ''; // TODO set color
                                item.content.forEach(content => {
                                    if(content.contentCtg === 'box') {
                                        let box = content.content;
                                        workingDataSet.Box = {};
                                        workingDataSet.Box.x = box[0];
                                        workingDataSet.Box.y = box[1];
                                        workingDataSet.Box.w = box[2];
                                        workingDataSet.Box.h = box[3];
                                    } else if(content.contentCtg === 'segment') {
                                        workingDataSet.Segmentation = content.content;
                                    } else {
                                        if(content.contentCtg === 'category') { // 차량 종류
                                            workingDataSet.category_id = content.content;
                                            objCategory.forEach(ctg => {
                                                if(ctg.code == content.content) workingDataSet.category_name = ctg.codeName;
                                            });
                                        }
                                        $workData.find("select[name="+content.contentCtg+"]").last().val(content.content); // setting html
                                    }
                                });
                                workingData.push(workingDataSet);
                            }

                        }
                        else {

                        }
                    }
                    objCurrNum++;
                });
            }
        }
    }

    function setSaveData() {
        // setting weather & time
        const $weather = $('select[name="weather"]', $mP);
        setData(1, $weather.data('contextid'), $weather.val(), 'string', 'weather', '', $weather.data('uuid'));
        const $time = $('select[name="time"]', $mP);
        setData(2, $time.data('contextid'), $time.val(), 'string', 'time', '', $time.data('uuid'));

        // setting a object
        // FIXME saveData = sample 데이터 임. 실제 저장할 데이터로 변경 후 삭제 요함.
        drawingData.forEach(function (v,i) {
            var contentArray = []; // box, seg, categories를 담을 변수
            // box
            const box = v.Box;
            setContentData(contentArray, 1, [box.x, box.y, box.w, box.h], 'array', 'box');
            // segment
            setContentData(contentArray, 2, v.Segmentation, 'array', 'segment');

            // obj categories
            let ctgValue, idx = 3;
            const $uuidObj = $('#'+v.uuid, $mP);
            contentCtgs.forEach(val => {
                ctgValue = $uuidObj.find('select[name='+val.ctg+']').val();
                setContentData(contentArray, idx++, ctgValue, 'string', val.ctg);
            });
            // push object to dataset.annotations
            setData(v.idx+2, v.contextId, contentArray, 'object', 'noa', v.status ,v.uuid);
        });

        return dataset.annotations;
    }

    function setData(idx, contentId, content, contentType, contentCtg, status, uuid) {
        var saveDataSet = dataset.cloneDataSet();

        saveDataSet.idx = idx;
        saveDataSet.contentId = contentId;
        saveDataSet.content = content;
        saveDataSet.contentType = contentType;
        saveDataSet.contentCtg = contentCtg;
        saveDataSet.status = status;
        saveDataSet.uuid = uuid;
        dataset.annotations.push(saveDataSet);
    }

    /**
     * setting content of a object
     * @param contentArray : object detail(box,seg,ctg)
     * @param idx : 1=box / 2=seg / 3~=category
     * @param content
     * @param contentType
     * @param contentCtg
     */
    function setContentData(contentArray, idx, content, contentType, contentCtg) {
        var contentDataSet = dataset.cloneDataSet();

        contentDataSet.idx = idx;
        contentDataSet.content = content;
        contentDataSet.contentType = contentType;
        contentDataSet.contentCtg = contentCtg;
        contentArray.push(contentDataSet);
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
