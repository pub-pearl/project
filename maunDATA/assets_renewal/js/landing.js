/* MINDsLab. NBR. 20210422 */

// 공통변수
var htmlBody = document.getElementById('body');

// header 스크롤 효과
function headerScrollFunc(e){ 
    var header = document.getElementById('header');
    var scrollX = window.pageXOffset;

    header.style.left = '-' + scrollX +'px';

    if (pageYOffset > 5){ 
        header.classList.add('fixed'); 
    }else{ 
        header.classList.remove('fixed'); 
    } 
} 
window.addEventListener('load', headerScrollFunc);
window.addEventListener('scroll', headerScrollFunc);

// header 언어선택 (웹, 모바일 별 기능)
// var langSelectWrap = document.querySelector('.lang_slt_wrap'),
//     langSelectBox = document.querySelector('.slt_box'),
//     langSelectBtn = document.getElementsByClassName('btn_lang_slt');

// function webLangSeleceFunc(){
//     langSelectBox.addEventListener('click', function(){
//         langSelectWrap.classList.add('open');
//         for(var i = 0; i < langSelectBtn.length; i++){
//             langSelectBtn[i].classList.add('on');
//             langSelectBtn[i].addEventListener('click', function(e){
//                 var target = e.target;
//                 langSelectWrap.classList.remove('open');
//                 if(target.classList.contains('lang_ko')){
//                     document.querySelector('.lang_en').classList.remove('on');
//                 }else{
//                     document.querySelector('.lang_ko').classList.remove('on');
//                 }
//             });
//         }    
//     });
// }
// function mobileLangSeleceFunc(){
//     function btnClick(i){
//         langSelectBtn[i].addEventListener('click', function(){
//             langSelectBtn[i].classList.add('on');
//             if(langSelectBtn[i].classList.contains('lang_ko')){
//                 document.querySelector('.lang_en').classList.remove('on');
//             }else{
//                 document.querySelector('.lang_ko').classList.remove('on');
//             }
//         });
//     }
//     for(var i = 0; i < langSelectBtn.length; i++){
//         btnClick(i);  
//     }   
// }
// window.addEventListener('load', function(){
//     if(window.innerWidth <= 768){
//         mobileLangSeleceFunc();
//     }else{
//         webLangSeleceFunc();
//     }
// });
// window.addEventListener('resize', function(){
//     if(window.innerWidth <= 768){
//         mobileLangSeleceFunc();
//     }else{
//         webLangSeleceFunc();
//     }
// });   

// header 모바일 메뉴 햄버거 버튼
var hamBtn = document.querySelector('.btn_ham'),
    sta = document.querySelector('.sta'),
    headerCont = document.getElementById('header'),
    clicked = false;

hamBtn.addEventListener('click', function(){
    if(!hamBtn.classList.contains('active')){
        var bgDim = document.createElement('div');
        bgDim.classList.add('bg_dim');

        hamBtn.classList.add('active');
        sta.classList.add('active');
        htmlBody.style.overflow = 'hidden';       
        headerCont.insertBefore(bgDim, headerCont.childNodes[0]);
        clicked = true;

        bgDim.addEventListener('click', function(){
            hamBtn.classList.remove('active');
            sta.classList.remove('active');
            htmlBody.style.overflow = '';
            headerCont.removeChild(headerCont.childNodes[0]);
            clicked = false;
        });
    }else if(hamBtn.classList.contains('active')){
        hamBtn.classList.remove('active');
        sta.classList.remove('active');
        htmlBody.style.overflow = '';
        headerCont.removeChild(headerCont.childNodes[0]);
        clicked = false;
    }
});

// 공통 layer popup
var lyrOpenBtn = document.getElementsByClassName('btn_lyr_open');

function layerPopupOpenFunc(){
    var layerBg = document.createElement('div');
    layerBg.classList.add('lyr_bg');

    for(var i = 0; i < lyrOpenBtn.length; i++){
        lyrOpenBtn[i].addEventListener('click', function(e){
            var target = e.target,
                lyrHref = target.getAttribute('href'),
                lyrId = document.querySelector(lyrHref),
                lyrCloseBtn = lyrId.querySelector('.btn_lyr_close');
                       
            htmlBody.style.overflow = 'hidden';
            lyrId.insertBefore(layerBg, lyrId.childNodes[0]);
            lyrId.style.display = 'block';

            lyrCloseBtn.addEventListener('click', function(){
                lyrId.style.display = 'none'; 
                htmlBody.style.overflow = '';       
            });
            layerBg.addEventListener('click', function(){               
                lyrId.style.display = 'none';    
                htmlBody.style.overflow = '';             
            });
        });
    }    
}
window.addEventListener('load', layerPopupOpenFunc);
 





