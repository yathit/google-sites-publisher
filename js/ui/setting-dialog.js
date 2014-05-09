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


goog.provide('mbi.ui.SettingDialog');
goog.require('goog.ui.Dialog');
goog.require('templ.mbi.app');



/**
 * User setting dialog.
 * @param {boolean} is_admin_app
 * @constructor
 * @extends {goog.ui.Dialog}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 * @struct
 */
mbi.ui.SettingDialog = function(is_admin_app) {
  goog.base(this);
  var opt = {
    admin_app: is_admin_app
  };
  this.setContent(templ.mbi.app.setting(opt));
  this.setModal(true);
  this.setTitle('Setting');

  /**
   * @protected
   * @type {Element}
   */
  this.root = this.getContentElement();
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
  this.sel_theme_ = goog.dom.getElementsByTagNameAndClass('select',
      'theme', this.root)[0];
  this.sel_track_ = goog.dom.getElementsByTagNameAndClass('select',
      'track', this.root)[0];
  this.chk_log_ = document.getElementById('setting-logging');
  goog.events.listen(this.chk_log_, goog.events.EventType.CHANGE,
      this.handleLoggingChange, false, this);
  goog.events.listen(this.sel_theme_, goog.events.EventType.CHANGE,
      this.handleThemeChange, false, this);
  goog.events.listen(this.sel_track_, goog.events.EventType.CHANGE,
      this.handleTrackChange, false, this);
  var version = goog.dom.getElementByClass('version', this.root);
  version.textContent = mbi.app.base.VERSION;

  var clear_cache = goog.dom.getElementByClass('clear-cache', this.root);
  goog.events.listen(clear_cache, 'click', mbi.app.shared.clearAllDatabases, false, this);
};
goog.inherits(mbi.ui.SettingDialog, goog.ui.Dialog);


/**
 * @param {MbiAppUserSetting} setting
 */
mbi.ui.SettingDialog.prototype.init = function(setting) {
  if (setting) {
    this.update(setting);
  }
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SettingDialog.prototype.handleLoggingChange = function(e) {
  this.setting_.logging = !this.setting_.logging;
  this.save();
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SettingDialog.prototype.handleThemeChange = function(e) {
  this.setting_.theme = e.target.value;
  this.save();
};


/**
 * @protected
 */
mbi.ui.SettingDialog.prototype.save = function() {
  mbi.app.base.setCache(mbi.app.base.SessionKey.USER_SETTING, this.setting_);
  window.location.reload();
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SettingDialog.prototype.handleTrackChange = function(e) {
  this.setting_.track = e.target.value;
  this.save();
};


/**
 * @param {!MbiAppUserSetting} setting
 */
mbi.ui.SettingDialog.prototype.update = function(setting) {
  this.setting_ = setting;
  this.sel_theme_.value = this.setting_.theme;
  this.sel_track_.value = this.setting_.track;
  this.chk_log_.checked = !!this.setting_.logging;
};

