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
 * @fileoverview Background services.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.app.service');
goog.require('mbi.app.shared');
goog.require('mbi.service.Channel');
goog.require('mbi.ui.feed.Feed');
goog.require('mbi.wiki.HtmlRenderer');


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.app.service.logger =
    goog.log.getLogger('mbi.app.service');


/**
 * Start channel service.
 * @param {mbi.wiki.HtmlRenderer} processor wiki processor.
 */
mbi.app.service.start = function(processor) {
  /**
   * @final
   */
  mbi.service.Channel.prototype.processor = processor;
  if (goog.isObject(goog.global['chrome']) &&
      goog.isObject(goog.global['chrome'].runtime)) {
    chrome.runtime.onConnect.addListener(function(port) {
      var channel = new mbi.service.Channel(port);
    });
    mbi.app.service.logger.info('service channel started');
  }
};
