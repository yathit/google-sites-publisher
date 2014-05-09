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
 * @fileoverview User setting control.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui.SettingControl');
goog.require('mbi.ui.IVisible');
goog.require('ydn.client');
goog.require('ydn.client.HttpRequestData');



/**
 * User setting control.
 * @constructor
 * @implements {mbi.ui.IVisible}
 * @struct
 */
mbi.ui.SettingControl = function() {
  /**
   * @protected
   * @type {Element}
   */
  this.root = null;
  /**
   * @type {Element}
   * @private
   */
  this.sel_theme_ = null;
  /**
   * @type {Element}
   * @private
   */
  this.sel_track_ = null;
  /**
   * @type {Element}
   * @private
   */
  this.chk_log_ = null;
  /**
   * @type {MbiAppUserSetting}
   * @private
   */
  this.setting_ = null;
};


/**
 * @param {MbiAppUserSetting} setting
 * @param {Element} ele
 */
mbi.ui.SettingControl.prototype.init = function(setting, ele) {
  if (!ele || !setting) {
    return;
  }
  this.root = ele;
  this.sel_theme_ = goog.dom.getElementsByTagNameAndClass('select',
      'theme', ele)[0];
  this.sel_track_ = goog.dom.getElementsByTagNameAndClass('select',
      'track', ele)[0];
  this.chk_log_ = document.getElementById('setting-logging');
  this.update(setting);
  goog.events.listen(this.chk_log_, goog.events.EventType.CHANGE,
      this.handleLoggingChange, false, this);
  goog.events.listen(this.sel_theme_, goog.events.EventType.CHANGE,
      this.handleThemeChange, false, this);
  goog.events.listen(this.sel_track_, goog.events.EventType.CHANGE,
      this.handleTrackChange, false, this);
  var version = goog.dom.getElementByClass('version', ele);
  version.textContent = mbi.app.base.VERSION;

  var clear_cache = goog.dom.getElementByClass('clear-cache', ele);
  goog.events.listen(clear_cache, 'click', mbi.app.shared.clearAllDatabases, false, this);
  var revoke = this.root.querySelector('a.revoke');
  goog.events.listen(revoke, 'click', function(e) {
    var client = ydn.client.getClient(ydn.http.Scopes.AUTH);
    var req = client.request(new ydn.client.HttpRequestData('/token', 'DELETE'));
    req.execute(function(json, raw) {
      if (raw.isSuccess()) {
        location.reload();
      } else {
        e.target.textContent = 'error ' + raw.getStatusText();
      }
    });
  }, false, this);

};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SettingControl.prototype.handleLoggingChange = function(e) {
  this.setting_.logging = !this.setting_.logging;
  this.save();
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SettingControl.prototype.handleThemeChange = function(e) {
  this.setting_.theme = e.target.value;
  this.save();
};


/**
 * @protected
 */
mbi.ui.SettingControl.prototype.save = function() {
  mbi.app.base.setCache(mbi.app.base.SessionKey.USER_SETTING, this.setting_);
  window.location.reload();
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SettingControl.prototype.handleTrackChange = function(e) {
  this.setting_.track = e.target.value;
  this.save();
};


/**
 * @param {!MbiAppUserSetting} setting
 */
mbi.ui.SettingControl.prototype.update = function(setting) {
  this.setting_ = setting;
  this.sel_theme_.value = this.setting_.theme;
  this.sel_track_.value = this.setting_.track;
  this.chk_log_.checked = !!this.setting_.logging ? true : false;
};


/**
 * @param {YdnApiUser} info
 * @param {YdnApiToken} token
 */
mbi.ui.SettingControl.prototype.updateUserInfo = function(info, token) {
  var logout = this.root.querySelector('a.logout');
  goog.style.setElementShown(logout, info.is_login);
  logout.href = info.logout_url;
  var revoke = this.root.querySelector('a.revoke');
  if (token.access_token) {
    goog.style.setElementShown(revoke, true);
    revoke.href = '#';
  } else {
    goog.style.setElementShown(revoke, false);
  }
};


/**
 * @param {boolean} value
 */
mbi.ui.SettingControl.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);
};
