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
 * @fileoverview Display news feed.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui.feed.Feed');
goog.require('goog.style');
goog.require('mbi.ui.IVisible');
goog.require('mbi.ui.feed.Message');



/**
 * Display news feed.
 * @constructor
 * @implements {mbi.ui.IVisible}
 * @struct
 */
mbi.ui.feed.Feed = function() {
  /**
   * @protected
   * @type {Element}
   */
  this.root = null;

  /**
   * @protected
   * @type {Element}
   */
  this.ul = null;
  /**
   * @protected
   * @type {Array.<mbi.ui.feed.Message>}
   */
  this.messages = [];
  /**
   * @type {Function}
   */
  this.statusListener = null;
};


/**
 * Maximum number of messages to keep.
 * @type {number}
 */
mbi.ui.feed.Feed.MAX = 20;


/**
 * @param {Element} ele feed root element
 */
mbi.ui.feed.Feed.prototype.init = function(ele) {
  this.root = ele;
  this.ul = document.createElement('UL');
  this.root.appendChild(this.ul);
};


/**
 * @return {Element}
 */
mbi.ui.feed.Feed.prototype.getElement = function() {
  return this.root;
};


/**
 * @param {boolean} value
 */
mbi.ui.feed.Feed.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);
};


/**
 * Add a new text message.
 * @param {string} text the message.
 * @return {mbi.ui.feed.Message}
 */
mbi.ui.feed.Feed.prototype.notify = function(text) {
  var msg = new mbi.ui.feed.Message(text);
  this.add(msg);
  return msg;
};


/**
 * @param {*} id message id.
 * @return {mbi.ui.feed.Message}
 */
mbi.ui.feed.Feed.prototype.getMessage = function(id) {
  for (var i = 0; i < this.messages.length; ++i) {
    if (this.messages[i].getId() == id) {
      return this.messages[i];
    }
  }
  return null;
};


/**
 * @param {mbi.ui.feed.Message} msg
 */
mbi.ui.feed.Feed.prototype.add = function(msg) {
  var li = document.createElement('li');
  this.ul.insertBefore(li, this.ul.children[0]);
  msg.init(li);
  if (this.messages.length > 0) {
    // unsubscribe
    this.messages[this.messages.length - 1].stream(null, null);
  }
  msg.stream(this.statusListener, null);
  this.messages.push(msg);
  if (this.messages.length > mbi.ui.feed.Feed.MAX) {
    var mg = this.messages[this.messages.length - 1];
    this.ul.removeChild(mg.getRoot());
    mg.dispose();
    this.messages.length = this.messages.length - 1;
  }

};


/**
 * @inheritDoc
 */
mbi.ui.feed.Feed.prototype.toString = function() {
  return 'Feed';
};


/**
 * Singleton feed instance.
 * @final
 * @type {mbi.ui.feed.Feed}
 */
mbi.ui.feed.feed = new mbi.ui.feed.Feed();
