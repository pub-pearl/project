// 통신, 데이터 포멧에 관련된 전반적인 편의 기능 스크립트 정의
(function ($) {
    $.fn.formJson = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if(o[this.name]!=undefined) {
                if(!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    $.fn.loadJson = function(uri, callback) {
        var $this = $(this);
        if(uri == undefined || uri == null) {
            uri = $this.attr("action");
        }
        MindsJS.loadJson(uri, $this.serialize(), callback);
    };
    $.fn.paging = function(settings) {

    };
    $.fn.uploadFile = function(settings) {

    };
    $.fn.excelDownload = function(settings) {

    };
    $.fn.one = function(eventName, callback) {
        $(this).off(eventName).on(eventName, callback);
    }

    $.isEmpty = function(string) {
        if(typeof string === 'undefined') return true;
        if(string == null) return true;
        if(string == "") return true;
        if(string == 'undefined') return true;
        return false;
    };
    $.isEmptyObject = function(object) {
        if(typeof object === 'undefined') return true;
        if(object == null) return true;
        // if(typeof object.length === 'undefined') return true;
        if(object.length <= 0) return true;
        return false;
    };
    $.genUuid = function(key) {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
})(jQuery);

var MindsJS = (function() {
    var isDev = false;
    var ajaxCallCount = 0;
    // var specialCharRegExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    // var morpheCharReqExp = /(\/nng|\/ss|\/jkb|\/jx|\/ep|\/vcp|\/jkg|\/jkq|\/jko|\/vx|\/vv|\/etm|\/jc|\/ec|\/ef|\/sf|\/x|\/p|\/o|\/q)/gi;

    $.ajaxSetup({
        type: "POST",
        async: true,
        timeout: 600000
    });

    function init() {
        console.log("MindsJS Init");
        commIndicator.init();
        MindsUI.init();
    }

    function loadJson(url, paramMap, callback, bActiveIndicator) {
        if(bActiveIndicator) {
            // if(ajaxCallCount++ == 0) {
                commIndicator.show();
            // }
        }
        var ctrlRef = $.ajax({
            url: contextPath+url,
            data: paramMap,
            dataType: "json",
            error: errorHandler,
            success: function(data, textStatus, jqXHR) {
                if(logoutHandler(jqXHR)) {return;}		// 로그인 또는 권한체크 여부 확인
                if(typeof callback === 'function') {
                    callback(data);
                }
            },
            complete: function(jqXHR, textStatus) {
                if(bActiveIndicator) {
                    // if(--ajaxCallCount == 0) {
                        commIndicator.hide();
                    // }
                }
            }
        });
    }

    // 화면의 특정영역(div 등)에 새로운페이지를 로딩할때
    function loadPage(wrapperSelector, url, paramMap, callback, isModal) {
        url = contextPath+url;
        commIndicator.show();
        var $wrapperSelector = wrapperSelector;
        if(typeof $wrapperSelector === 'string') {
            $wrapperSelector = $(wrapperSelector);
        }
        movePage(url);

        $wrapperSelector.load(url, paramMap, function(response, status, jqXHR) {
            commIndicator.hide();
            if(logoutHandler(jqXHR)) {return;}
            if(status == 'error') {
                $wrapperSelector.html(jqXHR.responseText);
            }
            if(typeof callback === 'function') {
                callback(data);
            }
        });
        //TOP으로 스크롤 이동
        if(!isModal){
            $('html,body').animate({ scrollTop : 0 }, 100); // 이동
        }
    }
    // 다른페이지로 직접 이동할 때
    function movePage(url, paramMap) {
        url = contextPath+url;
        if(paramMap) {
            var tempUrl = url + "?" + $.param(paramMap);
            document.location.href = tempUrl;
        } else {
            document.location.href = url;
        }
    }
    // 다른페이지로 이동시 history를 남기지 않을 때
    function replacePage(url, paramMap) {
        url = contextPath+url;
        if(paramMap) {
            var tempUrl = url + "?" + $.param(paramMap);
            document.location.replace(tempUrl);
        } else {
            document.location.replace(url);
        }
    }

    var commIndicator = {
        wrapperId: "page_ldWrap",
        wrapper: null,
        init: function() {
            var loadingWrapperId = commIndicator.wrapperId;
            // commIndicator.wrapper = $('<div id="'+loadingWrapperId+'" class="page_loading pageldg_hide" style="z-index:-1; opacity:0.7;"><div class="loading_itemBox"><span></span><span></span><span></span><span></span></div></div>');
            // commIndicator.wrapper.appendTo("body");
            commIndicator.wrapper = $('<div id="pageLoading"><div class="loading_container"><div class="line"></div><div class="text">LOADING</div></div></div>');
            ajaxCallCount = 0;
        },
        show: function() {
            if(ajaxCallCount++ == 0) {
                commIndicator.wrapper.appendTo("body");
            }
        },
        hide: function() {
            if(--ajaxCallCount == 0) {
                commIndicator.wrapper.remove();
            }
        }
    };

    function errorHandler(jqXHR, textStatus, errorThrow) {
        var errorX00 = (jqXHR.status / 100) * 100;
        if(errorX00 == 500) {
            var failStack = jqXHR.responseJSON.failStack[0];
            MindsJS.replacePage("/html/error/pages_500.jsp");
        }
        else if (errorX00 == 400) {
            var failStack = jqXHR.responseJSON.failStack[0];
            if(jqXHR.status == 401) {
                MindsJS.replacePage("/html/error/pages_401.jsp");
            }
            if(jqXHR.status == 404) {
                MindsJS.replacePage("/html/error/pages_404.jsp");
            }
            if(jqXHR.status == 400) {
                // MindsJS.replacePage("/html/error/pages_500.jsp");
                $.alert(failStack.error
                    , function() {
                        var targetId = failStack.targetId;
                        if($.isEmpty(targetId)) {
                            // 에러코드가 없으면 특정 작업을 하지 않는다.
                        } else if(
                            // 에러 종류에 따라 callback 액션 구분
                            targetId == "ERROR_1001" ||
                            targetId == "ERROR_1002" ||
                            targetId == "ERROR_1003"
                        ) {
                            MindsJS.replacePage("/project/projectList.do");
                        } else if(
                            targetId == "ERROR_1004"
                        ) {
                            MindsJS.replacePage("/");
                        } else {
                        }
                    }
                    , "Alert"
                );
            }
        }
        else {
            console.log("textStatus = [" + textStatus + "], errorThrow = [" + errorThrow + "]");
        }
    }
    function logoutHandler(jqXHR) {
        // 백엔드에서 에러전달 구분 필요
        // 로그인오류
        if(jqXHR.status==401) {
            movePage(contextPath+"/");	// M_LOGIN_PAGE 정의 필요
            return true;
        }
        // 권한오류
        if(jqXHR.status==403) {
            $.alert(NO_ROLE);
            return false;
        }
        return false;
    }

    return {
        init: init,
        commIndicator: commIndicator,
        loadJson: loadJson,
        loadPage: loadPage,
        movePage: movePage,
        replacePage: replacePage
    }
})();