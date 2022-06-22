// 작업자가 작업을 진행하면서 필요한 데이터 관리를 일원화 하기 위한 기능 스크립트 정의
(function ($) {
    // project를 Front에서 객체로 활용하기 위한 초기화
    $.fn.initClientProject = function(settings) {
        var $this = $(this);
        var _object = new CommandJS.createJobInfo($this, settings);
        return _object;
    };
    $.appendObjectUrl = function(contextList) {
        if($.isEmptyObject(contextList)) {
            return;
        }
        $.each(contextList, function (i, v) {
            var image64 = v.atchFile;
            if($.isEmpty(image64)) {
                $.alert("원본 데이터 파일을 불러오지 못했습니다."); // 원본 이미지를 불러오지 못했습니다.
                return;
            }
            var base64ImageContent = image64.replace(/^data:image\/(png|jpeg);base64,/, "");
            var extType = v.extName == ".png"? "image/png" : "image/jpeg";
            var thumbnailBlob = $.base64ToBlob(base64ImageContent, extType);

            var blobUrl = URL.createObjectURL(thumbnailBlob);
            v["thumbSourceBlob"] = blobUrl;
        });
    };
    $.base64ToBlob = function(base64, mime) {
        return CommandJS.base64ToBlob(base64, mime);
    };
})(jQuery);

var CommandJS = (function() {
    var libVersion = 2.0;
    var prefixUri = "/biz";
    function createJobInfo($this, settings) {
        let dataset = {
            annotations : [],
            annotation : {
                idx:0, contentId:'', content:'', contentType:'', contentCtg:'', status:'', childContent: []
            },
            init : function() {
                // 변수 초기화
                dataset.annotations = [];
            },
            addData : function(data) {
                let localAnnotation = {};
                for(let i in data) {
                    if(i === 'childContent') {
                        let child = [];
                        for(let j in data[i]) {
                            child[j] = data[i][j];
                        }
                        localAnnotation[i] = child;
                    } else {
                        localAnnotation[i] = data[i];
                    }
                    dataset.annotations.push(localAnnotation[i]);
                }
            },
            setData : function(data) {
                dataset.cleanData();
                dataset.addData(data);
            },
            getData : function() {
                return dataset.annotations;
            },
            removeData : function(uuid) {
                if(dataset.annotations.length > 0) {
                    let target = dataset.annotations.find(function(item) {
                        return item.uuid === uuid;
                    });
                    const idx = dataset.annotations.indexOf(target);
                    if (idx > -1) dataset.annotations.splice(idx, 1);
                }
            },
            cleanData : function() {
                dataset.init();
            },
            cloneTemplate : function() {
                let cloneData = {};
                for(let i in dataset.annotation) {
                    if(i === 'childContent') {
                        let child = [];
                        for(let j in dataset.annotation[i]) {
                            child[j] = dataset.annotation[i][j];
                        }
                        cloneData[i] = child;
                    } else {
                        cloneData[i] = dataset.annotation[i];
                    }
                }
                return cloneData;
            }
        }

        let that = this;
        // properties
        that._projectId = settings.projectId;
        that._projectType = settings.projectType;
        that._jobType = settings.jobType;
        that._jobClassName = settings.jobClassName ? settings.jobClassName : "";
        that._errorHandler = settings.errorHandler;
        that._modalCallbak = settings.modalCallback;
        that._reloadData = settings.reloadData;
        that._reloadCallback = settings.reloadCallback;
        that._callback = settings.nextCallback;
        that._isInteraction = $this != null;

        let jobInfo = {};
        let jobContextInfo = {};

        let requestApi = {
            // about job
            requestAssignJob:   prefixUri+"/getCurrentJob.json",        // job을 할당 받는다
            requestAssignJobCount:   prefixUri+"/getCurrentJobCount.json",        // job을 할당 받는다

            confirmJob: prefixUri+"/confirm.json",
            rejectJob: prefixUri+"/reject.json",
            selectMyJobList:    prefixUri+"/selectMyJobHistory.json",

            // about ui
            selectAnnotationTool:   "/wspace/selectAnnotationTools.json",

            // about guide
            loadGuideDocContents:   "/guide/getGuideDocumentContents.json",
            loadGuideDocFiles:      "/guide/getGuideDocumentFiles.json",
            loadGuideDocScripts:    "/guide/getGuideDocumentScripts.json",

            getContext:             prefixUri+"/getContext.json",           // job의 기본정보를 가져온다
            getContents:            prefixUri+"/getSelectedImage.json",

            // about data
            selectAnnoation:        prefixUri+"/selectWorkData.json",
            saveInspection:        prefixUri+"/saveInspection.json"

            // about specificate
        };

        init();
        function init() {
        }

        // about button action

        /** about common data **/
        // 필요한 툴 목록을 가져온다 (snb에서 사용)
        function getAnnotationTools(callback) {
            var param = {
                projectId : that._projectId
            };
            MindsJS.loadJson(
                requestApi.selectAnnotationTool,
                param,
                function(result) {
                    var data = {
                        menu : result.data
                    }
                    if(typeof callback === 'function') {
                        callback(data);
                    }
                }
            );
        }
        // get job
        function requestAssignJob(callback, failCallback, parameter) {
            var param = { projectId : that._projectId };
            if(!$.isEmptyObject(parameter)) {
                param.jobId = parameter.jobId;
                param.type  = parameter.type;
            }
            MindsJS.loadJson(
                requestApi.requestAssignJob
                , param
                , function(result) {
                    if(result.success) {
                        jobInfo = result.data;
                        if(jobInfo != null) {
                            if(jobInfo.jobStatusStr != '') $('.job_status').text(jobInfo.jobStatusStr);
                            else $('.job_status').text('작업전');

                            if(jobInfo.workerId != null && jobInfo.workerId != '') $('.workerId').text(jobInfo.workerId);
                            else $('.workerId').text('');

                            if(jobInfo.jobStatus == 'RQ' || jobInfo.jobStatus == 'IS' || jobInfo.jobStatus == 'RJ') {
                                var cmt_box = $(document).find("div.cmt_box");
                                if(!$.isEmptyObject(cmt_box)) {
                                    if (!$.isEmpty(jobInfo.rejectComment)) {
                                        cmt_box.addClass("open");
                                        cmt_box.find("textarea.textarea").val(jobInfo.rejectComment);
                                    } else {
                                        cmt_box.find("textarea.textarea").val("");
                                    }
                                } else {
                                    // 해당 영역이 없는 경우
                                }
                            } else if(jobInfo.jobStatus == 'IM' || jobInfo.jobStatus == 'IC') {
                                var cmt_box = $(document).find("div.cmt_box");
                                if(!$.isEmptyObject(cmt_box)) {
                                    if (!$.isEmpty(jobInfo.rejectComment)) {
                                        cmt_box.addClass("open");
                                        cmt_box.find("textarea.textarea").val(jobInfo.rejectComment);
                                    } else {
                                        cmt_box.find("textarea.textarea").val("");
                                    }
                                } else {
                                    // 해당 영역이 없는 경우
                                }

                                var impossibleComment = jobInfo.comment;
                                $.commentBlock(
                                    "‘작업불가 지정’된 파일입니다.<br> 사유를 확인하고 승인, 또는 반려하세요."
                                    // , function(){}
                                    , null
                                    , impossibleComment
                                    ,"알림"
                                    ,"확인"
                                );
                            }

                            // job 정보로 UI 에 표시
                            if(typeof callback === 'function') {
                                callback(jobInfo);
                            }
                        } else {
                            $.alert("작업 가능한 프로젝트가 없습니다", function() {
                                MindsJS.movePage("/project/projectList.do");
                            });
                        }
                    } else {
                        jobInfo = {};
                        // 서버에서의 오류 응답 줄 때 (RestController에서 return fail()일 때)
                        if(typeof failCallback === 'function') {
                            failCallback(result);
                        }
                    }
                }
                , true
            );
        }
        // 이전,다음 작업이 있는지 확인
        function requestAssignJobCount(callback, param) {
            MindsJS.loadJson(
                requestApi.requestAssignJobCount
                , {
                    projectId : that._projectId
                    ,jobId : jobInfo.jobId
                    ,type : param.type
                }
                , function(result) {
                    if(result.success) {
                        if(result.data) {
                            callback();
                        } else {
                            if(param.type == 'N') {
                                $.alert('다음 작업이 없습니다.');
                            } else if (param.type == 'P') {
                                $.alert('이전 작업이 없습니다.');
                            }
                        }
                    }
                }
                ,true
            );
        }
        function reloadData() {
            if(typeof that._reloadData === 'function') {
                that._reloadData();
            }
        }
        function reloadThisJob(callback, failCallback) {
            var parameter = { jobId : jobInfo.jobId };
            requestAssignJob(callback, failCallback, parameter);
        }
        // job 기본정보, 파일정보나 포인트 정보
        function getCurrentJobContext(rendingContents) {
            MindsJS.loadJson(
                requestApi.getContext
                , {
                    projectId : that._projectId
                    ,jobId : jobInfo.jobId
                }
                , function(result) {
                    if(result.success) {
                        let data = result.data;
                        if(!$.isEmptyObject(data)) {
                            $(document).find("div.currentFile span").html(data.orgFileName);
                        }
                        // 작업 화면에서 콘텐츠를 그려준다
                        if(typeof rendingContents === 'function') {
                            data.jobInfo = jobInfo;
                            rendingContents(data);
                        }
                    }
                }
                ,true
            );
        }
        // 작업 가이드 목록을 가져온다 (워크 스페이스에서 보여지는 팝업 형)
        function selectGuideDocument(callback, failCallback) {
            MindsJS.loadJson(
                requestApi.loadGuideDocContents
                ,{ projectId : that._projectId }
                , function(result) {
                    if(result.success) {
                        if(typeof callback === 'function') {
                            callback(result.data);
                        }
                    } else {
                        // 필요하면 공통 오류 핸들러를 등록해 사용한다
                    }
                }
                , true
            );
        }
        // 작업 가이드 목록을 가져온다 (작업화면에서 다운로드 가능한 파일 형태의 다운로드 형)
        function selectGuideFiles() {
            MindsJS.loadJson(
                requestApi.loadGuideDocFiles
                ,{ projectId : that._projectId }
                , function(result) {
                    if(result.success) {
                        let data = result.data;
                        if(!$.isEmptyObject(data)) {
                            let $guideFileArea = $(document).find("div.guideFile").html($.templates("#commGuideFileTemplate").render(data.documents));
                            $guideFileArea.find(".btn_guide_download").one("click", function() {
                                // file download 기능
                                let fileId = $(this).data("fileId");
                                $.alert("가이드 파일을 준비중입니다.");
                            });
                        } else {
                            let $guideFileArea = $(document).find("div.guideFile").html($.templates("#emptyGuideFileTemplate").render());
                            $guideFileArea.find(".btn_guide_download").one("click", function() {
                                $.alert("가이드 파일이 없습니다.");
                            });
                        }
                    }
                }
                , true
            );
        }
        // 작업 가이드 목록을 가져온다 (공통 스크립트가 필요한 경우 이곳에 등록하고 사용)
        function selectGuideScripts(callback, failCallback) {
            MindsJS.loadJson(
                requestApi.loadGuideDocScripts
                ,{ projectId : that._projectId }
                , function(result) {
                    if(result.success) {
                        if(typeof callback === 'function') {
                            callback(result.data);
                        }
                    } else {
                        // 필요하면 공통 오류 핸들러를 등록해 사용한다
                    }
                }
                , true
            );
        }

        // 내가 진행한 작업 목록을 가져온다 (gnb에서 사용)
        function selectMyJobList(callback) {
            MindsJS.loadJson(
                requestApi.selectMyJobList
                ,{ projectId : that._projectId }
                , function(result) {
                    if(result.success) {
                        if(typeof callback === 'function') {
                            callback(result.data);
                        }
                    } else {
                        // 필요하면 공통 오류 핸들러를 등록해 사용한다
                    }
                }
                , true
            );
        }

        // job의 세부 contents 를 가져온다.
        function selectCurrentContents(atchFileId, callback, failCallback) {
            jobContextInfo = null;
            MindsJS.loadJson(
                requestApi.getContents,
                {
                    projectId : that._projectId
                    ,jobId : jobInfo.jobId
                    ,atchFileId : atchFileId
                },
                function(result) {
                    if(result.success) {
                        jobContextInfo = result.data;
                        if(typeof callback === 'function') {
                            callback(result.data);
                        }
                    } else {
                        // 서버에서의 오류 응답
                        if(typeof failCallback === 'function') {
                            failCallback();
                        }
                    }
                }, true
            );
        }


        function selectWorkData(callback) {
            var param = {
                projectId : that._projectId
                , jobId : jobInfo.jobId
                , workId : jobInfo.workId
                , jobAtchContextId : jobContextInfo.contextId
                , jobAtchFileId : jobContextInfo.atchFileId
            };
            MindsJS.loadJson(
                requestApi.selectAnnoation
                , param
                , function(result) {
                    if(result.success) {
                        if(typeof callback === 'function') {
                            dataset.setData(result.data);
                            callback(result.data);
                        }
                    } else {
                        // 필요하면 공통 오류 핸들러를 등록해 사용한다
                    }
                }
                , true
            );
        }

        // 검수 완료
        function confirmJob() {
            var param = jobInfo;
            param.projectId = that._projectId;
            MindsJS.loadJson(requestApi.confirmJob, param, function(result){
                if(result.success) {
                    if(typeof that._callback === 'function') {
                        that._callback(result);
                    }
                } else {
                }
            });
        }
        // 반려
        function rejectJob() {
            console.log("REJECT JOB");
            var param = jobInfo;
            var rejectComment = $("div.cmt_box textarea.textarea").val();
            param.projectId = that._projectId;

            if(rejectComment != null) {
                param.comment = rejectComment;
            }
            MindsJS.loadJson(requestApi.rejectJob, param, function(result){
                if(result.success) {
                    if(typeof that._callback === 'function') {
                        that._callback(result);
                    }
                } else {
                }
            });
        }

        function convertMapToJson2(parameter) {
            return JSON.stringify(parameter);
        }

        function getJobInfo() {
            return jobInfo;
        }

        return {
            dataSetInit : dataset.init,
            getDataSet: dataset.getData,
            appendDataSet: dataset.addData,
            setDatsSet: dataset.setData,
            cloneTemplate: dataset.cloneTemplate,
            removeDataSet: dataset.removeData,
            getAnnotationTools: getAnnotationTools,
            requestAssignJob: requestAssignJob,
            requestAssignJobCount: requestAssignJobCount,
            reloadData : reloadData,
            reloadThisJob: reloadThisJob,
            getCurrentJobContext: getCurrentJobContext,
            selectMyJobList: selectMyJobList,
            selectGuideDocument: selectGuideDocument,
            selectGuideFiles: selectGuideFiles,
            selectGuideScripts: selectGuideScripts,
            selectWorkData : selectWorkData,
            confirmJob: confirmJob,
            rejectJob: rejectJob,
            getJobInfo: getJobInfo
        }
    }

    //base64 -> blob 변환
    function base64ToBlob(base64, mime) {
        mime = mime || '';
        var sliceSize = 1024;
        var byteChars = window.atob(base64);
        var byteArrays = [];
        for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
            var slice = byteChars.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: mime });
    }

    return {
        createJobInfo: createJobInfo,
        base64ToBlob: base64ToBlob
    }

})();
