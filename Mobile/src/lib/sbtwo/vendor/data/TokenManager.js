export default class TokenManager {
  isInitialized = false;
  _config = {
    tokenRenewInterval: 10 * 60 * 1000,  //10分renew一次
    tokenRenewProvider: null,
    isAnonymous: false,
  }
  apiAccessToken = null;
  _autoRenewTimer = null;

  init = (config, initToken = null) => {
    //console.log('=====TOKEN MANAGER====','init start',JSON.stringify(config))
    if (config) {
      this._config = Object.assign(this._config,config);
      this.isInitialized = true;
    }
    if (initToken) {
      //console.log('=====TOKEN MANAGER====','init with exists token',initToken)
      this.apiAccessToken = initToken;
      return new Promise(resolve => resolve(initToken));
    } else {
      return this.renew();
    }
  }

  renew = () => {
    //console.log('=====TOKEN MANAGER====','renew start')
    if (!(this.isInitialized && this._config.tokenRenewProvider)) {
      this.stopAutoRenew();
      console.error('=====TOKEN MANAGER====',"Renew Error: provider must be specified");
      throw Error("Token renew provider must be specified");
    }
    let that = this;
    return this._config.tokenRenewProvider()
      .then(function (response) {
        //console.log('=====TOKEN MANAGER====','get renew response',response)
        that.apiAccessToken = response.access_token;
        return that.apiAccessToken;
      })
      .catch(function (err) {
        console.error('=====TOKEN MANAGER====',"Renew Error:",err && (err.message || err));
        return null;
      });
  }

  startAutoRenew = () => {
    //console.log('=====TOKEN MANAGER====','startAutoRenew')
    if (this.isInitialized && this._config.tokenRenewInterval && !this._autoRenewTimer) {
      let that = this;
      //console.log('=====TOKEN MANAGER====','startAutoRenew setup done',this._config.tokenRenewInterval)
      this._autoRenewTimer = setInterval(function () { return that.renew(); }, this._config.tokenRenewInterval);
    }
  }
  stopAutoRenew = () => {
    clearInterval(this._autoRenewTimer);
    this._autoRenewTimer = null;
    //console.log('=====TOKEN MANAGER====','stopAutoRenew setup done')
  }

  isAnonymous = () => {
    return this._config.isAnonymous;
  }
}
