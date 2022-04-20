$(function(){

	// dropdown
	$('.form.dropdown').each(function(){
		var thisSelect = $(this).find('.select');
		var thisDrop = thisSelect.siblings('.drop-cont');

		thisSelect.on('click',function(){
			$(this).addClass('active');
			thisDrop.slideDown(200);
		});

		$(document).mouseup(function (){
			var dropbox = $(".drop-cont");
			if(dropbox.has(thisDrop).length === 0){
				dropbox.slideUp(300);
			}
		});
	});
	
	// 더보기, 로그인 클릭 시 팝업
	$('.more').each(function(){
		$(this).on('click',function(){
			var btnX = $(this).offset().left;
			var btnY = $(this).offset().top;
			$(this).siblings('.more-cont').fadeIn(300).css({
				"top" : btnY + 'px',
				"left" : btnX + 'px'
			});
		});
	});

	$('.my-info .login').each(function(){
		$(this).on('click',function(){
			var _this = $(this).siblings('.more-cont');
			_this.fadeIn(300);
		});
	});

	// 외부 영역 클릭 시 닫기
	$('.more-cont').hide();
	setInterval(function () {
		$(document).mouseup(function (e){
			var LayerPopup = $(".more-cont");

			if(LayerPopup.has(e._this).length === 0){
				LayerPopup.fadeOut(300);
			}
		});
	}, 1000);

	//textarea auto size 신시아에는 라이브러리로 되어있음
	$(".pop-form .autosize textarea").on('keydown keyup', function () {
		$(this).height(1).height( $(this).prop('scrollHeight') );	
	  });

	$(".autosize textarea").on('keyup', function (key) {
		if(key.keyCode==13 || key.on('keyup')) {
            $(this).height( $(this).prop('scrollHeight'));
        }	
	});

	// textarea focus
	$('.form textarea').on('focus',function(){ 
		$(this).parents('.form').addClass('active');
	}).on('focusout',function(){
		$(this).parents('.form').removeClass('active');
	});

	// 글자 수
	$('.form textarea').keyup(function(){

		var textNum = $('.text-num span');
		var inpLength = $(this).val().length;

		if (inpLength == 0 || inpLength == '') { 
			textNum.text('0'); 
		} else { 
			textNum.text(inpLength); 
		}

		if (inpLength > 600){
			textNum.val($(this).val().substring(0, 600));
		}
	});

	// 레이아웃 잠금 토글
	$('.ico-btn.lock').on('click',function(){
		$(this).toggleClass('active');
	});

	// 영상미리보기 재생버튼
	$('.video-status .play').on('click',function(){
		$(this).toggleClass('pause');
	});

	// 영상 비율
	$('.screen-rate .btn-txt').on('click',function(){
		$(this).siblings('.late-list').fadeToggle();
	});
});
