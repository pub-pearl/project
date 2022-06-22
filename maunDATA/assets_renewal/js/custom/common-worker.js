// 작업자가 작업을 진행하면서 필요한 데이터 관리를 일원화 하기 위한 기능 스크립트 정의
(function ($) {
    // $.getEventPool = function() {
    //     if($.eventPool == null) $.eventPool = new DataBuilderEventPool();
    //     return $.eventPool;
    // }
    // project를 Front에서 객체로 활용하기 위한 초기화
    $.fn.initProject = function(settings) {
        var $this = $(this);
        var _object = new CommandJS.createJobInfo($this, settings);
        gnbWorkerViewScript.init(_object);
        if(!$.isEmptyObject(settings) && typeof settings.menuCallback === 'function') {
            snbWorkerViewScript.init(_object);
            snbWorkerViewScript.renderToolMenu(settings.menuCallback);
        }
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
            updateData : function(uuid, data) {
                let target = dataset.annotations.find(function(item) {
                    return item.uuid === uuid;
                });
                var content = target.content[0];
                content.content = [data.Box.x, data.Box.y, data.Box.w, data.Box.h ];
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
        // that._jobType = settings.jobType;
        // that._jobClassName = settings.jobClassName ? settings.jobClassName : "";
        that._errorHandler = settings.errorHandler;
        that._modalCallbak = settings.modalCallback;
        that._reloadData = settings.reloadData;
        that._exportData = settings.exportData;
        that._reloadCallback = settings.reloadCallback;
        that._callback = settings.nextCallback;
        that._isInteraction = $this != null;

        let jobInfo = {};
        let jobContextInfo = {};

        let requestApi = {
            // about job
            requestAssignJob:   prefixUri+"/getCurrentJob.json",        // job을 할당 받는다

            requestInspect:     prefixUri+"/requestInspect.json",
            requestIgnore:      prefixUri+"/requestIgnore.json",
            requestGiveupTask:  prefixUri+"/requestGuveup.json",
            requestRework:      prefixUri+"/requestRework.json",        // 수정 가능한 모드로 변경 (->MF)
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
            saveAnnotation:         prefixUri+"/saveWorkData.json",
            selectAnnoation:        prefixUri+"/selectWorkData.json",
            removeAnnotation:       prefixUri+"/removeWorkData.json",
            clearAnnotations:       prefixUri+"/clearWorkData.json"

            // about specificate
        };

        init();
        function init() {
            // var projectTypeName = "/"
            // if(!$.isEmpty(that._projectType)) {
            //     if(that._projectType == 'S') projectTypeName = "/sound";
            //     else if(that._projectType == 'T') projectTypeName = "/text";
            //     else if(that._projectType == 'P') projectTypeName = "/image";
            //     else if(that._projectType == 'V') projectTypeName = "/video";
            //     else {
            //         $.alert("지원하지 않는 데이터 타입입니다. ["+libVersion+"]");
            //         that = null;
            //         return;
            //     }
            // }
            // else {
            //     $.alert("프로젝트 타입을 지정해 주세요.");
            //     that = null;
            //     return;
            // }
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
            if(!$.isEmptyObject(parameter)) { param.jobId = parameter.jobId; }
            MindsJS.loadJson(
                requestApi.requestAssignJob
                , param
                , function(result) {
                    if(result.success) {
                        jobInfo = result.data;
                        if(jobInfo != null) {
                            // 반려 상태일 때 처리를 전역으로 할지, 각 작업 페이지로 넘길지
                            var cmt_box = $(document).find("div.cmt_box");
                            if(jobInfo.jobStatus == 'RJ') {
                                if(!$.isEmptyObject(cmt_box)) {
                                    if (!$.isEmpty(jobInfo.rejectComment)) {
                                        cmt_box.addClass("open");
                                        cmt_box.find("textarea.textarea").html(jobInfo.rejectComment);
                                    } else {
                                        cmt_box.removeClass("open");
                                        cmt_box.find("textarea.textarea").html("코멘트가 없습니다.");
                                    }
                                } else {
                                    // 해당 영역이 없는 경우
                                }

                                $.alert(
                                    "작업이 반려되었습니다.<br>검수자의 요청에 따라 수정해주세요."
                                    , null
                                    , "알림"
                                    , "확인"
                                );
                            }
                            else {
                                cmt_box.removeClass("open");
                                cmt_box.find("textarea.textarea").html("코멘트가 없습니다.");
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
                    ,projectType: that._projectType
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

        // 내가 작업한 내용을 저장한다
        function saveAnnotation(callback) {
            // 값을 저장할 시점을 찾아야 한다.
            // dataset.setData(that._exportData());
            if(typeof that._exportData === 'function') {
                that._exportData();
            }
            var param = {
                projectId : that._projectId
                , jobId : jobInfo.jobId
                , workId : jobInfo.workId
                , jobAtchContextId : jobContextInfo.contextId
                , jobAtchFileId : jobContextInfo.atchFileId
                , annotations : convertMapToJson2(dataset.getData())
            };
            MindsJS.loadJson(
                requestApi.saveAnnotation
                , param
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

        // 선택한 어노테이션 항목 삭제
        function removeWorkData(contextId) {
            var param = {
                projectId : that._projectId
                , jobId : jobInfo.jobId
                , workId : jobInfo.workId
                , contextId : contextId
            };
            MindsJS.loadJson(
                requestApi.removeAnnotation
                , param
                , null
                , true
            );
        }

        // 전체 어노테이션 항목 삭제
        function clearWorkData(callback) {
            var param = {
                projectId : that._projectId
                , jobId : jobInfo.jobId
                , workId : jobInfo.workId
                , jobAtchContextId : jobContextInfo.contextId
            };
            MindsJS.loadJson(
                requestApi.clearAnnotations
                ,param
                , callback
                , true
            );
        }

        // 파일 패키지 JOB의 경우 해당 패키지 내 전체 어노테이션 항목 삭제
        function clearWorkElementData(workContextId) {
            var param = {
                projectId : that._projectId
                , jobId : jobInfo.jobId
                , workId : jobInfo.workId
                , workContextId : workContextId
            };
            MindsJS.loadJson(
                requestApi.clearAnnotations
                , param
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

        // 검수 요청
        function requestInspectForWork() {
            var param = jobInfo;
            param.projectId = that._projectId;
            MindsJS.loadJson(requestApi.requestInspect, param, function(result){
                if(result.success) {
                    if(typeof that._callback === 'function') {
                        that._callback(result);
                    }
                } else {
                }
            });
        }

        // 작업불가 요청
        function requestIgnoreForWork(comment) {
            var param = jobInfo;
            param.projectId = that._projectId;

            if(comment != null) param.comment = comment;
            MindsJS.loadJson(requestApi.requestIgnore, param, function(result){
                if(result.success) {
                    if(typeof that._callback === 'function') {
                        that._callback(result);
                    }
                } else {
                }
            });
        }

        // 수정하기 모드변경
        function requestRework() {
            // if(jobInfo.jobStatus != 'RQ' && jobInfo.jobStatus != 'IM') {
            //     $.alert("방금 검수자가 검수를 시작했으므로 수정할 수 없습니다.");
            //     return;
            // } else {
                $.confirm(
                    "검수요청을 철회하고 재작업 하시겠습니까?<br>재작업 후에는 작업완료 버튼을 다시 눌러야 합니다.",
                    function() {
                        var param = jobInfo;
                        param.projectId = that._projectId;
                        MindsJS.loadJson(requestApi.requestRework, param, function(result){
                            if(result.success) {
                                if(typeof that._reloadCallback === 'function') {
                                    that._reloadCallback();

                                }
                            } else {
                            }
                        });
                    }
                );
            // }
        }

        // Give UP
        function requestGiveupTask() {
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
            clearDataSet: dataset.cleanData,
            updateData: dataset.updateData,
            getAnnotationTools: getAnnotationTools,
            requestAssignJob: requestAssignJob,
            reloadData : reloadData,
            reloadThisJob: reloadThisJob,
            getCurrentJobContext: getCurrentJobContext,
            selectMyJobList: selectMyJobList,
            selectGuideDocument: selectGuideDocument,
            selectGuideFiles: selectGuideFiles,
            selectGuideScripts: selectGuideScripts,
            selectCurrentContents: selectCurrentContents,
            saveAnnotation: saveAnnotation,
            selectWorkData : selectWorkData,
            removeWorkData: removeWorkData,
            clearWorkData: clearWorkData,
            requestInspectForWork: requestInspectForWork,
            requestIgnoreForWork: requestIgnoreForWork,
            requestGiveupTask: requestGiveupTask,
            requestRework: requestRework,
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