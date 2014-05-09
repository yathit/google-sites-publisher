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
 * @fileoverview Google Appengine authentication without authorization.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.web.GaeLogin');
goog.require('mbi.web.base');
goog.require('ydn.client.SimpleClient');



/**
 * Create Google Appengine authentication app.
 * @constructor
 * @struct
 */
mbi.web.GaeLogin = function() {

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

};


/**
 * @define {boolean} log process steps.
 */
mbi.web.GaeLogin.LOG = false;


/**
 * Log if enable.
 * @param {string|*} msg
 */
mbi.web.GaeLogin.prototype.log = function(msg) {
  if (mbi.web.GaeLogin.LOG) {
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
mbi.web.GaeLogin.prototype.getResponseType = function() {
  return 'token';
};


/**
 * Return scope.
 * @return {string}
 * @protected
 */
mbi.web.GaeLogin.prototype.getScope = function() {
  return 'email';
};


/**
 * Get list of gapi client library to load.
 * Eg: ['plus', 'v1', 'storage', 'v1beta2']
 * @return {Array.<string>}
 * @protected
 */
mbi.web.GaeLogin.prototype.getLib = function() {
  return [];
};


/**
 * @protected
 * @return {string}
 */
mbi.web.GaeLogin.prototype.getApiKey = function() {
  return mbi.app.base.GAPI_KEY;
};


/**
 * @protected
 * @return {string}
 */
mbi.web.GaeLogin.prototype.getClientId = function() {
  return '811363880127-5e353fbu63vmo2sug5qfste5go2a5ot1' +
      '.apps.googleusercontent.com';
};


/**
 * @protected
 * @type {string}
 */
mbi.web.GaeLogin.prototype.app_id = 'wiki'; // 'test';


/**
 * Login.
 * @param {string} url
 * @param {function(this: T, *)} cb
 * @param {T=} opt_scope
 * @template T
 */
mbi.web.GaeLogin.prototype.request = function(url, cb, opt_scope) {
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
 * @param {function(this: T, YdnApiUser)} cb
 * @param {T=} opt_scope
 * @template T
 */
mbi.web.GaeLogin.prototype.login = function(cb, opt_scope) {

  var url = '/rpc_login?url=' + location.href;

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
 * @private
 */
mbi.web.GaeLogin.prototype.doLogin_ = function() {
  this.login(function(user) {
    if (user && user.is_login) {
      var client = new ydn.client.SimpleClient(
          mbi.app.shared.getXhrManager(), undefined, mbi.app.base.LOGIN_ORIGIN);
      ydn.client.setClient(client, ydn.http.Scopes.LOGIN);
    }
    this.run(user);
  }, this);
};


/**
 * @param e
 * @returns {boolean}
 */
mbi.web.GaeLogin.prototype.handleAuthClick = function(e) {
  e.preventDefault();
  var w = 600;
  var h = 400;
  var left = (screen.width / 2) - (w / 2);
  var top = (screen.height / 2) - (h / 2);
  var url = e.target.href;
  window.open(url, undefined, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  return true;
};


/**
 * Start authenticate to Google.
 * Login.
 * @template T
 */
mbi.web.GaeLogin.prototype.auth = function() {
  this.log('auth');
  goog.asserts.assert(!this.auth_, 'already auth');
  var login_link = document.getElementById('user-login');
  goog.events.listen(login_link, 'click', this.handleAuthClick, true, this);

  this.doLogin_();
  this.auth_ = true;
};


/**
 * Run app after, authorization done.
 * @param {YdnApiUser} token
 */
mbi.web.GaeLogin.prototype.run = function(token) {
  if (this.runing_) {
    throw new Error('Already run');
  }
  this.runing_ = true;
};


goog.exportProperty(mbi.web.GaeLogin.prototype, 'auth',
    mbi.web.GaeLogin.prototype.auth);


