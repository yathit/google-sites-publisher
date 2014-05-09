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


goog.provide('mbi.web.Plusone');
goog.require('goog.dom.classes');



/**
 * Create Google client authentication app.
 * @constructor
 * @struct
 */
mbi.web.Plusone = function() {
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
mbi.web.Plusone.LOG = true;


/**
 * Log if enable.
 * @param {*} msg
 */
mbi.web.Plusone.prototype.log = function(msg) {
  if (mbi.web.Plusone.LOG) {
    if (goog.isString(msg)) {
      window.console.log('Plusone:' + msg);
    } else {
      window.console.log(msg);
    }
  }
};


/**
 * Return scope.
 * @return {string}
 */
mbi.web.Plusone.prototype.getScope = function() {
  return 'email';
};


/**
 * Get list of gapi client library to load.
 * Eg: ['plus', 'v1', 'storage', 'v1beta2']
 * @return {Array.<string>}
 */
mbi.web.Plusone.prototype.getLib = function() {
  return [];
};


/**
 * @protected
 * @return {string}
 */
mbi.web.Plusone.prototype.getApiKey = function() {
  return 'AIzaSyA-ld7NSMON2D611Y3j7oLPsCajizXKQwQ';
};


/**
 * @protected
 * @return {string}
 */
mbi.web.Plusone.prototype.getClientId = function() {
  return '749422248201-aef1a3oll0k94anq9pfmgapvtbiqf8ii.apps.googleusercontent.com';
};


/**
 * Start authenticate to Google.
 */
mbi.web.Plusone.prototype.auth = function() {
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
mbi.web.Plusone.prototype.checkAuth = function() {
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
mbi.web.Plusone.prototype.handleAuthResult = function(authResult) {
  this.log('handleAuthResult');
  this.log(authResult);
  var login_link = document.getElementById('user-login');
  goog.asserts.assert(login_link, 'user-login element missing');
  if (authResult && !authResult.error) {
    login_link.textContent = 'logout';
    login_link.onclick = gapi.auth.signOut;
    login_link.href = 'https://accounts.google.com/logout';
    goog.dom.classes.add(login_link, 'login');
    this.makeApiCall();
  } else {
    login_link.style.display = '';
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
mbi.web.Plusone.prototype.handleAuthClick = function(event, opt_cb) {
  this.log('handleAuthClick');
  var me = this;
  var callback = function(e) {
    me.handleAuthResult(e);
    if (opt_cb) {
      opt_cb(e);
    }
  };
  var myParams = {
    'clientid' : this.getClientId(),
    'cookiepolicy' : location.origin,
    'immediate': false,
    'callback' : callback,
    'scope' : this.getScope()
  };
  gapi.auth.signIn(myParams);

  return false;
};


/**
 * Init UI.
 * @param {!MbiAppUserSetting} setting
 */
mbi.web.Plusone.prototype.init = function(setting) {

  var login_link = document.getElementById('user-login');
  login_link.style.display = '';
  login_link.href = '#';
  login_link.onclick = goog.bind(this.handleAuthClick, this);
  login_link.textContent = 'login';

  ydn.dom.injectNode('https://apis.google.com/js/client:plusone.js?onload=handleClientLoad',
      'js', undefined, undefined, true);
};


/**
 * @type {boolean}
 * @private
 */
mbi.web.Plusone.prototype.runing_ = false;


/**
 * Run app after, authorization done.
 *  @param {Object} data
 */
mbi.web.Plusone.prototype.run = function(data) {
  if (this.runing_) {
    throw new Error('Already run');
  }
  this.runing_ = true;
};


/**
 * Load require library.
 * @param {function(this:mbi.web.Plusone)} cb
 */
mbi.web.Plusone.prototype.loadLibrary = function(cb) {
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
mbi.web.Plusone.prototype.makeApiCall = function() {
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
mbi.web.Plusone.handleClientLoad = function() {
  // exported on js on load.
  var app = /** @type {mbi.web.Plusone} */ (goog.global['app']);
  app.auth();
};


goog.exportProperty(mbi.web.Plusone.prototype, 'auth',
    mbi.web.Plusone.prototype.auth);
goog.exportSymbol('handleClientLoad', mbi.web.Plusone.handleClientLoad);

