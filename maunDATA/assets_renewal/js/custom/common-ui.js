// 공통 팝업, 로딩 Indicator 등 공통 UI 제어 스크립트 정의
(function ($) {
    $.error = function(result, func) {

    };
    $.alert = function(msg, func, title, okLabel) {
        MindsUI.alert(msg, func, title, okLabel);
    };
    $.confirm = function(msg, okFunc, cancelFunc, title, okLabel, cancelLabel) {
        MindsUI.confirm(msg, okFunc, cancelFunc, title, okLabel, cancelLabel);
    };
    $.batch = function(msg, okFunc, cancelFunc, title) {
        MindsUI.batch(msg, okFunc, cancelFunc, title);
    };
    $.comment = function(msg, okFunc, cancelFunc, title) {
        MindsUI.comment(msg, okFunc, cancelFunc, title);
    };
    $.commentAll = function(message, okCallback, cancelCallback, title, okTitle, cancelTitle, labelList) {
        MindsUI.comment(message, okCallback, cancelCallback, title, okTitle, cancelTitle, labelList);
    };
    $.commentBlock = function(message, okFunc, comment, title, okLabel){
        MindsUI.commentBlock(message, okFunc, comment, title, okLabel);
    }

    $.fn.show = function() {
        var $this = $(this);
        $this.css("display", "block");
        return $this;
    };
    $.fn.hide = function() {
        var $this = $(this);
        $this.css("display", "none");
        return $this;
    };
    $.fn.drop = function() {
        var $this = $(this);
        $this.remove();
    };
})(jQuery);
var MindsUI = (function() {
    var isInit = false;
    // Popup Controller
    var commDialog = {
        eventHandler: {
            close: function($target, callback) {
                if(typeof callback === 'function') callback();
                // $target.css("opacity", "hide");
                $target.hide();
                $target.html("");
            },
            ok: function($target, callback) {
                if(typeof callback === 'function') callback();
                $target.hide();
                $target.html("");
            },
            commentOk: function($target, callback) {
                var data = commDialog.wrapperComment.find("form").formJson();
                if(typeof callback === 'function') callback(data);
                $target.hide();
                $target.html("");
            }
        },
        init: function() {
            this.wrapperAlert = $('<div id="popup_top" class="lyrWrap" z-index="7999"></div>')
            this.wrapperAlert.appendTo("body");
            this.wrapperConfirm = $('<div id="popup_mid" class="lyrWrap" z-index="7998"></div>');
            this.wrapperConfirm.appendTo("body");
            this.wrapperComment = $('<div id="unableWork" class="lyrWrap" z-index="7997"</div>');
            this.wrapperComment.appendTo("body");
        },
        alertWrapperId: "alertPop",
        alertTemplateId: "alertTemplate",
        wrapperAlert: null,
        confirmWrapperId: "confirmPop",
        confirmTemplateId: "confirmTemplate",
        wrapperConfirm: null,
        commentWrapperId: "commentPop",
        commentTemplateId: "commentTemplate",
        blockedCommentTemplateId: "blockedCommentTemplate",
        wrapperComment: null,
        lockAlert: false,
        general: function(htmlTemplateId, data, addClassList) {
            if(commDialog.lockGeneral) {
                return false;
            }
            // general
            if(++commDialog.generalCount == 3) {
                commDialog.lockGeneral = true;
            }
            var html = $.templates("#"+htmlTemplateId).render(data);
            var $generalDialog = commDialog.wrapperGeneral.html(html);
            if(addClassList != null) {
                if(typeof addClassList == 'string') {
                    $generalDialog.addClass(addClassList);
                } else {
                    for(var i in addClassList) {
                        $generalDialog.addClass(addClassList[i]);
                    }
                }
            }
            var $isHidding = $(".pop_simple.pop_general:first").css("display") == "none" ? true : false;
            if($isHidding) {
                $generalDialog.fadeOut(100).css('z-index', 1020);
            }
            $generalDialog.find(".ico_close").on("click", function() {
                var $dialogItself = $(this).parents(".pop_simple:first");
                if($dialogItself == null) return false;

                // general
                commDialog.generalCount--;
                commDialog.lockAlert = false;

                $dialogItself.children().remove();
                $dialogItself.fadeIn(100);

                if(addClassList != null) {
                    if(typeof addClassList == 'string') {
                        $dialogItself.removeClass(addClassList);
                    } else {
                        for(var i in addClassList) {
                            $dialogItself.removeClass(addClassList[i]);
                        }
                    }
                }
                // if(addClassList != null) {
                // 	addClassList.forEach(val => {;
                // 		$dialogItself.removeClass(val);
                // 	});
                // }
            });
            return $generalDialog;
        },
        alert: function(message, callback, title, okTitle) {
            if(commDialog.lockAlert) return false;
            title = !$.isEmpty(title) ? title : "Information";

            var data = {message: message, messageTitle: title};
            if(!$.isEmpty(okTitle)) data.okTitle = okTitle;

            // rendering
            var html = $.templates("#"+commDialog.alertTemplateId).render(data);
            var $commDialog = commDialog.wrapperAlert.html(html);
            $commDialog.fadeIn();       // $commDialog.show();
            $commDialog.find(".btn_lyr_close").on("click", function() {
                commDialog.eventHandler.close($commDialog);
            });
            $commDialog.find(".btn_confirm").on("click", function() {
                commDialog.eventHandler.ok($commDialog, callback);
            });
        },
        confirm: function(message, okCallback, cancelCallback, title, okTitle, cancelTitle) {
            if(commDialog.lockAlert) return false;
            title = !$.isEmpty(title) ? title : "Confirm";

            var data = {message: message, messageTitle: title};
            if(!$.isEmpty(okTitle)) data.okTitle = okTitle;
            if(!$.isEmpty(cancelTitle)) data.cancelTitle = cancelTitle;

            // rendering
            var html = $.templates("#"+commDialog.confirmTemplateId).render(data);
            var $commDialog = commDialog.wrapperConfirm.html(html);
            $commDialog.fadeIn();       // $commDialog.show();
            $commDialog.find(".btn_lyr_close").on("click", function() {
                commDialog.eventHandler.close($commDialog);
            });
            $commDialog.find(".btn_cancel").on("click", function() {
                commDialog.eventHandler.close($commDialog, cancelCallback);
            });
            $commDialog.find(".btn_confirm").on("click", function() {
                commDialog.eventHandler.ok($commDialog, okCallback);
            });
        },
        batch: function() {

        },
        comment: function(message, okCallback, cancelCallback, title, okTitle, cancelTitle, labelList) {
            if(commDialog.lockAlert) return false;
            title = !$.isEmpty(title) ? title : "Confirm";

            var data = {message: message, messageTitle: title};
            if(!$.isEmpty(okTitle)) data.okTitle = okTitle;
            if(!$.isEmpty(cancelTitle)) data.cancelTitle = cancelTitle;

            if(labelList != null) {
                data.labelList = labelList;
            } else {
                labelList = [
                    {label:"", lbl_type:"text", name:"", lbl_ph:"" }
                ];
                data.labelList = labelList;
            }

            // rendering
            var html = $.templates("#"+commDialog.commentTemplateId).render(data);
            var $commDialog = commDialog.wrapperComment.html(html);
            $commDialog.fadeIn();       // $commDialog.show();
            $commDialog.find(".btn_lyr_close").on("click", function() {
                commDialog.eventHandler.close($commDialog);
            });
            $commDialog.find(".btn_cancel").on("click", function() {
                commDialog.eventHandler.close($commDialog, cancelCallback);
            });
            $commDialog.find(".btn_confirm").on("click", function() {
                commDialog.eventHandler.commentOk($commDialog, okCallback);
            });
        },
        commentBlock: function(message, okFunc, comment, title, okLabel) {
            if(commDialog.lockAlert) return false;
            title = !$.isEmpty(title) ? title : "Information";

            var data = {message: message, messageTitle: title};
            if(!$.isEmpty(okLabel)) data.okTitle = okLabel;
            if(!$.isEmpty(comment)) data.comment = comment;

            var html = $.templates("#"+commDialog.blockedCommentTemplateId).render(data);
            var $commDialog = commDialog.wrapperComment.html(html);
            $commDialog.fadeIn();
            $commDialog.find(".btn_lyr_close").on("click", function() {
                commDialog.eventHandler.close($commDialog);
            });
            $commDialog.find(".btn_confirm").on("click", function() {
                commDialog.eventHandler.ok($commDialog, okFunc);
            });

        }
    };
    function init() {
        if(isInit) {
            return;
        }
        isInit = true;
        commDialog.init();
    }

    function alert(msg, callback, title, okTitle) {
        commDialog.alert(msg, callback, title, okTitle);
    }
    function confirm(msg, okCallback, cancelCallback, title, okTitle, cancelTitle) {
        commDialog.confirm(msg, okCallback, cancelCallback, title, okTitle, cancelTitle);
    }
    function batch(msg, okCallback, cancelCallback, title, okTitle, cancelTitle) {
        commDialog.batch(msg, okCallback, cancelCallback, title, okTitle, cancelTitle);
    }
    function comment(msg, okCallback, cancelCallback, title, okTitle, cancelTitle, labelList) {
        commDialog.comment(msg, okCallback, cancelCallback, title, okTitle, cancelTitle, labelList);
    }
    function commentBlock(message, okFunc, comment, title, okLabel) {
        commDialog.commentBlock(message, okFunc, comment, title, okLabel);
    }
    function generalPopup(htmlTemplate, data, addClassList) {
        return commDialog.general(htmlTemplate, data, addClassList);
    }
    return {
        init: init,
        alert: alert,
        confirm: confirm,
        batch: batch,
        comment: comment,
        commentBlock: commentBlock,
        generalPopup: generalPopup,
    }
})();