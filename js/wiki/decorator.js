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
 * @fileoverview Decorate wiki content.
 *
 * For a given Google Site feed entry data, SiteEntry, this class render into
 * 'wiki-content' div element.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */



goog.provide('mbi.wiki.Decorator');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('mbi.data.Object');



/**
 * Decorate wiki content.
 * @constructor
 */
mbi.wiki.Decorator = function() {
  if (mbi.wiki.Decorator.decorator) {
    throw new Error();
  }
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.wiki.Decorator.prototype.logger =
    goog.log.getLogger('mbi.wiki.Decorator');


/**
 * @const
 * @type {string}
 */
mbi.wiki.Decorator.CSS_CLASS_UNIPROT = 'uniprot';


/**
 * @const
 * @type {string}
 */
mbi.wiki.Decorator.CSS_CLASS_FAMILY = 'family';


/**
 * @const
 * @type {string}
 */
mbi.wiki.Decorator.CSS_CLASS_GO = 'go';


/**
 * @const
 * @type {string}
 */
mbi.wiki.Decorator.CSS_CLASS_ANNOTATION = 'annotation';


/**
 * Process meta data.
 * @param {Element} ele
 */
mbi.wiki.Decorator.prototype.processMeta = function(ele) {
  // nothing to do here.
};


/**
 * Decorate rendered wiki page.
 * @param {Element} ele root element.
 */
mbi.wiki.Decorator.prototype.decorate = function(ele) {
  var wiki_content = goog.dom.getElementByClass('wiki-content', ele);
  var btn_history = goog.dom.getElementByClass('show-history', ele);
  this.processMeta(ele);
  mbi.wiki.Decorator.attachHistory(btn_history);
};


/**
 * Display name is not implemented except for bucket owner.
 * @const
 * @type {Object}
 */
mbi.wiki.Decorator.ownerIdNameMap = {
  '00b4903a979267bfd6a0fa8516ae44481c697654aeb08e4f0749375bb06e8a31': 'Steven Wolf'
};


/**
 * Process control ui.
 * @param {Element} btn_history history button root.
 */
mbi.wiki.Decorator.attachHistory = function(btn_history) {
  if (!btn_history) {
    return;
  }
  // use handler then listener so that eliminating to unlisten the handler.
  btn_history.onclick = function(e) {
    e.preventDefault();
    // NOTE: we re-discover root and btn_history elements, so that we don't
    // need to reference them.
    var btn_history = e.target;
    var root = goog.dom.getAncestorByClass(btn_history, 'content');
    if (!root) {
      throw new Error('root content element missing');
    }
    var ele = goog.dom.getElementByClass('history-detail', root);
    if (ele) {
      // already rendered history, just toggle.
      // history-detail is rendered in templ.mbi.web.html.history
      goog.style.setElementShown(ele, !goog.style.isElementShown(ele));
    } else {
      var article = goog.dom.getElementsByTagNameAndClass(
          goog.dom.TagName.ARTICLE, null, root)[0];
      var name = article.getAttribute('name');
      if (!name || name == 'undefined') {
        throw new Error('Page name is not defined in ARTICLE element');
      }
      var m = window.location.hostname.match(/(.+)\.storage.googleapis.com/);
      var bucket = m ? m[1] : mbi.app.base.BUCKET_SITE;
      var obj = mbi.data.Object.byName(bucket, name);
      obj.history().addCallback(function(items) {
        window.console.log(items);
        var prev_size = 0;
        var n = items.length;
        for (var i = 0; i < n; i++) {
          var item = items[i];
          var current = parseInt(item['Size'], 10);
          var ch;
          if (i == 0) {
            prev_size = current;
            ch = 0;
          } else {
            ch = current - prev_size;
            prev_size = current;
          }
          item['No'] = i + 1;
          item['Change'] = ch == 0 ? '' : ch > 0 ?
              '(+' + ch + ')' : '(' + ch + ')';
          item['LastModified'] = new Date(item['LastModified'])
              .toLocaleString();
          var owner = item['Owner'];
          if (owner && !owner['DisplayName']) {
            // Display name is not implemented except for bucket owner
            for (var id in mbi.wiki.Decorator.ownerIdNameMap) {
              if (owner['ID'] == id) {
                owner['DisplayName'] = mbi.wiki.Decorator.ownerIdNameMap[id];
                break;
              }
            }
          }
        }
        items.reverse();
        var params = {
          url: obj.getUrl(true).replace('.storage.googleapis.com', ''),
          items: items
        };
        var ele = goog.soy.renderAsElement(templ.mbi.web.html.history, params);
        var history_ele = goog.dom.getElementByClass('history');
        history_ele.appendChild(ele);
      });
    }
    return true;
  };
};


/**
 * Singleton instance.
 * @type {mbi.wiki.Decorator}
 */
mbi.wiki.Decorator.decorator = new mbi.wiki.Decorator();


