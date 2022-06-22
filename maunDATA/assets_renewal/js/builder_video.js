/* MINDsLab. NBR. 20210604 */
$(document).ready(function(){
    // aside 영역 확장 버튼
    $('.aside .btn_expand').on('click', function(){
        $('.aside').toggleClass('on');
        
        var contentWidth = $('.content').outerWidth(),
            asideWidth = $('.aside').outerWidth(),
            videoAreaWidth = $('.videoArea').outerWidth();

        if($('.aside').hasClass('on') == true){
            videoAreaWidth = videoAreaWidth - asideWidth;
            $('.videoArea').animate({width: videoAreaWidth}, 300);
        }else{
            videoAreaWidth = contentWidth;
            $('.videoArea').animate({width: videoAreaWidth}, 300);
        }
    });  

    // videoArea width 조절
    function handleVideoAreaWidth(){
        var contentWidth = $('.content').outerWidth(),
            asideWidth = $('.aside').width(),
            videoAreaWidth = $('.videoArea').outerWidth();

        if($('.aside').hasClass('on') == true){
            videoAreaWidth = contentWidth - asideWidth;
            $('.videoArea').css('width', videoAreaWidth);
        }else{
            videoAreaWidth = contentWidth;
            $('.videoArea').css('width', videoAreaWidth);
        }
    }
    handleVideoAreaWidth();

    // videoFrameArea width 조절 - resize 시
    $(window).resize(function(){
        handleVideoAreaWidth();
    });

    // script height 조절
    function handleScriptHeight(){
        var asideHeight = $('.aside').outerHeight();
        var heightSum = 0;

        if($('.aside .script .script_box').css('display') == 'block'){
            $('.aside > div').not('.script').each(function(){
                heightSum = heightSum + $(this).outerHeight(); 
            });       
            $('.aside .script').css({height: asideHeight - heightSum});
        }else{
            $('.aside > div').not('.tabWrap').each(function(){
                heightSum = heightSum + $(this).outerHeight(); 
            });       
            $('.aside .tabWrap .tab_cont > ul').css({height: asideHeight - heightSum - 50});
        }       
    } 
    handleScriptHeight();  

    // script height 조절 - resize 시
    $(window).resize(function(){
        handleScriptHeight();
    });

    // comments 클릭 시 박스 슬라이드 & height 조절
    $('.comments .tit').on('click', function(){
        var commentsHeight = $('.aside .comments').outerHeight(), 
            commentBoxHeight = $('.aside .comments .cmt_box').outerHeight(), 
            tapContHeight = $('.aside .tabWrap .tab_cont > ul').outerHeight(),
            scriptHeight = $('.aside .script').outerHeight();   
            
        if($('.aside .script .script_box').css('display') == 'block'){
            if(commentsHeight < 55){  
                $('.comments .cmt_box').slideDown(200);
                $('.aside .script').animate({height: scriptHeight - commentBoxHeight}, 200);
            }else{    
                $('.comments .cmt_box').slideUp(200);  
                $('.aside .script').animate({height: scriptHeight + commentBoxHeight}, 200);         
            }
        }else{
            if(commentsHeight < 55){   
                $('.comments .cmt_box').slideDown(200);
                $('.aside .tabWrap .tab_cont > ul').animate({height: tapContHeight - commentBoxHeight}, 200);
            }else{    
                $('.comments .cmt_box').slideUp(200);  
                $('.aside .tabWrap .tab_cont > ul').animate({height: tapContHeight + commentBoxHeight}, 200);         
            }
        } 
    });

    // script 클릭 시 박스 슬라이드 & height 조절
    $('.script .tit').on('click', function(){
        var tapContHeight = $('.aside .tabWrap .tab_cont > ul').outerHeight(),   
            scriptBoxHeight = $('.aside .script .script_box').outerHeight();                         

        if($('.aside .script .script_box').css('display') == 'none'){
            $('.aside .script .script_box').slideDown(200);
            $('.aside .tabWrap .tab_cont > ul').animate({height: 246}, 200);
            $('.aside .script').animate({height: tapContHeight - 196}, 200);               
        }else{
            $('.aside .script .script_box').slideUp(200);
            $('.aside .script').css('height', 'auto')
            $('.aside .tabWrap .tab_cont > ul').animate({height: tapContHeight + scriptBoxHeight}, 200);  
        }
    });

    // script 새창 띄우기
    $('.btn_window_open').one('click', function(e) {
        let windowPop;
        let windowPopWidth = 420;
        let windowPopHeight = 700;
        let windowPopX = (window.screen.width / 2) - (windowPopWidth / 2);
        let windowPopY= (window.screen.height / 2) - (windowPopHeight / 2);

        e.stopPropagation();
        windowPop = window.open(contextPath+'/html_renewal/ko/builder/worker/video_script_only.html', 'Script', 'width=' + windowPopWidth + ', height=' + windowPopHeight + ', top=' + windowPopY + ', left=' + windowPopX);
    });

    // script 검색 기능 - keyboard trigger    
    $('.script_box .srch_box .ipt_txt').keydown(function(key){
        if(key.keyCode == 13){
            $('.script_box .srch_box .btn_srch').trigger('click');
        }else if(key.keyCode == 38){
            $('.script_box .btn_txt_prev').trigger('click');
        }else if(key.keyCode == 40){
            $('.script_box .btn_txt_next').trigger('click');
        }
    });

    // script 검색 기능 - click
    $('.script_box .srch_box .btn_srch').on('click',function(){
        var findTxtField = $('.script_box .srch_box .ipt_txt').val();

        // 검색어 갯수, 검색어 활성화 reset 
        $('.srch_txt_paging .index, .srch_txt_paging .btnBox').remove();

        $('.scrt_txt').find('span.findElement').queue(function() {
            $(this).removeClass('findElement');
            $(this).attr('id', '');
        });

        //검색 단어 표시
        $('.scrt_txt:contains("'+ findTxtField +'")').each(function(){
            var regex = new RegExp(findTxtField, 'gi');

            $(this).html(
                $(this).text().replace(regex, '<span class="findElement">'+ findTxtField +'</span>')
            );
            // 검색 단어 ID 선언
            $(this).find('.findElement').each(function(){
                var findElementIndex = $(this).index();

                findElementIndex = parseInt(findElementIndex) + 1;
                $(this).attr('id', 'findElement'+ findElementIndex);
            });
        });

        if(findTxtField != '' && $('#findElement1').text() == findTxtField){
            // 검색어 갯수 표시
            var findElementAllNum = $('.findElement').length,
                page_prev_num = 1,
                page_next_num = 2;

            $('.srch_txt_paging').append('\
                <div class="index">\
                    <span class="current">'+ page_prev_num + '</span>\
                    &sol;\
                    <span class="total">'+ findElementAllNum + '</span>\
                </div>\
                <div class="btnBox">\
                    <a href="#findElement' + page_prev_num + '" class="btn_move_txt btn_txt_prev" title="이전">\
                        <span class="hide">이전</span>\
                    </a>\
                    <a href="#findElement' + page_next_num + '" class="btn_move_txt btn_txt_next" title="다음">\
                        <span class="hide">다음</span>\
                    </a>\
                </div>\
            ');

            // 첫번째 검색어에 스크롤 이동
            $('.scrt_txt').animate({
                scrollTop: $('#findElement1').offset().top - $('.scrt_txt').offset().top * 2 + $('.scrt_txt').scrollTop() + 650 + ($('.comments').outerHeight() - $('.comments .tit').outerHeight())
            }, 200);

            $('.findElement').removeClass('selected');
            $('#findElement1').addClass('selected');

            // next button
            $('.script_box .btn_txt_next').on('click',function(e){
                if(findElementAllNum > page_prev_num){
                    e.preventDefault();

                    page_prev_num++;
                    page_next_num++;

                    $('.srch_txt_paging .current').text(page_prev_num);
                    $('.script_box .btn_txt_prev').attr('href', '#findElement' + page_prev_num + '');
                    $('.script_box .btn_txt_next').attr('href', '#findElement' + page_next_num + '');

                    $('.findElement').removeClass('selected');
                    $('#findElement' + page_prev_num + '').addClass('selected');
                    
                    var findElementOffset = $('.selected').offset().top,
                        scriptOffsetTop = $('.scrt_txt').offset().top,
                        scriptScrollTop = $('.scrt_txt').scrollTop();

                    $('.scrt_txt').animate({
                        scrollTop: findElementOffset - scriptOffsetTop * 2 + scriptScrollTop + 650 + ($('.comments').outerHeight() - $('.comments .tit').outerHeight())
                    }, 200);                    
                }
            });

            // prev button
            $('.script_box .btn_txt_prev').on('click',function(e){
                if(1 < page_prev_num){
                    e.preventDefault();

                    page_prev_num--;
                    page_next_num--;

                    $('.srch_txt_paging .current').text(page_prev_num);
                    $('.script_box .btn_txt_prev').attr('href', '#findElement' + page_prev_num + '');
                    $('.script_box .btn_txt_next').attr('href', '#findElement' + page_next_num + '');

                    $('.findElement').removeClass('selected');
                    $('#findElement' + page_prev_num + '').addClass('selected');
                    
                    var findElementOffset = $('.selected').offset().top,
                        scriptOffsetTop = $('.scrt_txt').offset().top,
                        scriptScrollTop = $('.scrt_txt').scrollTop();

                    $('.scrt_txt').animate({
                        scrollTop: findElementOffset - scriptOffsetTop * 2 + scriptScrollTop + 650 + ($('.comments').outerHeight() - $('.comments .tit').outerHeight())
                    }, 200);                   
                }
            });
        }else{
            $('.srch_txt_paging').append('\
                <div class="index">\
                    <span class="current">0</span>\
                    &sol;\
                    <span class="total">0</span>\
                </div>\
                <div class="btnBox">\
                    <a href="#none" class="btn_move_txt btn_txt_prev" title="이전">\
                        <span class="hide">이전</span>\
                    </a>\
                    <a href="#none"  class="btn_move_txt btn_txt_next" title="다음">\
                        <span class="hide">다음</span>\
                    </a>\
                </div>\
            ');
        }
    });

    // script 복사 시 태그 제외 순수 텍스트만 복사하기
    window.addEventListener('paste', function(e) {
        e.preventDefault();
        var pastedData = e.clipboardData ||  window.clipboardData;
        // var pastedData = window.clipboardData;
        var textData = pastedData.getData('text/plain');
        window.document.execCommand('insertHTML', false, textData);
    });
});

