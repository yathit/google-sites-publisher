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
 * @fileoverview Place holder for figure box.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.fig.PlaceHolder');
goog.require('goog.events.EventTarget');



/**
 * Figure place holder.
 * @param {Element} ele figure placeholder element.
 * @constructor
 * @struct
 * @extends {goog.events.EventTarget}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 */
mbi.fig.PlaceHolder = function(ele) {
  goog.base(this);
  /**
   * @protected
   * @type {HTMLElement}
   */
  this.root = /** @type {HTMLElement} */ (ele);
  this.root.className = 'figure-placeholder';
  this.root.textContent = 'figure';
};
goog.inherits(mbi.fig.PlaceHolder, goog.events.EventTarget);


/**
 * @return {HTMLElement}
 */
mbi.fig.PlaceHolder.prototype.getElement = function() {
  return this.root;
};


/**
 * Find a place and drop figure placeholder.
 * @param {HTMLElement} ele drop place to start with.
 */
mbi.fig.PlaceHolder.prototype.locate = function(ele) {
  if (!ele || ele.tagName == goog.dom.TagName.SECTION ||
      ele.tagName == goog.dom.TagName.ARTICLE) {
    return;
  }
  // find suitable div.
  /**
   * @type {HTMLElement}
   */
  var ce = ele;
  var pe = null;
  while (ce) {
    if (pe && pe.parentElement && ce.tagName[0] == 'H') { // heading
      var p = this.root;
      if (p.parentElement) {
        p.parentElement.removeChild(p);
      }
      pe.parentElement.insertBefore(p, pe);
      return;
    }
    if (ce.tagName == goog.dom.TagName.DIV ||
        ce.tagName == goog.dom.TagName.P) {
      var p = this.root;
      if (p.parentElement) {
        p.parentElement.removeChild(p);
      }
      ce.parentElement.insertBefore(p, ce);
      return;
    }
    pe = ce;
    ce = /** @type {HTMLElement} */ (ce.previousElementSibling);
  }
  // try putting on parent element.
  this.locate(/** @type {HTMLElement} */ (ele.parentElement));
};


