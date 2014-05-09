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
 * @fileoverview Google client authentication.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.web.GapiAuth');



/**
 * Create Google client authentication app.
 * @constructor
 * @struct
 */
mbi.web.GapiAuth = function() {
  /**
   * @type {Array.<string>}
   * @private
   */
  this.lib_ = this.getLib();
  var lbl = this.getApiKey() + ' ' + this.getClientId();
  this.log('gapi ' + lbl);

};


/**
 * @define {boolean} log process steps.
 */
mbi.web.GapiAuth.LOG = false;


/**
 * Log if enable.
 * @param {string} msg
 */
mbi.web.GapiAuth.prototype.log = function(msg) {
  if (mbi.web.GapiAuth.LOG) {
    window.console.log('GapiAuth:' + msg);
  }
};


/**
 * Return scope.
 * @return {string}
 */
mbi.web.GapiAuth.prototype.getScope = function() {
  return 'email';
};


/**
 * Get list of gapi client library to load.
 * Eg: ['plus', 'v1', 'storage', 'v1beta2']
 * @return {Array.<string>}
 */
mbi.web.GapiAuth.prototype.getLib = function() {
  return [];
};


/**
 * @protected
 * @return {string}
 */
mbi.web.GapiAuth.prototype.getApiKey = function() {
  return 'AIzaSyA-ld7NSMON2D611Y3j7oLPsCajizXKQwQ';
};


/**
 * @protected
 * @return {string}
 */
mbi.web.GapiAuth.prototype.getClientId = function() {
  return '749422248201-aef1a3oll0k94anq9pfmgapvtbiqf8ii.apps.googleusercontent.com';
};


/**
 * Start authenticate to Google.
 */
mbi.web.GapiAuth.prototype.auth = function() {
  this.log('auth');

  gapi.client.setApiKey(this.getApiKey());
  var me = this;
  setTimeout(function() {
    me.checkAuth();
  }, 4);
};


/**
 * @protected
 */
mbi.web.GapiAuth.prototype.checkAuth = function() {
  this.log('checkAuth');
  gapi.auth.authorize(
      {
        'client_id': this.getClientId(),
        'scope': this.getScope(),
        'immediate': true
      },
      goog.bind(this.handleAuthResult, this));
};


/**
 * @param {GapiAuthResult} authResult
 * @protected
 */
mbi.web.GapiAuth.prototype.handleAuthResult = function(authResult) {
  this.log('handleAuthResult');
  if (mbi.web.GapiAuth.LOG) {
    window.console.log(this, authResult);
  }
  var login_link = document.getElementById('user-login');
  goog.asserts.assert(login_link, 'user-login element missing');
  if (authResult && !authResult.error) {
    login_link.textContent = 'logout';
    login_link.onclick = null;
    login_link.href = 'https://accounts.google.com/logout';
    goog.dom.classes.add(login_link, 'login');
    this.makeApiCall();
  } else {
    login_link.href = '#';
    login_link.onclick = goog.bind(this.handleAuthClick, this);
    goog.dom.classes.remove(login_link, 'login');
    login_link.textContent = 'login';
  }
};


/**
 * @protected
 * @param {Event} event
 * @param {Function=} opt_cb
 * @return {boolean}
 */
mbi.web.GapiAuth.prototype.handleAuthClick = function(event, opt_cb) {
  this.log('handleAuthClick');
  var me = this;
  var callback = function(e) {
    me.handleAuthResult(e);
    if (opt_cb) {
      opt_cb(e);
    }
  };
  gapi.auth.authorize(
      {
        'client_id': this.getClientId(),
        'scope': this.getScope(),
        'immediate': false
      }, callback);
  return false;
};


/**
 * Init UI.
 * @param {!MbiAppUserSetting} setting
 */
mbi.web.GapiAuth.prototype.init = function(setting) {
  this.log('init');
  var login_link = document.getElementById('user-login');
  login_link.style.display = '';
  login_link.href = '#';
  login_link.onclick = goog.bind(this.handleAuthClick, this);
  login_link.textContent = 'login';

  ydn.dom.injectNode('https://apis.google.com/js/client.js?onload=handleClientLoad',
      'js', undefined, undefined, true);
};


/**
 * @type {boolean}
 * @private
 */
mbi.web.GapiAuth.prototype.runing_ = false;


/**
 * Run app after, authorization done.
 *  @param {Object} data
 */
mbi.web.GapiAuth.prototype.run = function(data) {
  if (this.runing_) {
    throw new Error('Already run');
  }
  this.runing_ = true;
};


/**
 * Load require library.
 * @param {function(this:mbi.web.GapiAuth)} cb
 */
mbi.web.GapiAuth.prototype.loadLibrary = function(cb) {
  this.log('loadLibrary');
  if (this.lib_.length == 0) {
    cb.call(this);
  } else {
    var lib = this.lib_.shift();
    var ver = this.lib_.shift();
    var me = this;
    gapi.client.load(lib, ver, function() {
      if (me.lib_.length == 0) {
        cb.call(me);
      } else {
        me.loadLibrary(cb);
      }
    });
  }
};


/**
 * @protected
 */
mbi.web.GapiAuth.prototype.makeApiCall = function() {
  this.log('makeApiCall');
  var me = this;
  this.loadLibrary(function() {
    // console.log('lib loaded')
    gapi.client.request({
      'path': 'oauth2/v3/userinfo',
      'callback': function(data) {
        var ele_name = document.getElementById('user-name');
        goog.asserts.assert(ele_name, 'user-name element missing');
        ele_name.textContent = data['email']; // .replace(/@.+/, '');
        ele_name.setAttribute('value', data['sub']);
        ele_name.style.display = '';
        if (!me.runing_) {
          me.run(data);
        }
      }
    });
  });
};


/**
 * Handle GAPI load.
 */
mbi.web.GapiAuth.handleClientLoad = function() {
  // exported on js on load.
  var app = /** @type {mbi.web.GapiAuth} */ (goog.global['app']);
  app.auth();
};


goog.exportProperty(mbi.web.GapiAuth.prototype, 'auth',
    mbi.web.GapiAuth.prototype.auth);
goog.exportSymbol('handleClientLoad', mbi.web.GapiAuth.handleClientLoad);

