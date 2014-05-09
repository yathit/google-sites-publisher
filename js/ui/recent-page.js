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
 * @fileoverview Recent page.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.wiki.ui.RecentPage');
goog.require('mbi.data.SiteMap');
goog.require('mbi.data.storage');



/**
 * Recent page.
 * @constructor
 */
mbi.wiki.ui.RecentPage = function() {

};


/**
 * @return {goog.async.Deferred}
 */
mbi.wiki.ui.RecentPage.prototype.listLastUpdatePages = function() {
  var db = mbi.data.storage.getStorage();
  var iter = new ydn.db.IndexValueIterator(mbi.app.base.TOPIC_SITE_NAME,
      'updated.$t', null, true);
  var MAX = 5;
  var ids = [];
  var id_to_fetch = [];
  var pages = [];
  var req = db.open(function(cursor) {
    var data = /** @type {PageEntry} */ (cursor.getValue());
    var subpage = mbi.data.SiteMap.isSubPage(data.sites$pageName.$t);
    var id = subpage ? data['sites$parent'] : data.id.$t;
    if (ids.indexOf(id) >= 0) {
      return;
    }
    ids.push(id);
    if (subpage) {
      id_to_fetch.push(data['sites$parent']);
    } else {
      pages[ids.length - 1] = data;
    }
    if (ids.length > MAX) {
      return null;
    }
  }, iter, ydn.db.base.TransactionMode.READ_WRITE);
  return req.addCallback(function(x) {
    if (id_to_fetch.length > 0) {
      return db.values(mbi.app.base.TOPIC_SITE_NAME, id_to_fetch).addCallback(function(data) {
        console.log(data);
        for (var i = pages.length - 1; i >= 0; i--) {
          if (!pages[i]) {
            pages[i] = data.pop();
          }
        }
        return pages;
      });
    } else {
      return pages;
    }
  }, this);

};
