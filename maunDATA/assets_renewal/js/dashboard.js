/* MINDsLab. NBR. 20210716 */
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

    
    // snb 열기 / 닫기
    $('.btn_ham').on('click', function(e){
        e.stopPropagation();
        $('#snb').addClass('open');
    });
    
    // snb 외 영역 클릭 시에도 닫기
    $('html').on('click', function(e){
        e.stopPropagation();
        if($(e.target).is('#snb')){
            console.log('test')
            $('#snb').removeClass('open');
        }
    });

    
    // snb 메뉴 active 
    $('#snb .nav li a').on('click', function(e){
        e.stopPropagation();

        var listNum = $('#snb .nav li').length;
        var thisListIndex = $(this).parent('li').index(),
            thisListIndex = thisListIndex + 1;

        if(listNum !== thisListIndex){
            $('#snb .nav li').removeClass('active');
        }
        
        $(this).parent('li:not(:last-child)').addClass('active');
    });


    // table tap 
    $('.tbl_tap_wrap .tapBtn li').on('click', function(){
        $('.tbl_tap_wrap .tapBtn li').removeClass('active');
        $(this).addClass('active');
    }); 


    // table 목록 선택 / 미리보기 aside 열기 / 닫기
    $('.tblBox.type01 table tbody tr').on('click', function(){
        var tableName = $(this).parents('table').data('tbl-name'),
            asideId = '#' + tableName;

        if($(this).parents('table').is('[data-tbl-name]')){
            $('.tblBox table tbody tr').removeClass('selected');
            $(this).addClass('selected');
        }

        // open
        $('body').css('overflow', 'hidden');
        $(asideId).addClass('open');
        $(asideId).prepend('<div class="aside_bg"></div>');
        
        // close 
        $('.aside_bg, .btn_aside_close').on('click',function(){
            $('body').css('overflow', '');
            $(asideId).removeClass('open');
            $('.aside_bg').remove(); 
            $('.tblBox table tbody tr').removeClass('selected');
        });
    });


    // table checkbox 개별 / 전체 선택
    $('.allChk').on('click', function(){
        var thisTableBox = $(this).parents('.icld_chk'),
            allCheck = $(this).prop('checked'); 
        
        if(allCheck){
            thisTableBox.find('.eachChk').prop('checked', true); 
            $('.btn_list_remove, .btn_list_restore').addClass('on').prop('disabled', false);
        }else{
            thisTableBox.find('.eachChk').prop('checked', false); 
            $('.btn_list_remove, .btn_list_restore').removeClass('on').prop('disabled', true); 
        }
    });
    
    // 모든 체크박스를 클릭하면 버튼 활성화시키기
    $('.eachChk').on('click', function(e){
        e.stopPropagation();

        var thisTableBox = $(this).parents('.icld_chk'),
            eachCheck = $(this).prop('checked'); 
            
        // 자식 체크 전체 체크시, 부모 체크박스 체크 됨
        var checkBoxLength = thisTableBox.find('.eachChk').length,
            checkedLength = thisTableBox.find('.eachChk:checked').length;
        
        // 선택한 체크박스 값이 true 이거나 체크박스 1개 이상 체크시 버튼 활성화시키기
        if(eachCheck == true || checkedLength > 0){
            $('.btn_list_remove, .btn_list_restore').addClass('on').prop('disabled', false);
        }else{
            $('.btn_list_remove, .btn_list_restore').removeClass('on').prop('disabled', true); 
        }
               
        // 체크박스가 모두 선택되었을 때 상위 체크박스 선택되도록 설정
        if(checkBoxLength == checkedLength){
            thisTableBox.find('.allChk').prop('checked', true); 
        }else{
            thisTableBox.find('.allChk').prop('checked', false);
        }       
    });


    // input - 금액 입력 시 천단위 콤마 넣기
    var priceInput = $('.ipt_txt.price');

    priceInput.on('keyup', function(e){
        var selection = window.getSelection().toString();

        if(selection !== ''){
            return;
        }
        if($.inArray(e.keyCode, [38,40,37,39]) !== -1){
            return;
        }
        
        var $this = $(this);
        var priceInput = $this.val();
        var priceInput = priceInput.replace(/[\D\s\._\-]+/g, '');
    
        priceInput = priceInput ? parseInt(priceInput, 10) : 0;
    
        $this.val(function(){
            return(priceInput === 0) ? '' : priceInput.toLocaleString('en-US');
        });    
    });


    // contenteditable div에 텍스트 붙여넣기 시 태그 제외한 순수 텍스트만 넣기
    window.addEventListener('paste', function(e) {
        e.preventDefault();
        var pastedData = event.clipboardData ||  window.clipboardData;
        var textData = pastedData.getData('text/plain');
        window.document.execCommand('insertHTML', false, textData);
    });
});
