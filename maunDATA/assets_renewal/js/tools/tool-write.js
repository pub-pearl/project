// DRAW 'WRITE' TOOL
(function ($) {
    // Annotation 추가
    $.fn.addWriteAnnotation = function(data) {
        WriteToolJS.appendTag($(this), data);
    };
    // Annoataion Data Render
    $.fn.renderWriteAnnotations = function(data) {
        $(this).html("");
        if(!$.isEmptyObject(data)) {
            WriteToolJS.renderAnnotationTag($(this), data);
        } else {
            WriteToolJS.appendTag($(this));
        }
    };
    // export Data from Annotation
    $.fn.exportWriteAnnotationData = function() {
        return WriteToolJS.getData($(this));
    };
})(jQuery);

var WriteToolJS = (function() {
    var _isPermitReturn = true;
    var _role = 0;      // 0:worker, 1:inspector, 2:client

    // 같은 툴이라도 세부적인 기능이나 UI 옵션을 주기 위해 settings 작성
    function init(settings) {
        _isPermitReturn = settings.isReturn || false;
        _role = $.isEmpty(settings.role) ? 0 : settings.role;
    }
    // 새로운 오브젝트를 Annoatation 목록에 추가한다
    function appendTag($workingArea, data) {
        let emptyData;
        let randomContextId = $.genUuid();
        if($.isEmptyObject(data)) {
            emptyData = { cfrmStatus: 'AS', uuid: randomContextId };
        } else {
            emptyData = data;
        }
        let workingHtml = $.templates("#writeWorkingTemplate").render(emptyData);
        let $newAnnotation = $workingArea.append(workingHtml);
        if($newAnnotation.find("li.active").length > 0) {
            $newAnnotation.find("li.active").removeClass("active");
        }

        let $currentElement = $newAnnotation.find("div[data-uuid="+randomContextId+"]").parents("li");
        $currentElement.addClass("active");
        if($("div.aside").hasClass("on")) {
            $currentElement.find("div.ipt_txt").focus();
        }
        textBoxEventHandler($currentElement);
    }
    // 저장된 데이터를 가지고 Annotation 항목을 만든다
    function renderAnnotationTag($workingArea, data) {
        var workingHtml = "";
        if(!$.isEmptyObject(data)) {
            console.log(data);
            if(_role == 0) {
                // worker
                workingHtml = $.templates("#writeWorkingTemplate").render(data);
            } else if(_role == 1) {
                workingHtml = $.templates("#writeInspectingTemplate").render(data);
            } else {}
        }
        textBoxEventHandler($workingArea.html(workingHtml));
    }
    // Annotation 항목에 필요한 핸들러 작성
    function textBoxEventHandler($this) {
        $('.contenteditable', $this).one("keydown", function(e) {
            if(false) {
            }
            else if(!_isPermitReturn && e.keyCode === 13) {
                // 입력시 줄바꿈을 허용하지 않는다
                e.preventDefault();
            }
        });
        $('.contenteditable', $this).one("focusout", function(e) {

        });
    }
    // Annotation 한 내용을 데이터로 변환할 때 호출
    function getData($this) {
        let data = {
            idx:0, contentId:'', content:'', contentType:'', contentCtg:'', status:'', childContent: []
        };
        if($this.has("div.ipt_txt").length > 0) {
            var contextId = $this.find("div.tagBox").data("contextId");
            var content = $this.find("div.ipt_txt.contenteditable[name=content]").text();
            var uuid = $this.find("div.tagBox").data("uuid");

            data.idx = $("ul.tag_list li").index($this)*1;
            data.contentId = contextId;
            data.content = content;
            data.contentType = 'string';        // content 의 데이터 타입
            data.contentCtg = 'text';          // 전사작업을 의미
            data.uuid = uuid;
        } else {
            console.log ("this is not a writer");
            return null;
        }
        return data;
    }

    return {
        init: init,
        appendTag: appendTag,
        renderAnnotationTag: renderAnnotationTag,
        getData: getData
    }
})();