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
 * @fileoverview Recent content panel.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.web.RecentPanel');



/**
 * Recently updated content panel.
 * @constructor
 */
mbi.web.RecentPanel = function() {
  /**
   * @type {Element}
   * @private
   */
  this.root_ = null;
};


/**
 * Maximum number of contents.
 * @type {number}
 * @private
 */
mbi.web.RecentPanel.prototype.limit_ = 20;


/**
 * Initialize UI.
 * @param {Element} parent
 */
mbi.web.RecentPanel.prototype.init = function(parent) {
  goog.asserts.assert(!this.root_);
  this.root_ = document.createElement('div');
  parent.appendChild(this.root_);
};


/**
 * @param {Array.<PageEntry>} entries
 * @private
 */
mbi.web.RecentPanel.prototype.render_ = function(entries) {
  var rows = [];
  for (var i = 0; i < entries.length; i++) {
    var p = new ydn.gdata.site.Page(entries[i]);
    var html = p.getHtmlContent();
    var img_url = html.match(/src="(https:\/\/mbi-figure.storage.googleapis.com\/.+)"/);
    if (!img_url) {
      // we should only with image?
      continue;
    }
    var txt = '';
    var parts = ydn.gdata.site.utils.parseUrl(p.getUrl());
    var view_url = 'http://' + mbi.app.base.BUCKET_SITE + parts.path;
    rows[i] = {
      url: view_url,
      title: p.getTitle(),
      description: txt,
      imgUrl: img_url[1]
    };
  }
  var options = {
    rows: rows
  };
};


/**
 * Update contents.
 */
mbi.web.RecentPanel.prototype.update = function() {
  var db = mbi.data.storage.getStorage();
  db.values(mbi.app.base.TOPIC_SITE_NAME, 'updated.$t', null, this.limit_)
      .addCallbacks(function(x) {
        this.render_(x);
      }, function(e) {
        throw e;
      }, this);
};

