/* MINDsLab. NBR. 20210604 */
$(document).ready(function(){
    var video = document.querySelector('.video'),
        playerBar = $('.player_bar'),
        playerSliderBar = $('.player_bar .slider_bar'),
        playerBufferBar = $('.player_bar .buffer_bar'),
        playBtn = $('.btn_play'),
        pauseBtn = $('.btn_play.pause'),
        rewindBtn = $('.btn_rewind'),
        fastFowardBtn = $('.btn_fastFoward'),
        volumeBtn = $('.btn_volume'),
        volumeBar = $('.volume_bar'),
        volumeSliderBar = $('.volume_bar .slider_bar'),
        current = $('.player_time .current'),
        duration = $('.player_time .duration'),
        speedBtn = $('.btn_speed'),
        repeatBtn = $('.btn_repeat');

    // 재생, 일시정지 
    function togglePlay() {
        var method = video.paused ? 'play' : 'pause'; // 비디오 재생 상태에 따른 메소드 호출
        video[method]();
        
        $(this).toggleClass('pause');

        if($(this).is('.pause')){
            $(this).find('.tooltip').text('일시 정지');
        }else{
            $(this).find('.tooltip').text('재생');
        }
    }

    // 볼륨 조절
    function updateVolume(x, vol) {
        if(vol){
            percentage = vol * 100;
        }else{
            position = x - volumeBar.offset().left;
            percentage = 100 * position / volumeBar.width();
        }

        if(percentage > 100){
            percentage = 100;
        }

        if(percentage < 0){
            percentage = 0;
        }

        // update volume bar and video volume
        volumeSliderBar.css('width', percentage + '%');
        video.volume = percentage / 100;

        if(video.volume == 0){
            volumeBtn.removeClass('down').addClass('mute');
            volumeBtn.find('.tooltip').text('음소거 해제(m)');
        }else if(video.volume > 0.5){
            volumeBtn.removeClass('mute').removeClass('down');
            volumeBtn.find('.tooltip').text('음소거(m)');
        }else{
            volumeBtn.removeClass('mute').addClass('down'); 
            volumeBtn.find('.tooltip').text('음소거(m)');               
        }
    }

    // 비디오 시간 세팅
    function timeFormat(seconds){
        var m = Math.floor(seconds / 60) < 10
            ? '0' + Math.floor(seconds / 60)
            : Math.floor(seconds / 60);
        var s = Math.floor(seconds - m * 60) < 10
            ? '0' + Math.floor(seconds - m * 60)
            : Math.floor(seconds - m * 60);
        return m + ':' + s;
    }

    // 버퍼링 바 계산
    function startBuffer(){
        current_buffer = video.buffered.end(0);
        max_duration = video.duration;
        perc = 100 * current_buffer / max_duration;
        playerBufferBar.css('width', perc + '%');

        if(current_buffer < max_duration){
            setTimeout(startBuffer, 500);
        }
    }

    // 재생중 바 업데이트
    function updatebar(x){
        position = x - playerSliderBar.offset().left;
        percentage = 100 * position / playerBar.width();
        if(percentage > 100){
            percentage = 100;
        }
        if(percentage < 0){
            percentage = 0;
        }
        playerSliderBar.css('width', percentage + '%');
        video.currentTime = video.duration * percentage / 100;
    }

    // 비디오 시간 초기입력
    video.addEventListener('loadedmetadata', function(){
        current.text(timeFormat(0));
        duration.text(timeFormat(video.duration));
        updateVolume(0, 1);
        setTimeout(startBuffer, 150);
    });

    // 재생 버튼 클릭 시
    playBtn.on('click', togglePlay);

    // 비디오 시간 업데이트
    video.addEventListener('timeupdate', function(){
        current.text(timeFormat(video.currentTime));
        duration.text(timeFormat(video.duration));
        var currentPos = video.currentTime;
        var maxduration = video.duration;
        var perc = 100 * video.currentTime / video.duration;

        playerSliderBar.css('width', perc + '%');
        if(perc == 100){
            playBtn.removeClass('pause');
        }
    });

    // 비디오 바 드래그 시
    var timeDrag = false;

    playerBar.on('mousedown', function(e){
        timeDrag = true;
        updatebar(e.pageX);
    });
    $(document).on('mouseup', function(e){
        if(timeDrag){
            timeDrag = false;
            updatebar(e.pageX);
        }
    });
    $(document).on('mousemove', function(e){
        if(timeDrag){
            updatebar(e.pageX);
        }
    });    

    // 볼륨 바 드래그 시
    var volumeDrag = false;

    volumeBar.on('mousedown', function(e){
        volumeDrag = true;
        video.muted = false;
        volumeBtn.removeClass('mute');
        updateVolume(e.pageX);
    }); 
    $(document).on('mouseup', function(e){
        if(volumeDrag){
            volumeDrag = false;
            updateVolume(e.pageX);
        }
    }) 
    $(document).on('mousemove', function(e){
        if(volumeDrag){
            updateVolume(e.pageX);
        }
    });

    // 볼륨 버튼 클릭 시
    volumeBtn.on('click', function(){
        video.muted = !video.muted;
        $(this).toggleClass('mute');
        if(video.muted){
            volumeSliderBar.css('width', 0);
            $(this).find('.tooltip').text('음소거 해제(m)');
        }else{
            volumeSliderBar.css('width', video.volume * 100 + '%');
            $(this).find('.tooltip').text('음소거(m)');
        }
    });

    // 속도설정 버튼 클릭 시
    speedBtn.on('click', function(){
        $('.speedSet').toggleClass('on');
        $('.speed_list li').on('click', function(){
            $('.speed_list li').removeClass('active');
            $(this).addClass('active');
            /* 20210716 Added by KJY : 영상 재생 속도 조절 */
            video.playbackRate = !isNaN($(this).data("rate")) ? $(this).data("rate") : video.playbackRate;
        });
    });

    // 반복재생 버튼 클릭 시
    repeatBtn.on('click', function(){
        $(this).toggleClass('on');
        /* 20210716 Added by KJY 자동 반복 토글 */
        $(this).is('.on') ? video.setAttribute('loop', '') : video.removeAttribute('loop');
    });

    /* 20210716 Added by KJY */
    // 뒤로감기, 건너뛰기 버튼 클릭 시
    rewindBtn.on('click', function() {
        video.currentTime -= 1;
    });
    fastFowardBtn.on('click', function() {
        video.currentTime += 1;
    });
});