(function ($) {
    $.getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };
    $.checkPasswd = function(passwd, compare, minLength) {
        if(minLength == null || minLength <= 0) minLength = 8;
        if($.isEmpty(passwd)) {
            $.alert("패스워드를 입력해 주세요.");
            return false;
        }
        if(passwd.length < minLength) {
            $.alert("패스워드 최소 길이는 "+minLength+"자 입니다.");
            return false;
        }
        if(compare != null && passwd != compare) {
            $.alert("패드워드가 동일한지 확인해 주세요.");
            return false;
        }
        return true;
    };
    $.checkEmail = function(email) {
        if($.isEmpty(email)) return false;

        var regex = /([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
        return(email != '' && email != 'undefined' && regex.test(email));
    };
    $.checkSaup = function(inputUnit) {
        var regExp = /^(?:[0-9]{3})-(?:[0-9]{2})-(?:[0-9]{5})$/;
        var string = inputUnit.split("-").join("");
        if($.isEmpty(string)) {
            return false;
        }
        string = string.substring(0,3)+"-"+string.substring(3,5)+"-"+string.substring(5);
        if(regExp.test(string)) {
            return true;
        } else {
            return false;
        }
    };
    $.checkJumin = function(inputUnit) {
        var regExp = /^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))-[1-4][0-9]{6}$/;
        // year      month            day(10)     day(1)        -
        var string = inputUnit.split("-").join("");
        if($.isEmpty(string)) {
            return false;
        }
        string = string.substring(0,6)+"-"+string.substring(6);
        if(regExp.test(string)) {
            return true;
        } else {
            return false;
        }
    };
    $.checkBirth = function(inputUnit) {
        var regExp = /^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))$/;
        // year      month            day(10)     day(1)        -
        var string = inputUnit.split("-").join("");
        if($.isEmpty(string)) {
            return false;
        }
        //string = string.substring(0,6);
        if(regExp.test(string)) {
            return true;
        } else {
            return false;
        }
    };
})(jQuery);