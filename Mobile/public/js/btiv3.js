(
    function(){
        function whl() {}

        function jsonp(url, successCallback, failCallback) {
            var callbackName = 'jsoncb';
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                successCallback(data);
            };

            var script = document.createElement('script');
            script.src = url;
            script.onerror = failCallback;
            document.body.appendChild(script);
        }

        function getUrlVars(name) {
            var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            var myVar = match && decodeURIComponent(match[1].replace(/\+/g, ' '));
            if (myVar != undefined) {
                if (myVar.slice(-1) == '/') myVar = myVar.slice(0, -1);
            }
            return myVar;
        }

        function parseFormat(strArg) {
            var
                output = "{",  /* Output */
                str = strArg.trim();  /* Remove unwanted space before processing */

            str.split('\n').forEach(function (line) {
                var item = line.split('=');
                output += "\"" + item[0] + "\":\"" + item[1] + "\",";
            });
            output = output.substring(0, output.length - 1);
            output += "}";
            return output;
        }

        function noop(){}

        var SportsCookie = {
            setCookie: function (cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toGMTString();
                document.cookie = cname + "=" + cvalue + "; path=/; " + expires + "; SameSite=None; Secure";
            },
            getCookie: function (cname) {
                var name = cname + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i].trim();
                    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
                }
                return "";
            },
            deleteCookie: function (cname) {
                document.cookie = cname + "= ; path=/; expires = Thu, 01 Jan 1970 00:00:00 GMT";
            }
        }

        /* Constants*/
        var getStatusUrl = '/Services/SbTechMemberInfoNewService.ashx';
        var URL_PARAM_NAME_TOKEN = "operatorToken";
        var COOKIE_PARAM_NAME_TOKEN = "operatorToken";
        var SESSION_PARAM_NAME_TOKEN = "operatorToken";
        
        var URL_PARAM_NAME_REFER = "ReferURL";
        var COOKIE_PARAM_NAME_REFER = "ReferURL";
        var SESSION_PARAM_NAME_REFER = "ReferURL";
        
        var URL_PARAM_SESSION_TOKEN = "sessionToken";
        var COOKIE_PARAM_SESSION_TOKEN = "sessionToken";
        var SESSION_PARAM_SESSION_TOKEN = "sTokenSession";

        /* Init token */
        var strUrlToken = getUrlVars(URL_PARAM_NAME_TOKEN);
        var strCookieToken = SportsCookie.getCookie(COOKIE_PARAM_NAME_TOKEN);
        var strStoken = sessionStorage.getItem(SESSION_PARAM_NAME_TOKEN);
        var strToken = '';
        
        var strUrlReferURL = getUrlVars(URL_PARAM_NAME_REFER);
        var strCookieReferURL = SportsCookie.getCookie(COOKIE_PARAM_NAME_REFER);
        var strSReferURL = sessionStorage.getItem(SESSION_PARAM_NAME_REFER);

        var strUrlSessionToken = getUrlVars(URL_PARAM_SESSION_TOKEN);
        var strCookieSessionToken = SportsCookie.getCookie(COOKIE_PARAM_SESSION_TOKEN);
        var strSSessionToken = sessionStorage.getItem(SESSION_PARAM_SESSION_TOKEN);
        var strSessionToken = '';

        var memberSportsbookBalance = ''; /*no longer used in v3*/

        /* Set token to all potential storages */
        if (strUrlToken != '' && strUrlToken != undefined) {
            strToken = strUrlToken;
            SportsCookie.setCookie(COOKIE_PARAM_NAME_TOKEN, strUrlToken, 1);
            sessionStorage.setItem(SESSION_PARAM_NAME_TOKEN, strUrlToken);
        } else if (strCookieToken != '' && strUrlToken != undefined) {
            strToken = strCookieToken;
            sessionStorage.setItem(SESSION_PARAM_NAME_TOKEN, strCookieToken);
        } else if (strStoken != '' && strStoken != undefined) {
            strToken = strStoken;
            SportsCookie.setCookie(COOKIE_PARAM_NAME_TOKEN, strStoken, 1);
        }
        
        if(strUrlReferURL != '' && strUrlReferURL != undefined) {
            SportsCookie.setCookie(COOKIE_PARAM_NAME_REFER, strUrlReferURL, 1);
            sessionStorage.setItem(SESSION_PARAM_NAME_REFER, strUrlReferURL);
        } else if (strCookieReferURL != '' && strUrlReferURL != undefined) {
            strUrlReferURL = strCookieReferURL;
            sessionStorage.setItem(SESSION_PARAM_NAME_REFER, strCookieReferURL);
        } else if (strSReferURL != '' && strSReferURL != undefined) {
            strUrlReferURL = strSReferURL;
            SportsCookie.setCookie(COOKIE_PARAM_NAME_REFER, strSReferURL, 1);
        }

        if (strUrlSessionToken != '' && strUrlSessionToken != undefined) {
            strSessionToken = strUrlSessionToken;
            SportsCookie.setCookie(URL_PARAM_SESSION_TOKEN, strUrlSessionToken, 1);
            sessionStorage.setItem(URL_PARAM_SESSION_TOKEN, strUrlSessionToken);
        } else if (strCookieSessionToken != '' && strCookieSessionToken != undefined) {
            strSessionToken = strCookieSessionToken;
            sessionStorage.setItem(COOKIE_PARAM_SESSION_TOKEN, strCookieSessionToken);
        } else if (strSSessionToken != '' && strSSessionToken != undefined) {
            strSessionToken = strSSessionToken;
            SportsCookie.setCookie(SESSION_PARAM_SESSION_TOKEN, strSSessionToken, 1);
        }


        whl.prototype.login = function (username, password, callback) {
            console.error('Login method is not implemented!')
        };

        whl.prototype.logout = function () {
            SportsCookie.deleteCookie(COOKIE_PARAM_NAME_TOKEN);
            sessionStorage.removeItem(SESSION_PARAM_NAME_TOKEN);
        };

        whl.prototype.resetPassword = noop;
        whl.prototype.registrationForm = noop;
        whl.prototype.bank = noop;
        whl.prototype.formClose = noop;
        whl.prototype.updateProfile = noop;
        whl.prototype.showFormPanel = noop;

        /* STATUS - no longer used in v3*/
        whl.prototype.status = function (callback) {
            this.status_callback = callback;
            var that = this;
            var result = {};

            if (strToken != "logout" && strToken != "") {
                var balanceUrl = strUrlReferURL + getStatusUrl + '?token=' + strToken + '&sessionToken=' + strSessionToken + '&r=' + new Date().getTime();
                jsonp(balanceUrl,
                    function(data){ /*success callback*/
                        result.uid = new Date().getTime();
                        result.token = strToken;
                        result.status = "real";
                        result.balance = data.Balance;
                        result.message = "success";
                        that.statusCallback(result);
                }, 
                    function() { /*fail callback*/
                        result.uid = new Date().getTime();
                        result.token = strToken;
                        result.status = "anon";
                        result.balance = 0;
                        result.message = "fail";
                        that.statusCallback(result);
                    })
            } else {
                that.logout();
                UserInfo.logout();
            }
        }

        /* REFRESH SESSION */
        whl.prototype.refreshSession = function (callback) {
            this.refresh_callback = callback;
            var that = this;
            var result = {};
            if (strToken != "logout" && strToken != "") {
                var balanceUrl = strUrlReferURL + getStatusUrl + '?token=' + strToken + '&sessionToken=' + strSessionToken + '&r=' + new Date().getTime();
                jsonp(balanceUrl,
                    function(data){ /*success callback*/
                        result.uid = new Date().getTime();
                        result.token = strToken;
                        result.status = "success";
                        result.balance = data.Balance;
                        result.message = "success";
                        that.refreshCallback(result);
                    },
                    function() { /*fail callback*/
                        result.uid = new Date().getTime();
                        result.token = strToken;
                        result.status = "failure";
                        result.balance = 0;
                        result.message = "fail";
                        that.refreshCallback(result);
                    })
            } else {
                that.logout();
                UserInfo.logout();
            }
        }

        /*no longer used in v3*/
        whl.prototype.statusCallback = function (data) {
            if (this.status_callback) {
                var result = {};
                result.uid = data.uid;
                result.token = data.token;
                result.status = data.status;
                result.balance = data.balance;
                memberSportsbookBalance = data.balance;
                result.message = data.message;
                this.status_callback(result);
            }
        }

        whl.prototype.refreshCallback = function (data) {
            if (this.refresh_callback) {
                var result = {};
                result.token = data.token;
                result.status = data.status;
                result.balance = data.balance;
                result.message = data.message;
                this.refresh_callback(result);
            }
        }

        window.whl = new whl();
    }
)()
