/* MINDsLab. NBR. 20210604 */
$(document).ready(function(){
    // image frame tag copy
    // [D] 21.11.26 NBR 추가
    $('.btn_tagCopy').on('click', function(){
        if($(this).is('.active')){
            $('.btn_paging.btn_next, .btn_scroll.btn_scroll_right').addClass('active');
        }else{
            $('.btn_paging.btn_next, .btn_scroll.btn_scroll_right').removeClass('active');
        }
    });

    // aside 영역 확장 버튼
    $('.aside .btn_expand').on('click', function(){
        $('.aside').toggleClass('on');
        
        var contentWidth = $('.content').outerWidth(),
            asideWidth = $('.aside').outerWidth(),
            videoFrameAreaWidth = $('.videoFrameArea').outerWidth();

        if($('.aside').hasClass('on') == true){
            videoFrameAreaWidth = videoFrameAreaWidth - asideWidth;
            $('.videoFrameArea').animate({width: videoFrameAreaWidth}, 300);
        }else{
            videoFrameAreaWidth = contentWidth;
            $('.videoFrameArea').animate({width: videoFrameAreaWidth}, 300);
        }
    });    

    // tabWrap height 조절
    // [D] 21.06.29 NBR 수정
    function handleTabWrapHeight(){
        var asideHeight = $('.aside').outerHeight();
        var heightSum = 0;

        $('.aside > div').not('.tabWrap').each(function(){
            heightSum = heightSum + $(this).outerHeight();            
        });       
        $('.aside .tabWrap .tab_cont > ul').css({height: asideHeight - heightSum - 50});
    } 
    handleTabWrapHeight();  

    // tabWrap height 조절 - resize 시
    $(window).resize(function(){
        handleTabWrapHeight();
    });

    // comments 클릭 시 박스 슬라이드 & height 조절
    // [D] 21.06.29 NBR 수정
    $('.comments .tit').on('click', function(){
        var commentsHeight = $('.aside .comments').outerHeight(), 
            commentBoxHeight = $('.aside .comments .cmt_box').outerHeight(),            
            tabContHeight = $('.aside .tabWrap .tab_cont > ul').outerHeight();

        if(commentsHeight < 55){
            $('.comments .cmt_box').slideDown(200);
            $('.aside .tabWrap .tab_cont > ul').animate({height: tabContHeight - commentBoxHeight}, 200);
        }else{
            $('.comments .cmt_box').slideUp(200);  
            $('.aside .tabWrap .tab_cont > ul').animate({height: tabContHeight + commentBoxHeight}, 200);         
        }
    });  

    // videoFrameArea 영역 확장 버튼
    $('.videoFrameArea .btn_expand').on('click', function(){
        $('.videoFrameArea').toggleClass('on');
    });

    // videoFrameArea width 조절
    function handleVideoFrameAreaWidth(){
        var contentWidth = $('.content').outerWidth(),
            asideWidth = $('.aside').width(),
            videoFrameAreaWidth = $('.videoFrameArea').outerWidth();

        if($('.aside').hasClass('on') == true){
            videoFrameAreaWidth = contentWidth - asideWidth;
            $('.videoFrameArea').css('width', videoFrameAreaWidth);
        }else{
            videoFrameAreaWidth = contentWidth;
            $('.videoFrameArea').css('width', videoFrameAreaWidth);
        }
    }
    handleVideoFrameAreaWidth();

    // videoFrameArea width 조절 - resize 시
    $(window).resize(function(){
        handleVideoFrameAreaWidth();
    });

    // frame pagination number 가져오기
    function getframeNumInfo(){
        var totalFrameNum = $('.frame_list li').length,
            currentFrameNum = $('.frame_list li.active').index();

        $('.frameInfo .currentNum').text(currentFrameNum + 1);
        $('.frameInfo .totalNum').text(totalFrameNum);
    }
    getframeNumInfo();

    // frame pagination
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

    // frame pagination 버튼 클릭 시
    $('.frame_pagination .btn_paging').on('click', function(){
        if($(this).is('.btn_prev')){
            clickPrevBtn();
            activeFrameMoveScroll();
        }else if($(this).is('.btn_next')){
            clickNextBtn();
            activeFrameMoveScroll();
        }       
    });

    // frame list scroll 이동 버튼
    $('.frame_list_wrap .btn_scroll').on('click', function(){        
        if($(this).is('.btn_scroll_left')){      
            $('.frame_list').animate({scrollLeft: '-=94'}, 200);          
        }else if($(this).is('.btn_scroll_right')){
            $('.frame_list').animate({scrollLeft: '+=94'}, 200);  
        }
    });

    // frame 선택 활성화
    $('.frame_list li').on('click', function(){
        $('.frame_list li').removeClass('active');
        $(this).addClass('active');
        getframeNumInfo();
        activeFrameMoveScroll();
    });

    // frame list mouse wheel scroll
    function scrollHorizontally(e){
        e.preventDefault();
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        document.querySelector('.frame_list').scrollLeft -= (delta * 94);           
    }   
    $('.frame_list').on('mousewheel DOMMouseScroll', scrollHorizontally);    // IE9, Chrome, Safari, Opera, Firefox
});

