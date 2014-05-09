// The MIT License (MIT)
// Copyright © 2012 Mechanobiology Institute, National University of Singapore.
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
 * @fileoverview Bootstrip the app.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.admin.Bootstrip');
goog.require('goog.dom.classes');
goog.require('mbi.app.base');
goog.require('mbi.web.base');
goog.require('ydn.dom');



/**
 * Create app.
 * @constructor
 * @struct
 */
mbi.admin.Bootstrip = function() {
  this.setting = /** @type {MbiAppUserSetting} */ (mbi.app.base.getCache(
      mbi.app.base.SessionKey.USER_SETTING));
  if (!this.setting) {
    this.setting = /** @type {MbiAppUserSetting} */ (/** @type {Object} */ (
        {}));
    this.setting.theme = mbi.app.base.THEME_DEFAULT;
    this.setting.track = mbi.app.base.Track.BETA;
  }
  var ver = mbi.app.base.VERSION_BETA;
  if (this.setting.track == mbi.app.base.Track.EDGE) {
    ver = mbi.app.base.VERSION;
  } else if (this.setting.track == mbi.app.base.Track.STABLE) {
    ver = mbi.app.base.VERSION_STABLE;
  } else if (this.setting.track == mbi.app.base.Track.PREVIOUS) {
    ver = mbi.app.base.PREVIOUS_STABLE;
  }

  var local = /localhost/.test(window.location.hostname);
  // on localhost, url is relative to html
  var p = local ? '' : 'https://mbinfo.storage.googleapis.com/';
  if (COMPILED) {
    ydn.dom.injectNode(p + 'jsc/mbi-app-' + ver + '.js', 'js');
  }
};


/**
 * Run when dom ready.
 */
mbi.admin.Bootstrip.prototype.init = function() {
  goog.dom.classes.add(document.body, this.setting.theme);
  var app = goog.global['app'];
  app['init'](this.setting);
  app['auth'](this.setting);
};


/**
 * Export runner.
 */
mbi.admin.Bootstrip.run = function() {
  var boot = new mbi.admin.Bootstrip();
  ydn.dom.onDocumentComplete(function() {
    boot.init();
  });
};



goog.exportSymbol('runApp', mbi.admin.Bootstrip.run);

