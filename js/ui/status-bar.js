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
 * @fileoverview Status bar.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui.StatusBar');
goog.require('mbi.ui.feed.Message');
goog.require('mbi.ui.feed.Feed');



/**
 * Create a status bar.
 * @constructor
 * @struct
 */
mbi.ui.StatusBar = function() {
  /**
   * @protected
   * @type {Element}
   */
  this.ele_status = null;
  /**
   * Display message.
   * @type {mbi.ui.feed.Message}
   */
  this.messenger = new mbi.ui.feed.Message('starting ...');

};


/**
 * Initialize status bar.
 * @param {Element} ele feed root element
 * @param {mbi.ui.feed.Feed=} opt_feed listen last message from the feed.
 */
mbi.ui.StatusBar.prototype.init = function(ele, opt_feed) {
  this.ele_status = ele;
  var ul = document.createElement('UL');
  this.messenger.init(ul);
  this.ele_status.appendChild(ul);
  if (opt_feed) {
    opt_feed.statusListener = goog.bind(this.feedListener, this);
    var feed_ele = opt_feed.getElement();
    goog.style.setElementShown(feed_ele, false);
    goog.events.listen(ele, 'click', function(e) {
      goog.style.setElementShown(feed_ele, !goog.style.isElementShown(feed_ele));
    }, false, this);
  }
};


/**
 * Display message from feed listener.
 * @param {*} msg
 */
mbi.ui.StatusBar.prototype.feedListener = function(msg) {
  if (msg) {
    msg['id'] = this.messenger.getId();
    this.messenger.fromJSON(msg);
  }
};


/**
 * Update status.
 * @param {string=} opt_title
 * @param {string=} opt_msg
 */
mbi.ui.StatusBar.prototype.status = function(opt_title, opt_msg) {
  this.messenger.link(null);
  if (goog.isDefAndNotNull(opt_title)) {
    this.messenger.title(opt_title);
  }
  this.messenger.status(opt_msg || '');
};



