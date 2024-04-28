class MockLogin{
  //Singleton
  constructor () {
    if (!MockLogin._instance) {
      console.log('MockLogin new instance');
      MockLogin._instance = this;
    }

    return MockLogin._instance;
  }

  //brand = 'jbo';
  brand = 'fun88';
  //brand = 'BETWAY';

  loginParams = {
    jbo: {
      common_url: 'https://gateway.jb88app.com', //JBO線上
      username: 'kohvip1',
      password: 'qwer1234',

      // username: 'fedevtest4',
      // password: 'asdf1234',

      // username: 'claude002', //沒錢
      // password: 'abcd1234',


      // common_url: 'https://gatewaystaging.jbo88.biz', //JBO測試
      // username: 'brcnst3',
      // password: '123qwe',
    },
    fun88: {
      common_url: 'https://gateway.fun88.biz', //fun測試
      username: 'benji0088',
      password: '123qwe',

      // username: 'claude003',
      // password: 'abcd1234',

      // username: 'claude004', //沒錢
      // password: 'abcd1234',
    },
    BETWAY: {
      // common_url: 'https://kongstagingbetway178-dev.gamealiyun.com', //BW測試
      common_url: 'http://localhost:9789',  //node proxy
      // username: 'prodtestcny001',
      // password: 'asdf1234',

      username: 'benji007',
      password: '123qwe',
    }
  }

  isLogin = {
    jbo:false,
    fun88:false,
    BETWAY:false,
  }
  token = {
    jbo:null,
    fun88:null,
    BETWAY:null,
  }

  IM_Token = null;
  IM_MemberCode = '';

  BTI_Token = null;
  BTI_MemberCode = '';

  doMockLogin(){
    if (this.brand === 'jbo') {
      return this.doMockLoginJBO();
    }

    if (this.brand === 'fun88') {
      return this.doMockLoginFUN88()
    }

    if (this.brand === 'BETWAY') {
      return this.doMockLoginBW()
    }
  }

  doMockLoginJBO(){
    console.log('doMockLoginJBO');

    const apiUrl = '/api/Login?';

    const loginParams = this.loginParams.jbo;

    let data = {
      "hostName": loginParams.common_url,
      "username": loginParams.username,
      "password": loginParams.password,
      "e2": '',
      "grantType": "password",
      "clientId": "JBO.gb2bc",
      "clientSecret": "JBOmuitten",
      "scope": "Mobile.Service offline_access",
      "appId": "net.gb2bc.jbo",
      "siteId": 8,
    }

    data = Object.assign(data,this.logindata);

    let that = this;
    return new Promise(function(resolve, reject) {
      if (that.isLogin.jbo === true) {
        resolve(true);
        return;
      }

      that.fetchRequest('jbo', apiUrl, 'POST', data)
        .then(data => {
          if (data.accessToken) {
            console.log('doMockLoginJBO success');

            //jbo
            that.token.jbo = data.accessToken.token_type + ' ' + data.accessToken.access_token // 寫入用戶token  token要帶Bearer

            that.isLogin.jbo = true;
            resolve(data);
          } else {
            that.isLogin.jbo = false;
            const errors = JSON.parse(data.content)
            reject(errors);
          }
        }).catch((error) => {
          reject(error);
        })
    });
  }

  doMockLoginFUN88(){
    console.log('doMockLoginFUN88');
    const apiUrl = '/api/Login?';

    const loginParams = this.loginParams.fun88;

    let data = {
      "hostName": loginParams.common_url,
      "username": loginParams.username,
      "password": loginParams.password,
      "e2": '',
      grantType: "password",
      clientId: "Fun88.CN.App",
      clientSecret: "FUNmuittenCN",
      scope: "Mobile.Service offline_access",
      appId: "net.funpodium.FUN88",
      siteId: 31,
    }

    data = Object.assign(data,this.logindata);

    let that = this;
    return new Promise(function(resolve, reject) {
      if (that.isLogin.fun88 === true) {
        console.log('is logined no need to login again')
        resolve(true);
        return;
      }

      that.fetchRequest('fun88',apiUrl, 'POST', data)
        .then(data => {
          if (data.accessToken) {
            console.log('doMockLoginFUN88 success');

            //fun
            that.token.fun88 = data.accessToken.token_type + ' ' + data.accessToken.access_token // 寫入用戶token  token要帶Bearer

            that.isLogin.fun88 = true;
            resolve(data);
          } else {
            that.isLogin.fun88 = false;
            const errors = JSON.parse(data.content)
            reject(errors);
          }
        }).catch((error) => {
        reject(error);
      })
    });
  }

  doMockLoginBW(){
    console.log('doMockLoginBW');
    const apiUrl = '/get/token';

    const loginParams = this.loginParams.BETWAY;

    let data = {
      "username": loginParams.username,
      "password": loginParams.password,
      grant_type: "password",
      client_id: "Betway.CN.App",
      client_secret: "BWmuittenCN",
      scope: "Mobile.Service offline_access",
      appId: "nettium.tlc.native",
      siteId: 2,
    }

    data = Object.assign(data,this.logindata);

    let that = this;
    return new Promise(function(resolve, reject) {
      if (that.isLogin.BETWAY === true) {
        resolve(true);
        return;
      }

      that.fetchRequest('BETWAY',apiUrl, 'POST', data, false, true)
        .then(data => {
          if (data.access_token) {
            console.log('doMockLoginBW success');

            //fun
            that.token.BETWAY = data.token_type + ' ' + data.access_token // 寫入用戶token  token要帶Bearer

            that.isLogin.BETWAY = true;
            resolve(data);
          } else {
            that.isLogin.BETWAY = false;
            const errors = JSON.parse(data.content)
            reject(errors);
          }
        }).catch((error) => {
        reject(error);
      })
    });
  }

  //获取im体育token数据
  getIMToken(brandname = 'jbo') {
    let that = this;
    return new Promise(function(resolve, reject) {
      let hostname = '';
      if (brandname === 'jbo') {
        hostname = 'imnative';
      }

      if (brandname === 'fun88') {
        hostname = 'imnative';
      }

      if (brandname === 'BETWAY') {
        hostname = 'www.betway88.com';
      }

      that.fetchRequest(brandname, '/api/Vendor/IPSB/Token?hostname='+hostname+'&', 'GET')
        .then((data) => {

          console.log('IM token',data);

          if (data.isGameLocked) {
            that.isGameLock = true;
            reject('gameIsLoecked');
            return;
          } else {
            that.isGameLock = false;
          }
          if (data.token) {
            that.IM_Token = data.token;

            if (brandname === 'jbo') {
              that.IM_MemberCode = data.playerId;
            }

            if (brandname === 'fun88') {
              that.IM_MemberCode = data.memberCode;
            }

            if (brandname === 'BETWAY') {
              that.IM_MemberCode = data.memberCode;
            }

            localStorage.setItem(
              "IM_Token",
              JSON.stringify(that.IM_Token)
            );

            localStorage.setItem(
              "IM_MemberCode",
              JSON.stringify(that.IM_MemberCode)
            );

            resolve(data);
          } else {
            reject('no token?');
          }
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  getBTIToken(sbt = false,brandname = 'fun88') {
    let that = this;
    return new Promise(function(resolve, reject) {
      let hostname = '';
      if (brandname === 'jbo') {
        hostname = 'imnative';
      }

      if (brandname === 'fun88') {
        hostname = 'imnative';
      }

      if (brandname === 'BETWAY') {
        hostname = 'www.betway88.com';
      }

      that.fetchRequest(brandname, '/api/Vendor/' + (sbt ? 'SBT' : 'BTI') + '/Token?hostname='+hostname+'&', 'GET')
        .then((data) => {

          console.log('BTI token',data);

          if (data.isGameLocked) {
            that.isGameLock = true;
            reject('gameIsLoecked');
            return;
          } else {
            that.isGameLock = false;
          }
          if (data.token) {
            that.BTI_Token = data.token;

            if (brandname === 'jbo') {
              that.BTI_MemberCode = data.playerId;
            }

            if (brandname === 'fun88') {
              that.BTI_MemberCode = data.memberCode;
            }

            if (brandname === 'BETWAY') {
              that.BTI_MemberCode = data.memberCode;
            }

            localStorage.setItem(
              "BTI_Token",
              JSON.stringify(that.BTI_Token)
            );

            localStorage.setItem(
              "BTI_MemberCode",
              JSON.stringify(that.BTI_MemberCode)
            );

            resolve(data);
          } else {
            reject('no token?');
          }
        })
        .catch((error) => {
          reject(error);
        })
    });
  }

  fetchRequest(brandname, url, method, params = '', withAPIVersion = true, useFormData = false){
    let apiversion = 'api-version=1.0&brand=' + brandname + '&Platform=Mobile';
    if (!withAPIVersion) {
      apiversion = '';
    }

    let header;
    if (this.isLogin[brandname] === true) {
      header = {
        "Content-Type": "application/json; charset=utf-8",
        "Culture": "zh-cn",
        'Authorization': this.token[brandname],
      };
    } else {
      header = {
        "Content-Type": "application/json; charset=utf-8",
        "Culture": "zh-cn"
      };
    }

    let that = this;

    return new Promise(function (resolve, reject) {
      let init = {
        method: method,
        headers: header,
      }

      if (params !== '') {
        if (useFormData) {
          let formData = new FormData();
          for(const propName in params) {
            formData.append(propName, params[propName]);
          }
          header["Content-Type"] = 'application/x-www-form-urlencoded';
          init.body = new URLSearchParams(formData);
        } else {
          init.body = JSON.stringify(params) //body参数，通常需要转换成字符串后服务器才能解析
        }
      }

      that.timeout_fetch(fetch(that.loginParams[brandname].common_url + url + apiversion, init))
        .then((response) => response.json())
        .then((responseData) => {
          if (responseData.error_details) {
            reject(responseData.error_details)
          } else {
            resolve(responseData);
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 让fetch也可以timeout
   *  timeout不是请求连接超时的含义，它表示请求的response时间，包括请求的连接、服务器处理及服务器响应回来的时间
   * fetch的timeout即使超时发生了，本次请求也不会被abort丢弃掉，它在后台仍然会发送到服务器端，只是本次请求的响应内容被丢弃而已
   * @param {Promise} fetch_promise    fetch请求返回的Promise
   * @param {number} [timeout=40000]   单位：毫秒，这里设置默认超时时间为10秒
   * @return 返回Promise
   */
  timeout_fetch(fetch_promise, timeout = 40000) {
    let timeout_fn = null;

    //这是一个可以被reject的promise
    let timeout_promise = new Promise(function(resolve, reject) {
      timeout_fn = function() {
        resolve('请求超时!!!');
      };
    });
    //这里使用Promise.race，以最快 resolve 或 reject 的结果来传入后续绑定的回调
    let abortable_promise = Promise.race([
      fetch_promise,
      timeout_promise
    ]);

    setTimeout(function() {
      timeout_fn();
    }, timeout);

    return abortable_promise;
  }
}

const MockLoginSingleton = new MockLogin();
if (typeof window !== "undefined") {
  window.MockLoginInstance = MockLoginSingleton;
}

export default MockLoginSingleton;