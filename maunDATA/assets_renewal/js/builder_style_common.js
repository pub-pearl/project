/* MINDsLab. NBR. 20210604 */
(function ($) {
    let toastMessage = {
        "temporarySave" : "임시저장 되었습니다.",
        "clipboard" : "복사되었습니다."
    };
    let timerId;
    $.fn.toast = function() {
        var btnLyrName = $(this).data('toast-name');
        // data-toast-name 이 없으면 toast 띄울 수 없게
        if($.isEmpty(btnLyrName)) { return; }

        var $toastBox = $("div.lyrToast").html(
            $.templates("#toastTemplate").render({ message : toastMessage[btnLyrName] })
        );
        // open
        $toastBox.addClass('on');
        if(!$.isEmpty(timerId)) clearTimeout(timerId);
        timerId = setTimeout(function(){
            $toastBox.removeClass('on');
        }, 3000);
        // manual close
        $toastBox.find('.btn_toast_close').one('click',function(){
            $toastBox.removeClass('on');
        });
    };
    $.fn.menuEventHandler = function(callback) {
        var $this = $(this);
        if(!$.isEmptyObject($this)) {
            MindsStyle.bindMenuEventHandler($this, callback);
        }
    };
    $.fn.contextHandler = function(callback, menuTmplId) {
        var $this = $(this);
        if(!$.isEmptyObject($this)) {
            MindsStyle.bindContextMenuHandler($this, menuTmplId, callback);
        }
    }
    $.fn.frameNavHandler = function(callback) {
        var $this = $(this);
        if(!$.isEmptyObject($this)) {
            MindsStyle.bindFrameNavigatorHandler($this, callback);
        }
    }
})(jQuery);

var MindsStyle = (function () {
    // menu Event Handler
    function bindMenuEventHandler($this, callback) {
        // tool menu 활성화
        var toolMenuBtn = $('.menu_list li button', $this);
        var classBox = $('.menu_list li .classBox', $this);
        var classList = $('.menu_list li .classBox li', $this);

        toolMenuBtn.one('click', function(){
            var thisClassBox = $(this).next('.classBox');
            // toggle class 버튼은 버튼 이벤트 영향을 준다
            if($(this).is('.toggle')) {
                // 누르는 버튼이 변경되면 모두 deactive
                if (!$(this).hasClass('active')) {
                    toolMenuBtn.removeClass('active open');
                    classBox.removeClass('active');
                    $(this).addClass('active');
                }
                // 누르는 버튼에 따라
                if(!$.isEmptyObject(thisClassBox)) {
                    $(this).toggleClass('open');
                    thisClassBox.toggleClass('active');
                }
                return;
            } else if($(this).is('.select')) {
                $(this).toggleClass('active');
                if($(this).is('.btn_tagCopy')) {
                    if($(this).is('.active')){
                        $('.btn_paging.btn_next, .btn_scroll.btn_scroll_right').addClass('active');
                    }else{
                        $('.btn_paging.btn_next, .btn_scroll.btn_scroll_right').removeClass('active');
                    }
                } else {}
            }
            else {
                // Toggle이 아닌 경우에만 이벤트를 넘긴다
                // callback 추가 (버튼을 클릭했을 때 할 일)
                // if(typeof callback === 'function') {
                //     callback($(this));
                // }
            }
            if(typeof callback === 'function') {
                callback($(this));
            }
        });
        classList.one('click', function() {
            $('.btn_move_object').removeClass('active');
            if(typeof callback === 'function') {
                callback($(this));
            }
        });
    }
    function bindEventHandler(syncCallback) {
        $('.ipt_txt').one('click', function(e) {
            e.stopPropagation();
        });

        // 태그 리스트의 전체영역을 클릭 시 활성화 - 21.07.09 NBR 수정
        $('.tabWrap .tab_cont > ul li .tagBox').one('click', function(e){
            e.stopPropagation();

            var thisParentListAll = $(this).parents('ul').find('li');
            var thisParentList = $(this).parent('li');

            if(typeof syncCallback === 'function') {
                var uuid = thisParentList.find("div.tagBox").data("uuid");
                syncCallback(uuid);
            }

            // $('.tabWrap .tab_cont > ul li').removeClass('active');
            $(this).parents('ul').find('li').removeClass('active');
            thisParentList.addClass('active');

            // 개별 반려 사유 영역 sliding toggle
            if(!$.isEmptyObject(thisParentList.find('.reject_txt'))){
                thisParentList.find('.reject_txt').slideToggle(200);
            }

            // 21.07.12 NBR 추가 (개별 반려 사유 영역 표시 되도록 스크롤)
            var activeListHeight = thisParentList.outerHeight();
            var activeListPosition = thisParentList.position();
            var activeListCmtBoxHeight = thisParentList.find('.reject_txt').outerHeight();

            // if(thisParentListAll.length ==  thisParentList.index() + 1){
            //     // $(this).parents('ul').animate({scrollTop: activeListPosition.top + activeListHeight + $(this).parents('ul').scrollTop() + activeListCmtBoxHeight}, 200);
            //     $(this).parents('ul').animate({scrollTop: activeListPosition.top + $(this).parents('ul').scrollTop() + activeListCmtBoxHeight}, 200);
            // }
        });

        $('.tabWrap .tab_cont > ul li .select').one('click', function(e){
            e.stopPropagation();

            var thisParentList = $(this).parents('li');

            $('.tabWrap .tab_cont > ul li .tagBox button').removeClass('active');
            $(this).addClass('active');
            $('.tabWrap .tab_cont > ul li').removeClass('active');
            thisParentList.addClass('active');

            if(typeof syncCallback === 'function') {
                var uuid = thisParentList.find("div.tagBox").data("uuid");
                syncCallback(uuid);
            }

            if($(this).is('.btn_add_comment')){
                thisParentList.find('.editCommentBox').slideToggle(200);
            }
        });

        // 파일명 텍스트 복사하기
        $('.btn_clipboard').one('click', function(){
            var clipText = $(this).siblings('.fileName').text();
            $('#clipTarget').val(clipText);
            $('#clipTarget').select();
            document.execCommand('Copy');
            $(this).toast();
        });

        // 태그 리스트의 툴 메뉴 버튼 클릭 시 활성화
        $('.tabWrap .tab_cont > ul li .tagBox button').one('click', function(e){
            e.stopPropagation();

            var thisParentList = $(this).parents('li');

            // $('.tabWrap .tab_cont > ul li .tagBox button').removeClass('active');
            // $(this).addClass('active');
            $('.tabWrap .tab_cont > ul li').removeClass('active');
            thisParentList.addClass('active');

            if($(this).is('.btn_add_comment')){
                thisParentList.find('.editCommentBox').slideToggle(200);
            }
        });

        $('.class_list li input[type="radio"]').each(function(i){
            var indexNum = i + 1;
            $(this).attr('id', 'radio' + indexNum);
            $(this).siblings('label').attr('for', 'radio' + indexNum);
        });

        // 태그 리스트의 선택박스 옵션에 따른 컬러변경 - 21.08.12 NBR 추가
        // [D] 에러 태그인 경우 임시저장 시점에 addClass, removeClass('error') 해주세요.
        $('.tabWrap .tab_cont > ul li .select').one('input', function(){
            if($(this).find('option:selected').data('slt') == 'unselected'){
                $(this).addClass('unselected');
            }else{
                $(this).removeClass('unselected');
                $(this).removeClass('error');
            }
        });
        $('.tabWrap .tab_cont > ul li .select').each(function() {
            if($(this).find('option:selected').data('slt') !== 'unselected') {
                $(this).removeClass('unselected');
            }
        });

        handleTabWrapHeight();
    }
    function handleTabWrapHeight(){
        var asideHeight = $('.aside').outerHeight();
        var heightSum = 0;

        $('.aside > div').not('.tabWrap').each(function(){
            heightSum = heightSum + $(this).outerHeight();
        });
        $('.aside .tabWrap .tab_cont > ul').css({height: asideHeight - heightSum - 50});
    }
    function bindContextMenuHandler($this, ctxMenuTemplateId, callback) {
        $this.contextmenu(function(e){
            e.preventDefault();

            // if($.isEmpty(ctxMenuTemplateId)) ctxMenuTemplateId = 'contextMenu';
            // // let $contextUi = $("#"+ctxMenuTemplateId);
            // let $contextUi = $("#"+ctxMenuTemplateId);
            // let workSpaceWidth = $this.outerWidth();
            // let contextMenuWidth = $contextUi.outerWidth();
            //
            // if(e.pageX < workSpaceWidth - contextMenuWidth){
            //     $contextUi.css({
            //         display: 'block',
            //         left: e.pageX,
            //         top: e.pageY
            //     });
            // }else{
            //     $contextUi.css({
            //         display: 'block',
            //         left: e.pageX - contextMenuWidth,
            //         top: e.pageY
            //     });
            // }
            //
            // $contextUi.find("li").one("click", function() {
            //     if(typeof callback === 'function') {
            //         $contextUi.hide();
            //         callback($(this).attr('menuId'));
            //     }
            // });
        });
    }
    function bindFrameNavigatorHandler($this, callback) {
        getframeNumInfo();
        // frame pagination 버튼 클릭 시
        $('.frame_pagination .btn_paging').one('click', function(e){
            e.stopImmediatePropagation();
            if($(this).is('.btn_prev')){
                clickPrevBtn();
                activeFrameMoveScroll();
            }else if($(this).is('.btn_next')){
                clickNextBtn();
                activeFrameMoveScroll();
                if($(this).is('.active') && typeof callback === 'function') {
                    callback();
                }
            }
        });
        // frame list scroll 이동 버튼
        $('.frame_list_wrap .btn_scroll').one('click', function(){
            if($(this).is('.btn_scroll_left')){
                clickPrevBtn();
                // $('.frame_list').animate({scrollLeft: '-=94'}, 200);
            }else if($(this).is('.btn_scroll_right')){
                clickNextBtn();
                // $('.frame_list').animate({scrollLeft: '+=94'}, 200);
                if($(this).is('.active') && typeof callback === 'function') {
                    callback();
                }
            }
        });
        // frame 선택 활성화
        $('.frame_list li').one('click', function(){
            $('.frame_list li').removeClass('active');
            $(this).addClass('active');
            getframeNumInfo();
            activeFrameMoveScroll();
        });
        $('.frame_list').one('mousewheel DOMMouseScroll', scrollHorizontally);    // IE9, Chrome, Safari, Opera, Firefox
        // videoFrameArea 영역 확장 버튼
        $('.videoFrameArea .btn_expand').on('click', function(){
            $('.videoFrameArea').toggleClass('on');
        });
    }
    function clickPrevBtn(){    // 이전 버튼
        var currentFrameIndex = $('.frame_list li.active').index();
        currentFrameIndex = currentFrameIndex - 1;

        var currentFrameNum = $('.frameInfo .currentNum').text();
        currentFrameNum = parseInt(currentFrameNum);

        if(currentFrameNum == 1){
            return false;
        }

        $('.frameInfo .currentNum').text(currentFrameIndex);
        $('.frame_list li').eq(currentFrameIndex).trigger('click');
    }
    function clickNextBtn(){    // 다음 버튼
        var currentFrameIndex = $('.frame_list li.active').index();
        currentFrameIndex = currentFrameIndex + 1;

        var totalFrameNum = $('.frame_list li').length;
        var currentFrameNum = $('.frameInfo .currentNum').text();
        currentFrameNum = parseInt(currentFrameNum);

        if(totalFrameNum == currentFrameNum){
            return false;
        }

        $('.frameInfo .currentNum').text(currentFrameIndex);
        $('.frame_list li').eq(currentFrameIndex).trigger('click');
    }
    function activeFrameMoveScroll(){   // 현재 프레임으로 스크롤 이동
        var currentOffsetLeft = $('.frame_list li.active').offset().left,
            frameListOffsetLeft = $('.frame_list').offset().left,
            frameListScrollLeft = $('.frame_list').scrollLeft();

        $('.frame_list').animate({scrollLeft: currentOffsetLeft - frameListOffsetLeft * 2 + frameListScrollLeft + 40}, 200);
    }
    function getframeNumInfo(){
        var totalFrameNum = $('.frame_list li').length,
            currentFrameNum = $('.frame_list li.active').index();

        $('.frameInfo .currentNum').text(currentFrameNum + 1);
        $('.frameInfo .totalNum').text(totalFrameNum);
    }
    function scrollHorizontally(e){
        e.preventDefault();
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.querySelector('.frame_list').scrollLeft -= (delta * 94);
    }
    return {
        bindEventHandler: bindEventHandler,
        bindMenuEventHandler: bindMenuEventHandler,
        bindContextMenuHandler: bindContextMenuHandler,
        bindFrameNavigatorHandler: bindFrameNavigatorHandler
    }
})();

$(document).ready(function(){
    // comments box

    // aside tab
    var asideTabBtn = $('.tabWrap .tab_btn > button');
    var asideTabCont = $('.tabWrap .tab_cont > ul');

    asideTabCont.eq(0).show();
    asideTabBtn.one('click',function(){
        var index = $(this).index();
        asideTabBtn.removeClass('active');
        $(this).addClass('active');

        if(index == 1) {
            asideTabCont.find("li").not(".reject").css("display", "none");
        } else {
            asideTabCont.find("li").css("display", "block");
        }

        // 탭 이동 시 태그 리스트의 활성화 리스트로 스크롤 이동 - 21.07.09 NBR 추가
        // if(!$.isEmptyObject(asideTabCont.find("li.active"))
        //     && asideTabCont.find("li.active").eq(0).css("display") == 'block'
        // ) {
        //     var activeListPosition = asideTabCont.eq(index).find('li.active').position();
        //     if(asideTabCont.eq(index).find('li').hasClass('active')){
        //         asideTabCont.eq(index).animate({scrollTop: activeListPosition.top + asideTabCont.eq(index).scrollTop()}, 200);
        //      }
        // }

        // 탭 이동 시 태그 리스트의 활성화 리스트로 스크롤 이동 - 21.07.12 NBR 수정
        var activeListHeight = asideTabCont.eq(index).find('li.active').outerHeight();
        var activeListPosition = asideTabCont.eq(index).find('li.active').position();
        var activeListCmtBoxHeight = asideTabCont.eq(index).find('li.active .reject_txt').outerHeight();

        if(asideTabCont.eq(index).find('li').hasClass('active')){
            asideTabCont.eq(index).animate({scrollTop: activeListPosition.top + asideTabCont.eq(index).scrollTop()}, 200);

            if(asideTabCont.eq(index).find('li:last-child').hasClass('active')){
                asideTabCont.eq(index).animate({scrollTop: activeListPosition.top + activeListHeight + asideTabCont.eq(index).scrollTop() - activeListCmtBoxHeight}, 200);
            }
        }

        // 태그 리스트 반려건만 클론하여 목록 만들기
        // $('.reject_list').html($('.tag_list li.reject').clone());
    });

    // 작업 히스토리 파일 목록
    $('.btn_history').on('click', function(){
        if($('.historyBox').is('.active')){
            $('.historyBox').removeClass('active');
        }else{
            $('.historyBox').addClass('active');
        }

        $('.history_list li a').on('click', function(){
            $('.history_list li a').removeClass('active');
            $(this).addClass('active');
        });
    });

    // -------------------- 검수자 화면 -------------------- //
    // 태그 리스트 세부 코멘트 리스트 내 버튼 클릭 시
    $('.editCommentBox .cmt_list li button').on('click', function(e){
        e.stopPropagation();

        if($(this).is('.btn_check')){   // 확인 처리 하기
            $(this).parent('li').toggleClass('checked');
        }else if($(this).is('.btn_delete')){    // 삭제 하기
            $(this).parent('li').remove();

            $('.cmt_list').each(function(){
                var length = $(this).find('li').length;

                if(length == 0){
                    $(this).parent('.cmt_list_box').find('.unprocessed').addClass('empty');
                }
            });
        }
    });
});

