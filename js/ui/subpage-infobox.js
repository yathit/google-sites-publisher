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


goog.provide('mbi.ui.SubpageInfoBox');
goog.require('mbi.data.SiteMap');
goog.require('mbi.data.storage');
goog.require('ydn.gdata.site.Page');



/**
 * Recent page.
 * @constructor
 */
mbi.ui.SubpageInfoBox = function() {
  /**
   * @type {Element}
   */
  this.root = null;
};


/**
 * Render.
 * @param {Element} root
 */
mbi.ui.SubpageInfoBox.prototype.render = function(root) {
  this.root = root;
};


/**
 * @define {boolean} global enable flag.
 */
mbi.ui.SubpageInfoBox.ENABLED = true;


/**
 * @define {boolean} flag.
 */
mbi.ui.SubpageInfoBox.ONLY_TOPIC = true;


/**
 * @param {ydn.gdata.site.Page} page
 */
mbi.ui.SubpageInfoBox.prototype.setModel = function(page) {
  if (!mbi.ui.SubpageInfoBox.ENABLED || !this.root) {
    return;
  }
  if (mbi.ui.SubpageInfoBox.ONLY_TOPIC) {
    var parent = page.getData()['sites$parent'];
    if (!parent) {
      return;
    }
    var m = parent.match(/\d+$/);
    if (!m || m[0] != mbi.app.base.TOPICS_PAGE_ID) {
      return;
    }
  }
  var ancenters = [];
  var map = mbi.app.shared.site_map.walk(page.getUrl(), ancenters);
  if (map) {
    var ids = map.getSubPageIds();
    var arr = [];
    for (var i = 0; i < map.count(); i++) {
      var child = map.child(i);
      var relative_url = child.url.replace(/https?:\/\/[^\/]+\/a\/[^\/]+\/[^\/]+/, '');
      arr.push({
        url: relative_url,
        title: child.getLabel()
      });
    }
    var opt = {
      rows: arr
    };
    goog.soy.renderElement(this.root, templ.mbi.app.subpagesPanel, opt);
    goog.style.setElementShown(this.root, arr.length > 0);
  }
};
