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
 * @fileoverview Youtube video player box.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.video.PlayerBox');
goog.require('mbi.app.shared');
goog.require('mbi.ui');



/**
 * Youtube video player box.
 * @constructor
 */
mbi.video.PlayerBox = function() {
  /**
   * @type {HTMLIFrameElement}
   * @private
   */
  this.root_ = null;
};


/**
 * @define {boolean} debug flag.
 */
mbi.video.PlayerBox.DEBUG = goog.DEBUG;


/**
 * @define {boolean} mock this.
 */
mbi.video.PlayerBox.mock = false;


/**
 * Read metadata from given youtube video id.
 * @param {string} id
 * @return {goog.async.Deferred}
 */
mbi.video.PlayerBox.readMeta = function(id) {
  var xm = mbi.app.shared.getXhrManager();
  if (mbi.video.PlayerBox.mock) {
    return goog.async.Deferred.succeed({
      title: id,
      description: 'description'
    });
  }
  var df = new goog.async.Deferred();
  var uri = new goog.Uri('https://www.googleapis.com/youtube/v3/videos');
  uri.setParameterValue('part', 'snippet');
  uri.setParameterValue('id', id);
  var token = gapi.auth.getToken();
  if (token) {
    uri.setParameterValue('access_token', token.access_token);
  } else {
    uri.setParameterValue('key', mbi.app.base.GAPI_KEY);
  }
  var url = uri.toString();
  xm.send(url, url, 'GET', null, null, 1, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    if (xhr.isSuccess()) {
      var data = xhr.getResponse();
      if (mbi.video.PlayerBox.DEBUG) {
        window.console.log(data);
      }
      df.callback(data);
    } else {
      df.errback();
    }
  });
  return df;
};


/**
 * Render video box.
 * @param {HTMLIFrameElement} iframe youtube iframe element to render.
 */
mbi.video.PlayerBox.prototype.render = function(iframe) {
  this.root_ = iframe;
  var uri = new goog.Uri(iframe.src);
  var m = uri.getPath().match(/([^\/]+)$/); // get video id as file name of url
  if (!m) {
    return;
  }
  var id = m[1];
  mbi.video.PlayerBox.readMeta(id).addCallback(function(data) {
    // window.console.log(data);
    if (data) {
      var info = document.createElement('div');
      info.className = 'video-caption';
      var title = document.createElement('span');
      title.textContent = data['title'];
      title.className = 'video-title';
      info.appendChild(title);
      var des = data['description'];
      if (des) {
        info.appendChild(mbi.ui.renderDescription(des));
      }
      iframe.parentElement.appendChild(info);
    }
  }, this);
};



