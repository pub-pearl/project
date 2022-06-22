/* MINDsLab. NBR. 20210604 */
$(document).ready(function(){
    // -------------------- 공통 -------------------- //
    // 공통 layer popup 
	$('.btn_lyr_open').on('click',function(){	
        var btnLyrName = $(this).data('lyr-name'),
            popId = '#' + btnLyrName;
        
        // open
        $(popId).css('display', 'block');
        $(popId).prepend('<div class="lyr_bg"></div>');
        
        // close 
        $('.btn_lyr_close, .btn_confirm').on('click',function(){
            $(popId).css('display', 'none'); 
            $('.lyr_bg').remove(); 
        });	
    });	

    // 공통 토스트 알림 
    $('.btn_toast_open').on('click', function(){
        var btnLyrName = $(this).data('toast-name'),
            toastId = '#' + btnLyrName;
    
        // open
        $(toastId).addClass('on');
        setTimeout(function(){
            $(toastId).removeClass('on');
        }, 3000);
        
        // close 
        $('.btn_toast_close').on('click',function(){
            $(toastId).removeClass('on');
        });	
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

    // tool menu 활성화
    var toolMenuToggleBtn = $('.menu_list li button.toggle');
    var toolMenuSelectBtn = $('.menu_list li button.select');
    var classBox = $('.menu_list li .classBox');

    toolMenuToggleBtn.on('click', function(){
        var thisClassBox = $(this).next('.classBox');

        if($(this).hasClass('active')){
            $(this).removeClass('active open');
            thisClassBox.removeClass('active');
        }else{
            toolMenuToggleBtn.removeClass('active');
            classBox.removeClass('active');
            thisClassBox.addClass('active'); 
            if($(this).next('.classBox').length){
                $(this).addClass('active open'); 
            }else{
                $(this).addClass('active'); 
            }           
        }
    });

    toolMenuSelectBtn.on('click', function(){
        $(this).toggleClass('active');
    });

    // aside tab
    var asideTabBtn = $('.tabWrap .tab_btn > button');
    var asideTabCont = $('.tabWrap .tab_cont > ul');

    asideTabCont.eq(0).show();
    asideTabBtn.on('click',function(){
        var index = $(this).index();
        asideTabBtn.removeClass('active');
        $(this).addClass('active');
        asideTabCont.css('display','none');
        asideTabCont.eq(index).css('display','block');

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
    });

    // 태그 리스트 반려건만 클론하여 목록 만들기
    $('.tag_list li.reject').clone().appendTo('.reject_list'); 

    // 태그 리스트의 전체영역을 클릭 시 활성화 - 21.07.12 NBR 수정
    $('.tabWrap .tab_cont > ul li .tagBox').on('click', function(e){
        e.stopPropagation();
        
        var thisParentListAll = $(this).parents('ul').find('li'),
            thisParentList = $(this).parent('li');

        $(this).parents('ul').find('li').removeClass('active');
        thisParentList.addClass('active');
        // 21.08.03 NBR 추가
        $('.tabWrap .tab_cont > ul li .tagBox button').removeClass('active');
        $(this).find('button:first-of-type').addClass('active');

        // 개별 반려 사유 영역 sliding toggle
        if(!$.isEmptyObject(thisParentList.find('.reject_txt'))){
            thisParentList.find('.reject_txt').slideToggle(200);
        }

        var activeListHeight = thisParentList.outerHeight();
        var activeListPosition = thisParentList.position();
        var activeListCmtBoxHeight = thisParentList.find('.reject_txt').outerHeight();

        if(thisParentListAll.length ==  thisParentList.index() + 1){
            $(this).parents('ul').animate({scrollTop: activeListPosition.top + activeListHeight + $(this).parents('ul').scrollTop() + activeListCmtBoxHeight}, 200);
        }
    });

    // 태그 리스트의 선택박스 클릭 시 활성화
    $('.tabWrap .tab_cont > ul li .select').on('click', function(e){
        e.stopPropagation();

        var thisParentList = $(this).parents('li');

        $('.tabWrap .tab_cont > ul li .tagBox button').removeClass('active');
        $(this).addClass('active');
        $('.tabWrap .tab_cont > ul li').removeClass('active');
        thisParentList.addClass('active');

        if($(this).is('.btn_add_comment')){
            thisParentList.find('.editCommentBox').slideToggle(200);
        }
    });

    // 태그 리스트의 선택박스 옵션에 따른 컬러변경 - 21.08.12 NBR 추가
    // [D] 에러 태그인 경우 임시저장 시점에 addClass, removeClass('error') 해주세요.
    $('.tabWrap .tab_cont > ul li .select').on('input', function(){
        if($(this).find('option:selected').data('slt') == 'unselected'){
            $(this).addClass('unselected');
        }else{
            $(this).removeClass('unselected');
        }
    });

    // 태그 리스트의 툴 메뉴 버튼 클릭 시 활성화
    $('.tabWrap .tab_cont > ul li .tagBox button').on('click', function(e){
        e.stopPropagation();

        var thisParentList = $(this).parents('li');

        $('.tabWrap .tab_cont > ul li .tagBox button').removeClass('active');
        $(this).addClass('active');
        $('.tabWrap .tab_cont > ul li').removeClass('active');
        thisParentList.addClass('active');

        if($(this).is('.btn_add_comment')){
            thisParentList.find('.editCommentBox').slideToggle(200);
        }
    }); 
    
    // 파일명 텍스트 복사하기
    $('.btn_clipboard').on('click', function(){  
        var clipText = $(this).siblings('.fileName').text();    
        $('#clipTarget').val(clipText);
        $('#clipTarget').select();
        document.execCommand('Copy');
    });

    // contextmenu 열기
    // [D] contextmenu가 등장하는 영역을 임의로 .work_space에 한정하였지만 필요 영역으로 수정하시면 됩니다.
    $('.work_space').contextmenu(function(e){
        e.preventDefault();

        var workSpaceWidth = $('.work_space').outerWidth();
        var contextMenuWidth = $('#contextMenu').outerWidth();

        if(e.pageX < workSpaceWidth - contextMenuWidth){
            $('#contextMenu').css({
                display: 'block',
                left: e.pageX,
                top: e.pageY
            });
        }else{
            $('#contextMenu').css({
                display: 'block',
                left: e.pageX - contextMenuWidth,
                top: e.pageY
            });
        }
    });

    // .work_space가 아닌 영역을 클릭 할 시 contextmenu 끄기
    $('html').on('click', function(e){
        if(!$(e.target).is('.work_space')){
            $('#contextMenu').hide();
        }
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

