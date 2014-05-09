// The MIT License (MIT)
// Copyright © 2013 Mechanobiology Institute, National University of Singapore.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


/**
 * @fileoverview Google Appengine authentication.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.web.GaeAuth');
goog.require('goog.Timer');
goog.require('goog.async.Delay');
goog.require('mbi.web.base');
goog.require('ydn.client.AdaptorClient');
goog.require('ydn.client.FilteredClient');
goog.require('ydn.client.OAuthProvider');



/**
 * Create Google Appengine authentication app.
 * @constructor
 * @struct
 * @implements {ydn.client.OAuthProvider}
 */
mbi.web.GaeAuth = function() {

  /**
   * Auth result.
   * @type {YdnApiUser}
   * @private
   */
  this.auth_result_ = null;

  /**
   * @type {boolean}
   * @private
   */
  this.auth_ = false;

  /**
   * @type {boolean}
   * @private
   */
  this.runing_ = false;
  /**
   * @type {YdnApiToken}
   * @private
   */
  this.gdata_token_ = null;
  /**
   * @type {goog.async.Deferred}
   * @private
   */
  this.df_gdata_token_ = null;

  var me = this;
  if (chrome && chrome.runtime) {
    chrome.runtime.onMessageExternal.addListener(
        function(request, sender, sendResponse) {
          window.console.log(sender['url'] + ' ' + request);
          if (goog.string.startsWith(sender['url'], mbi.app.base.LOGIN_ORIGIN)) {
            sendResponse('close');
            me.doLogin_();
          }
        });
  }
};


/**
 * @define {boolean} log process steps.
 */
mbi.web.GaeAuth.LOG = false;


/**
 * Log if enable.
 * @param {string|*} msg
 */
mbi.web.GaeAuth.prototype.log = function(msg) {
  if (mbi.web.GaeAuth.LOG) {
    if (goog.isString(msg)) {
      window.console.log('GaeAuth:' + msg);
    } else {
      window.console.log(msg);
    }
  }
};


/**
 * Return respond type.
 * id_token require eval.
 * @return {string} possible value are token or id_token.
 * @protected
 */
mbi.web.GaeAuth.prototype.getResponseType = function() {
  return 'token';
};


/**
 * Return scope.
 * @return {string}
 * @protected
 */
mbi.web.GaeAuth.prototype.getScope = function() {
  return 'email';
};


/**
 * Get list of gapi client library to load.
 * Eg: ['plus', 'v1', 'storage', 'v1beta2']
 * @return {Array.<string>}
 * @protected
 */
mbi.web.GaeAuth.prototype.getLib = function() {
  return [];
};


/**
 * @protected
 * @return {string}
 */
mbi.web.GaeAuth.prototype.getApiKey = function() {
  return mbi.app.base.GAPI_KEY;
};


/**
 * @protected
 * @return {string}
 */
mbi.web.GaeAuth.prototype.getClientId = function() {
  return '811363880127-5e353fbu63vmo2sug5qfste5go2a5ot1' +
      '.apps.googleusercontent.com';
};


/**
 * @protected
 * @type {string}
 */
mbi.web.GaeAuth.prototype.app_id = 'wiki'; // 'test';


/**
 * Login.
 * @param {string} url
 * @param {function(this: T, *)} cb
 * @param {T=} opt_scope
 * @template T
 */
mbi.web.GaeAuth.prototype.request = function(url, cb, opt_scope) {
  var xhr = new XMLHttpRequest();
  url = 'https://' + mbi.app.base.GAE_HOSTNAME + url;
  xhr.open('GET', url, true);
  xhr.withCredentials = true;
  xhr.onload = function(e) {
    var json = null;
    if (xhr.status < 400) {
      json = JSON.parse(xhr.responseText);
    }

    cb.call(opt_scope, json);

  };
  xhr.send();
};


/**
 * Login.
 * @param {function(this: T, YdnApiToken)} cb
 * @param {T=} opt_scope
 * @template T
 */
mbi.web.GaeAuth.prototype.authorize = function(cb, opt_scope) {

  var redirect = mbi.app.base.LOGIN_ORIGIN + '/pm.html?pm=' + location.href;
  var url = '/a/' + this.app_id + '/token?url=' + encodeURIComponent(redirect);

  this.request(url, function(json) {
    var a = document.getElementById('user-login');
    var name = document.getElementById('user-name');
    this.log(json);
    var tokens = json['Tokens'];
    var token = /** @type {YdnApiToken} */ (tokens[0]);
    if (token.has_token) {
      this.gdata_token_ = token;
      token.expires = goog.now() + token.expires_in;
    } else {
      this.gdata_token_ = null;
      a.textContent = 'authorize';
      a.href = token.authorize_url;
      a.style.display = '';
    }
    cb.call(opt_scope, token);
  }, this);

};


/**
 * Login.
 * @param {function(this: T, YdnApiUser)} cb
 * @param {T=} opt_scope
 * @template T
 */
mbi.web.GaeAuth.prototype.login = function(cb, opt_scope) {

  var url = '/rpc_login?pm=' + location.href;

  this.request(url, function(json) {
    var a = document.getElementById('user-login');
    var name = document.getElementById('user-name');
    this.log(json);
    var user = /** @type {YdnApiUser} */ (json['User']);
    if (user.is_login) {
      name.textContent = user.email;
      a.href = user.logout_url;
      a.style.display = 'none';
      a.textContent = 'logout';
      name.style.display = '';
    } else {
      a.href = user.login_url;
      a.textContent = 'login';
      a.style.display = '';
      name.style.display = 'none';
    }
    this.auth_result_ = user;
    if (cb) {
      cb.call(opt_scope, user);
    }
  }, this);

};


/**
 * Setup clients after login.
 * @param {GapiToken} token
 */
mbi.web.GaeAuth.prototype.setupClients = function(token) {
  if (!token.token_type) {
    token.token_type = 'Bearer';
  }
  gapi.auth.setToken(token);
  var xhr = mbi.app.shared.getXhrManager();
  var gdata_client = new ydn.client.OAuthClient(this, xhr);
  ydn.client.setClient(gdata_client, ydn.http.Scopes.GOOGLE_CLIENT);
  var proxy_url = mbi.app.base.LOGIN_ORIGIN + '/a/' + this.app_id + '/proxy/';
  var proxy = new ydn.client.SimpleClient(
      xhr, undefined, proxy_url);
  var gdata_proxy = new ydn.client.AdaptorClient(gdata_client, function(args) {
    var req = /** @type {ydn.client.HttpRequestData} */ (args);
    req.path = proxy_url + req.path;
    return req;
  });
  ydn.client.setClient(proxy, ydn.http.Scopes.PROXY);
  var gse = new ydn.client.FilteredClient(function(req) {
    return req.method == 'GET';
  }, gdata_client, gdata_proxy);
  ydn.client.setClient(gse, ydn.http.Scopes.GSE);
};


/**
 * @private
 */
mbi.web.GaeAuth.prototype.doLogin_ = function() {
  this.login(function(user) {
    if (user && user.is_login) {
      var client = new ydn.client.SimpleClient(
          mbi.app.shared.getXhrManager(), undefined, mbi.app.base.LOGIN_ORIGIN);
      ydn.client.setClient(client, ydn.http.Scopes.LOGIN);
      var app_client = new ydn.client.SimpleClient(
          mbi.app.shared.getXhrManager(), undefined, mbi.app.base.LOGIN_ORIGIN +
              '/a/' + this.app_id);
      ydn.client.setClient(app_client, ydn.http.Scopes.AUTH);
      this.authorize(function(auth) {
        var token = /** @type {GapiToken} */ (auth);
        if (token.access_token) {
          this.setupClients(token);
        } else {
          auth = null;
        }
        this.run(auth);
      }, this);
    }
  }, this);
};


/**
 * Start authenticate to Google.
 * Login.
 * @template T
 */
mbi.web.GaeAuth.prototype.auth = function() {
  this.log('auth');
  goog.asserts.assert(!this.auth_, 'already auth');
  var login_link = document.getElementById('user-login');
  login_link.addEventListener('click', function(e) {
    e.preventDefault();
    var w = 600;
    var h = 400;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    var url = e.target.href;
    window.open(url, undefined, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    return true;
  }, true);
  var me = this;

  this.doLogin_();
  this.auth_ = true;
};


/**
 * @return {YdnApiUser}
 */
mbi.web.GaeAuth.prototype.getAuthResult = function() {
  return this.auth_result_;
};


/**
 * Run app after, authorization done.
 * @param {YdnApiToken} token
 */
mbi.web.GaeAuth.prototype.run = function(token) {
  if (this.runing_) {
    throw new Error('Already run');
  }
  this.runing_ = true;
};


/**
 * Get GData token.
 * @param {string=} opt_redirect redirect url.
 * @return {goog.async.Deferred}
 */
mbi.web.GaeAuth.prototype.getOAuthToken = function(opt_redirect) {
  if (this.df_gdata_token_) {
    return this.df_gdata_token_;
  } else if (this.gdata_token_ && this.gdata_token_['expires'] < goog.now()) {
    return goog.async.Deferred.succeed(this.gdata_token_);
  }
  this.df_gdata_token_ = new goog.async.Deferred();
  var redirect = opt_redirect || (chrome && chrome.extension) ?
      chrome.extension.getURL(mbi.app.base.OPTION_PAGE) : mbi.app.base.OPTION_PAGE;
  var params = {
    'url': redirect
  };
  var data = new ydn.client.HttpRequestData('/token', 'GET', params);
  var client = ydn.client.getClient(ydn.http.Scopes.AUTH);
  var req = client.request(data);
  req.execute(function(x, raw) {
    if (raw.isSuccess()) {
      var token = /** @type {YdnApiToken} */ (x['Tokens'][0]);
      token['expires'] = (token.expires_in * 1000) + goog.now();
      this.log(token);
      this.gdata_token_ = token;
      this.df_gdata_token_.callback(token);
    } else {
      this.gdata_token_ = null;
      this.df_gdata_token_.errback(raw);
    }
    this.df_gdata_token_ = null;
  }, this);
  return this.df_gdata_token_;
};


goog.exportProperty(mbi.web.GaeAuth.prototype, 'auth',
    mbi.web.GaeAuth.prototype.auth);


