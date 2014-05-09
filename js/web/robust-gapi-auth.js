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


goog.provide('mbi.web.RobustGapiAuth');
goog.require('goog.Timer');
goog.require('goog.async.Delay');
goog.require('mbi.web.base');



/**
 * Create Google client authentication app.
 * @constructor
 * @struct
 */
mbi.web.RobustGapiAuth = function() {
  /**
   * @type {Array.<string>}
   * @private
   */
  this.lib_ = this.getLib();
  var lbl = this.getApiKey() + ' ' + this.getClientId();
  this.log('gapi ' + lbl);
  /**
   * Auth result.
   * @type {GapiAuthResult}
   * @private
   */
  this.auth_result_ = null;
  /**
   * Authentication result callback has been handled.
   * @type {boolean}
   * @private
   */
  this.auth_result_handled_ = false;
  /**
   * Authentication popup windows has been handled.
   * @type {boolean}
   * @private
   */
  this.popup_windows_handled_ = false;
  /**
   * @type {number}
   * @private
   */
  this.popup_window_id_ = NaN;
  /**
   * @type {boolean}
   * @private
   */
  this.is_authenticated_ = false;
  /**
   * Callback after login.
   * @type {Array.<Function>}
   * @private
   */
  this.login_callbacks_ = [];
  this.login_delay_ = new goog.async.Delay(function() {
    // return whatever result we have now.
    this.onAuthResult_(this.auth_result_);
  }, 1000, this);
  this.ensureLoaded();
};


/**
 * @define {boolean} log process steps.
 */
mbi.web.RobustGapiAuth.LOG = false;


/**
 * Ensure handleClientLoad is called. In chrome extension on windows platform
 * handleClientLoad is not called.
 */
mbi.web.RobustGapiAuth.prototype.ensureLoaded = function() {

  var scripts = document.getElementsByTagName('script');
  var gapi_src = null;
  for (var i = scripts.length - 1; i >= 0; i--) {
    if (goog.string.startsWith(scripts[i].src,
        'https://apis.google.com/js/client:plusone.js') ||
        goog.string.startsWith(scripts[i].src,
            'https://apis.google.com/js/client.js')) {
      gapi_src = scripts[i];
    }
  }
  if (gapi_src) {
    var me = this;
    var n_try = 0;
    var tid = window.setInterval(function() {
      n_try++;
      if (n_try > 10) {
        me.log('gapi auth no loaded, give up after ' + n_try);
      }
      me.log('checking auth call ' + n_try);
      if (me.auth_result_handled_) {
        window.clearInterval(tid);
        return;
      }
      var processed = gapi_src.getAttribute('gapi_processed');
      if (processed) {
        window.clearInterval(tid);
      }
      if (processed == 'true') {
        me.log('trying login again');
        gapi.auth.authorize(
            {
              'response_type': me.getResponseType(),
              'client_id': me.getClientId(),
              'scope': me.getScope(),
              'immediate': true
            },
            goog.bind(me.handleAuthResult, me));
      }
    }, 1000);
  } else {
    this.log('gapi script not found.');
  }
};


/**
 * Ensure login popup window closed.
 * See detail:
 * http://stackoverflow.com/questions/15266305/google-authorize-popup-gets-stuck-in-chrome-extension
 */
mbi.web.RobustGapiAuth.prototype.ensureAuthPopupClosed = function() {

  var me = this;
  var n_try = 0;
  var tid = window.setInterval(function() {
    n_try++;
    if (n_try > 5 * 60) {
      me.log('gapi auth no loaded, give up after ' + n_try);
    }
    me.log('checking popup window ' + n_try);
    if (me.is_authenticated_) {
      me.log('authenticated');
      window.clearInterval(tid);
      return;
    }
    chrome.windows.getLastFocused({'populate': true}, function(win) {
      var tab = win.tabs[0];
      if (tab && tab.status == 'complete' && tab.title == 'Connecting ...') {
        var is_authenticated = goog.string.startsWith(tab.url,
            'https://accounts.google.com/o/oauth2/auth');
        var is_approved = goog.string.startsWith(tab.url,
            'https://accounts.google.com/o/oauth2/approval');
        if (is_approved) {
          me.log('approved');
          chrome.windows.remove(win.id, function() {
            window.location.reload();
          });
        } else if (is_authenticated) {
          me.log('trying login again to close popup');
          gapi.auth.authorize(
              {
                'response_type': this.getResponseType(),
                'client_id': me.getClientId(),
                'scope': me.getScope(),
                'immediate': true
              },
              goog.bind(me.handleAuthResult, me));
          me.popup_window_id_ = win.id;
          me.popup_windows_handled_ = true;
          window.clearInterval(tid);
        }
      }
    });
  }, 1000);

};


/**
 * Log if enable.
 * @param {string} msg
 */
mbi.web.RobustGapiAuth.prototype.log = function(msg) {
  if (mbi.web.RobustGapiAuth.LOG) {
    window.console.log('GapiAuth:' + msg);
  }
};


/**
 * Return respond type.
 * id_token require eval.
 * @return {string} possible value are token or id_token.
 * @protected
 */
mbi.web.RobustGapiAuth.prototype.getResponseType = function() {
  return 'token';
};


/**
 * Return scope.
 * @return {string}
 * @protected
 */
mbi.web.RobustGapiAuth.prototype.getScope = function() {
  return 'email';
};


/**
 * Get list of gapi client library to load.
 * Eg: ['plus', 'v1', 'storage', 'v1beta2']
 * @return {Array.<string>}
 * @protected
 */
mbi.web.RobustGapiAuth.prototype.getLib = function() {
  return [];
};


/**
 * @protected
 * @return {string}
 */
mbi.web.RobustGapiAuth.prototype.getApiKey = function() {
  return mbi.app.base.GAPI_KEY;
};


/**
 * @protected
 * @return {string}
 */
mbi.web.RobustGapiAuth.prototype.getClientId = function() {
  return '811363880127-5e353fbu63vmo2sug5qfste5go2a5ot1' +
      '.apps.googleusercontent.com';
};


/**
 * Start authenticate to Google.
 */
mbi.web.RobustGapiAuth.prototype.auth = function() {
  this.log('auth');
  gapi.client.setApiKey(this.getApiKey());
  goog.Timer.callOnce(this.checkAuth, 1, this);
};


/**
 * @protected
 */
mbi.web.RobustGapiAuth.prototype.checkAuth = function() {
  this.log('checkAuth');
  gapi.auth.authorize(
      {
        'response_type': this.getResponseType(),
        'client_id': this.getClientId(),
        'scope': this.getScope(),
        'immediate': true
      },
      goog.bind(this.handleAuthResult, this));
};


/**
 * @return {GapiAuthResult}
 */
mbi.web.RobustGapiAuth.prototype.getAuthResult = function() {
  return this.auth_result_;
};


/**
 * @param {*} auth
 * @private
 */
mbi.web.RobustGapiAuth.prototype.onAuthResult_ = function(auth) {
  var cb = this.login_callbacks_.shift();
  while (cb) {
    cb(auth);
    cb = this.login_callbacks_.shift();
  }
};


/**
 * Get login result, if no result, try login again with silence mode.
 * @param {Function} cb
 * @param {boolean=} opt_force force login.
 */
mbi.web.RobustGapiAuth.prototype.getAuthResultOrLogin = function(cb, opt_force) {
  if (this.auth_result_ && !this.auth_result_.error) {
    // check expire
    cb(this.auth_result_);
  } else {
    this.login_callbacks_.push(cb);
    if (!this.login_delay_.isActive()) {
      this.login_delay_.start();
    }
    if (opt_force) {
      this.handleAuthClick(null);
    } else {
      this.checkAuth();
    }
  }
};


/**
 * @param {GapiAuthResult} authResult
 * @protected
 */
mbi.web.RobustGapiAuth.prototype.handleAuthResult = function(authResult) {
  this.log('handleAuthResult');
  var login_link = document.getElementById('user-login');
  if (mbi.web.RobustGapiAuth.LOG) {
    window.console.log(authResult);
  }
  this.auth_result_ = authResult;
  this.auth_result_handled_ = true;
  if (authResult && !authResult.error) {
    login_link.textContent = 'logout';
    login_link.onclick = null;
    login_link.href = 'https://accounts.google.com/logout';
    login_link.style.display = 'none'; // don't show logout link
    this.is_authenticated_ = true;
    if (this.popup_window_id_) {
      // close popup window
      chrome.windows.remove(this.popup_window_id_);
    }
    this.makeApiCall();
  } else {
    login_link.style.display = '';
    login_link.href = '#';
    login_link.onclick = goog.bind(this.handleAuthClick, this);
    login_link.textContent = 'login';
    this.is_authenticated_ = false;
  }
  this.onAuthResult_(authResult);
};


/**
 * @protected
 * @param {Event} event
 * @return {boolean}
 */
mbi.web.RobustGapiAuth.prototype.handleAuthClick = function(event){
  this.log('handleAuthClick');
  gapi.auth.authorize(
      {
        'response_type': this.getResponseType(),
        'client_id': this.getClientId(),
        'scope': this.getScope(),
        'immediate': false
      },
      goog.bind(this.handleAuthResult, this));
  this.ensureAuthPopupClosed();
  return false;
};


/**
 * @type {boolean}
 * @private
 */
mbi.web.RobustGapiAuth.prototype.runing_ = false;


/**
 * Run app after, authorization done.
 */
mbi.web.RobustGapiAuth.prototype.run = function() {
  if (this.runing_) {
    throw new Error('Already run');
  }
  this.runing_ = true;
};


/**
 * Load require library.
 * @param {function(this:mbi.web.RobustGapiAuth)} cb
 */
mbi.web.RobustGapiAuth.prototype.loadLibrary = function(cb) {
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
mbi.web.RobustGapiAuth.prototype.makeApiCall = function() {
  this.log('makeApiCall');
  var me = this;
  this.loadLibrary(function() {
    // console.log('lib loaded')
    gapi.client.request({
      'path': 'oauth2/v3/userinfo',
      'callback': function(data) {
        var ele_name = document.getElementById('user-name');
        ele_name.textContent = data['email']; // .replace(/@.+/, '');
        ele_name.style.display = '';
        if (!me.runing_) {
          me.run();
        }
      }
    });
  });
};


/**
 * Handle GAPI load.
 */
mbi.web.RobustGapiAuth.handleClientLoad = function() {
  // exported on js on load.
  var app = /** @type {mbi.web.RobustGapiAuth} */ (goog.global['app']);
  app.auth();
};


goog.exportProperty(mbi.web.RobustGapiAuth.prototype, 'auth',
    mbi.web.RobustGapiAuth.prototype.auth);
goog.exportSymbol('handleClientLoad', mbi.web.RobustGapiAuth.handleClientLoad);

