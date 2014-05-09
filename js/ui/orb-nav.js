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
 * @fileoverview Image base navigation.
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */



goog.provide('mbi.ui.OrbNav');
goog.require('goog.events');
goog.require('goog.fx.dom.ResizeWidth');
goog.require('goog.fx.easing');
goog.require('goog.soy');
goog.require('mbi.templ.ui');



/**
 * Image base navigation.
 * @constructor
 */
mbi.ui.OrbNav = function() {
  /**
   * @type {Element}
   * @protected
   */
  this.root = null;
};


/**
 * @define {boolean} debug flag.
 */
mbi.ui.OrbNav.DEBUG = false;


/**
 * @final
 * @type {string}
 */
mbi.ui.OrbNav.prototype.basePath = 'https://mbinfo.storage.googleapis.com/';


/**
 * Initialize UI.
 * @param {Element} ele
 */
mbi.ui.OrbNav.prototype.init = function(ele) {

  var url_base = window.location.protocol == 'chrome-extension:' ? '#page' : '';
  var opt = {
    url_base: url_base,
    imgUrl: this.basePath + 'image/img-nav/base.png',
    panels: /** @type {Array} */ (goog.global['metaOrbNavLinks']) || []
  };
  goog.soy.renderElement(ele, mbi.templ.ui.orbNav, opt);
  var ele_panels = goog.dom.getElementByClass('orb-panels', ele);
  this.root = goog.dom.getElementByClass('orb-base', this.root);
  var orb = ele.querySelector('bg-image');
  goog.events.listen(this.root, 'click', function(e) {
    goog.dom.classes.toggle(this.root, 'selected');
  }, false, this);
  goog.events.listen(this.root, goog.events.EventType.MOUSEOUT, function(e) {
    if (e.target == this.root) {
      goog.dom.classes.remove(this.root, 'selected');
    }
  }, false, this);
};


/**
 * Read data from spreadsheet and dump to console.
 */
mbi.ui.OrbNav.prototype.dumpUrls = function() {
  var ss = new mbi.data.doc.SpreadSheet('0AjkEGxM0lYcRdDRwdXp2OUFmNWJyN3FXZko0V1BkY0E');
  ss.fetchSheets().addBoth(function() {
    ss.getSheet(0).fetchCells().addBoth(function(cells) {
      window.console.log(cells);
      var links = [];
      var panel;
      for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (cell[0]) {
          panel = {
            title: cell[0],
            links: []
          };
          links.push(panel);
        }
        panel.links.push({
          title: cell[2],
          url: cell[1]
        });
      }
      window.console.log(JSON.stringify(links, null, 2));
    });
  });
};


goog.exportProperty(mbi.ui.OrbNav.prototype, 'dumpUrls',
    mbi.ui.OrbNav.prototype.dumpUrls);

