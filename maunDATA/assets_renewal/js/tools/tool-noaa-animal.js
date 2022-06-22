// DRAW 'NOAH' TOOL
(function ($) {
    // Annotation 추가
    $.fn.addClientAnnotation = function(data, type, callback) {
        return ClientToolJS.appendTag($(this), data, type, callback);
    };
    // Annotation Data Render
    $.fn.renderClientAnnotations = function(data, jobType, callback) {
        $(this).html("");
        if(!$.isEmptyObject(data)) {
            data.jobType = jobType;
            return ClientToolJS.renderAnnotationTag($(this), data, callback);
        } else {
            return ClientToolJS.appendClassification($(this));
        }
    };
    $.fn.exportClientAnnotationData = function(preData) {
        return ClientToolJS.getData($(this), preData);
    };
})(jQuery);

var ClientToolJS = (function() {
    var _uiType = "";

    var contentCtgs = [
        {ctg:'category' , grpCode:'ANMCTG_1'},
        {ctg:'temperature' , grpCode:'ANMCTG_2'}
    ];
    var metaCtgs = {
        'T' : {ctg:'type', empty:'데이터형식'}
    };
    var category = [];
    var metaCategory = {};

    var dataSet = [];
    var dataTemplate = {
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
    };

    function init(settings) {
        _uiType = settings.uiType || null;
        renderAllCategory();
    }
    function renderAllCategory() {
        renderCategory('T'); //  데이터형식
        contentCtgs.forEach(function (v,i){
            renderObjCategory(i, v, category);
        });
    }
    function renderCategory(code) {
        MindsJS.loadJson(
            '/biz/comm/selectCode.json',
            {grpCode: 'ANMCTG_'+code},
            function (result) {
                metaCategory[code] = metaCtgs[code];
                metaCategory[code].subCategory = result.data;
            }
        );
    }
    function renderObjCategory(cnt, contentCtg, category) {
        MindsJS.loadJson(
            '/biz/comm/selectCode.json',
            {grpCode: contentCtg.grpCode},
            function (result) {
                category[cnt] = {};
                category[cnt].empty = contentCtg.empty;
                category[cnt].contentCtg = contentCtg.ctg;
                category[cnt].subCategory = result.data;
            }
        );
    }
    // 새로운 Classification Annotation 을 목록에 추가한다.
    function appendClassification($workingArea) {
        var categories = [
            {idx : 0, category : metaCategory.T, uuid : $.genUuid() }
        ];
        var objectHtmlTemp = $.templates("#metaDataTemplate").render(categories);
        $workingArea.append(objectHtmlTemp);
    }
    // 새로운 오브젝트를 Annotation 목록에 추가한다
    function appendTag($workingArea, data, type, changeCallback) {
        var rtnData = [];
        var newItem = {};
        newItem.category = category;
        newItem.contentCtg = "noa";
        newItem.contentType = "object";
        newItem.uuid = data.uuid;
        newItem.idx = data.idx;
        newItem.status = "RQ";
        newItem.content = [];
        newItem.color = data.color;

        if(type == "B") {
            let contentDataSet = dataTemplate.cloneDataSet();
            contentDataSet.content = [data.Box.x, data.Box.y, data.Box.w, data.Box.h];
            contentDataSet.contentCtg = "box";
            contentDataSet.contentType = "array";
            contentDataSet.idx = 1;
            newItem.content[0] = contentDataSet;
        }
        if(type == "S") {
            let contentDataSet1 = dataTemplate.cloneDataSet();
            contentDataSet1.content = data.Segmentation;
            contentDataSet1.contentCtg = "segment";
            contentDataSet1.contentType = "array";
            contentDataSet1.idx = 2;
            newItem.content[1] = contentDataSet1;
        }

        let contentDataSet2 = dataTemplate.cloneDataSet();
        contentDataSet2.content = data.category_id;
        contentDataSet2.contentCtg = "category";
        contentDataSet2.contentType = "string";
        contentDataSet2.idx = 3;
        newItem.content[2] = contentDataSet2;

        let objectHtmlTemp = $.templates("#"+_uiType).render(newItem);
        let $workData = $workingArea.append(objectHtmlTemp);
        $workData.find("li").removeClass("active");
        $workData.find("li").last().addClass("active");

        // 목록 맨 밑으로 이동
        let activeListPosition = $workData.find("li").last().position();
        $workData.animate({scrollTop: $workData.scrollTop() + activeListPosition.top}, 200);

        if(!$.isEmptyObject(newItem.content)) {
            newItem.content.forEach(content => {
                $workData.find("select[name="+content.contentCtg+"]").last().val(content.content);
                $workData.find("select[name="+content.contentCtg+"]").last().removeClass("unselected");
            });
            $workData.find("select[name=category]").last().one("change", function() {
                // 바뀜
                newItem.content[2].content = $(this).val();
                data.category_id = $(this).val();
                data.category_name = $(this).children("option:checked").text();
                changeCallback(data);
            });
        }
        rtnData.push(newItem);
        return rtnData;
    }
    // 저장된 데이터로 Annotation 목록을 만든다
    function renderAnnotationTag($workingArea, data, changeCallback) {
        dataSet = data;
        $workingArea.html("");
        if(!$.isEmptyObject(data)) {
            var contentList = data;
            var isTypeData = false;
            if(typeof contentList === 'object') {
                var objCurrNum = 0;
                contentList.forEach(item => {
                    if(!$.isEmptyObject(item)) {
                        if(item.contentCtg == 'type') {
                            var $metaArea = $workingArea.find("li").children('[data-action="meta"]');
                            if(!$.isEmptyObject($metaArea)) {
                                $metaArea.parents("li:first").remove();
                            }
                            item.category = metaCategory.T;
                            var objectHtmlTemp = $.templates("#metaDataTemplate").render(item);
                            var $workData = $workingArea.append(objectHtmlTemp);
                            // var $workData = $workingArea.html(objectHtmlTemp);
                            if(!$.isEmptyObject(item.content)) {
                                $workData.find("select[name="+item.contentCtg+"]").last().val(item.content);
                            }
                            isTypeData = true;
                        }
                        else if(item.contentCtg == 'noa') {
                            item.category = category;
                            var objectHtmlTemp = $.templates("#"+_uiType).render(item);
                            var $workData = $workingArea.append(objectHtmlTemp);
                            if(!$.isEmptyObject(item.content)) {
                                let workingDataSet = {};
                                workingDataSet.idx = item.idx;
                                workingDataSet.contextId = item.contentId;
                                workingDataSet.uuid = item.uuid;
                                //workingDataSet.color = ''; // TODO set color
                                item.content.forEach(content => {
                                    if(content.contentCtg == 'box' && !$.isEmpty(content.content)) {
                                        $workData.find("button.btn_bounding_box").last().addClass("active");
                                    } else if(content.contentCtg == 'segment' && !$.isEmpty(content.content)) {
                                        $workData.find("button.btn_segmentation").last().addClass("active");
                                    } else {
                                        // $workData.find("select[name=" + content.contentCtg + "]").last().val(content.content);
                                        $workData.find("[name=" + content.contentCtg + "]").last().val(content.content);
                                    }
                                });
                                $workData.find("select[name=category]").one("change", function() {
                                    // 바뀜
                                    item.content[2].content = $(this).val();
                                    workingDataSet.category_id = $(this).val();
                                    workingDataSet.category_name = $(this).children("option:checked").text();
                                    changeCallback(workingDataSet);
                                });
                            }
                        }
                        else {}
                    }
                    objCurrNum++;
                });
                if(!isTypeData) {
                    appendClassification($workingArea);
                }
            }
        }
        return saveToDrawData(data);
    }
    function saveToDrawData(workData) {
        var rtnData = [];
        if(!$.isEmptyObject(workData)) {
            var contentList = workData;
            if(typeof contentList === 'object') {
                contentList.forEach(item => {
                    if(!$.isEmptyObject(item) && item.contentCtg == 'noa') { // object 세팅
                        if(!$.isEmptyObject(item.content)) {
                            let workingDataSet = {};
                            workingDataSet.idx = item.idx;
                            workingDataSet.contextId = item.contentId;
                            workingDataSet.uuid = item.uuid;
                            workingDataSet.color = item.color;
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
                                } else if(content.contentCtg === 'category') { // 동물 종류
                                    workingDataSet.category_id = content.content;
                                    category.forEach(ctg => {
                                       if(ctg.contentCtg == content.contentCtg) {
                                           ctg.subCategory.forEach(subCode => {
                                              if(subCode.code == content.content) {
                                                  workingDataSet.category_name = subCode.codeName;
                                              }
                                           });
                                       }
                                    });
                                }
                            });
                            rtnData.push(workingDataSet);
                        }
                    }
                });
            }
        }
        return rtnData;
    }
    // Annotation 항목에 필요한 핸들러 작성
    function bBoxEventHander($this) {

    }
    // Annotation 한 내용을 데이터로 변환할 때 호출
    function getData($this, preData) {
        let data = {
            idx:0, contentId:'', content:'', contentType:'', contentCtg:'', status:'', childContent: []
        };
        // if($this.has("div.ipt_txt").length > 0) {
        var contextId = $this.find("div.tagBox").data("contextId");
        var uuid = $this.find("div.tagBox").data("uuid");
        var category = $this.find("div.tagBox").data("category");

        data.idx = $("ul.tag_list li").index($this)*1;
        data.contentId = contextId;
        data.uuid = uuid;

        if(category == 'noa') {
            var contentArray = [];
            var boxData = [];
            var segData = [];
            preData.forEach(item => {
                if(item.contentCtg == 'noa' && item.uuid == uuid) {
                    // item.
                    item.content.forEach(content => {
                        if(content.contentCtg == 'box') {
                            boxData = content.content;
                        }
                        else if(content.contentCtg == 'segment') {
                            segData = content.content;
                        }
                    });
                }
            });
            setContentData(contentArray, 1, boxData, 'array', 'box');
            setContentData(contentArray, 2, segData, 'array', 'segment');
            var ctgValue, idx=3;
            contentCtgs.forEach(val => {
                ctgValue = $this.find("[name="+val.ctg+"]").val();
                setContentData(contentArray, idx++, ctgValue, 'string', val.ctg);
            });
            data.contentCtg = "noa";
            data.contentType = 'object';        // content 의 데이터 타입
            data.content = contentArray;
        } else {
            var content = $this.find("select").val();
            data.content = content;
            data.contentType = 'string';        // content 의 데이터 타입
            data.contentCtg = $this.find("select").attr("name");
        }
        return data;
    }
    function setContentData(contentArray, idx, content, contentType, contentCtg) {
        var contentDataSet = dataTemplate.cloneDataSet();

        contentDataSet.idx = idx;
        contentDataSet.content = content;
        contentDataSet.contentType = contentType;
        contentDataSet.contentCtg = contentCtg;
        contentArray.push(contentDataSet);
    }
    return {
        init: init,
        appendClassification: appendClassification,
        appendTag: appendTag,
        renderAnnotationTag: renderAnnotationTag,
        getData: getData
    }
})();
