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
 * @fileoverview Background channel.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.service.Channel');
goog.require('mbi.ui.feed.Feed');
goog.require('mbi.wiki.HtmlRenderer');



/**
 * Background channel.
 * @param {Port} port
 * @constructor
 */
mbi.service.Channel = function(port) {
  /**
   * @protected
   * @type {Port}
   */
  this.port = port;
  var uri = new goog.Uri(port.sender['url']);
  /**
   * @final
   * @protected
   * @type {string}
   */
  this.url = uri.setQuery('').setFragment('').toString();
  this.logger.info('channel connected with ' + this.url);
  mbi.ui.feed.feed.notify('Environment provided for ' + this.url);
  var handlerOnMessage = goog.bind(this.handleOnMessage, this);
  port.onMessage.addListener(handlerOnMessage);
  // removing listener require additing another listener to listen disconnected
  // event, which seems unnecessary, as we runtime know these this onMessage
  // event can no longer be dispatch.
};


/**
 * This is initialized by service.
 * @type {mbi.wiki.HtmlRenderer}
 */
mbi.service.Channel.prototype.processor;


/**
 * @protected
 * @param {Object} msg
 */
mbi.service.Channel.prototype.handleStream = function(msg) {
  this.port.postMessage(msg);
};


/**
 * Receive a message is sent from a content script.
 * @param {*} req_msg
 */
mbi.service.Channel.prototype.handleOnMessage = function(req_msg) {
  var req = /** @type {mbi.app.base.Req} */ (req_msg['req']);
  var id = req_msg['id'];
  this.logger.finest('service req: ' + req);
  if (req == mbi.app.base.Req.ECHO) {
    this.port.postMessage(
        {'id': id, 'data': req_msg, 'done': true});
  } else if (req == mbi.app.base.Req.PUBLISH) {
    var msg = new mbi.ui.feed.Message('requesting to publish ' + this.url, id);
    mbi.ui.feed.feed.add(msg);
    msg.stream(this.handleStream, this);
    var enable = false;
    if (enable) {
      this.processor.publishByUrl(this.url, msg).addCallbacks(function(p_url) {
        msg.done();
      }, function(e) {
        msg.done();
        this.port.postMessage(
            {'id': id, 'data': e.toString(), 'done': true});
        throw e;
      }, this);
    } else {
      msg.done();
    }
  } else if (req == mbi.app.base.Req.LIST_OF_FIGURES) {
    var bucket = mbi.app.shared.getBucket(mbi.app.base.BUCKET_FIG);
    bucket.ready().addCallbacks(function() {
      var list = bucket.list();
      var msg = {
        'id': id,
        'done': true,
        'data': list};
      this.port.postMessage(msg);
    }, function(e) {
      throw e;
    }, this);
  } else {
    this.logger.warning('Unknown req: ' + req);
    mbi.ui.feed.feed.notify('Unknown req: ' + req);
  }
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.service.Channel.prototype.logger =
    goog.log.getLogger('mbi.service.Channel');





