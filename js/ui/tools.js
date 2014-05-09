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
 * @fileoverview Tools control.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui.ToolsControl');
goog.require('mbi.ui.IVisible');
goog.require('templ.mbi.app');
goog.require('ydn.client');
goog.require('ydn.client.HttpRequestData');



/**
 * User setting control.
 * @constructor
 * @implements {mbi.ui.IVisible}
 * @struct
 */
mbi.ui.ToolsControl = function() {
  /**
   * @type {Element}
   * @private
   */
  this.element_ = null;
  this.renderred_ = false;
};


/**
 * @param {Event} e
 */
mbi.ui.ToolsControl.prototype.updateDefinitionClick = function(e) {

};


/**
 * Init ui.
 * @param {Element} ele
 */
mbi.ui.ToolsControl.prototype.init = function(ele) {
  this.element_ = ele;
  goog.soy.renderElement(ele, templ.mbi.app.toolsPanel);
  var btn_update = ele.querySelector('button[name=update-definition]');
  goog.events.listen(btn_update, 'click', this.updateDefinitionClick, false, this);
};


/**
 * @param {boolean} value
 */
mbi.ui.ToolsControl.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.element_, value);
  if (value && !this.renderred_) {

  }
};

