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
 * @fileoverview Sitemap display.
 */


goog.provide('mbi.ui.SiteMapDisplay');
goog.require('goog.ui.tree.TreeControl');
goog.require('mbi.data.SiteMap');



/**
 * Site map display.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @struct
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 */
mbi.ui.SiteMapDisplay = function() {
  goog.base(this);
  /**
   * @type {number}
   */
  this.max_label = 20;
  /**
   * @type {Element}
   * @private
   */
  this.ele_tree_ = null;
  /**
   * @type {goog.ui.tree.TreeControl}
   * @private
   */
  this.tree_ = null;
  /**
   * @type {mbi.data.SiteMap} site map
   * @protected
   */
  this.map;
  /**
   * @type {!goog.events.EventHandler}
   * @protected
   */
  this.handler = new goog.events.EventHandler(this);
};
goog.inherits(mbi.ui.SiteMapDisplay, goog.events.EventTarget);


/**
 * Initialize UI.
 * @param {Element} ele root content for tree.
 */
mbi.ui.SiteMapDisplay.prototype.init = function(ele) {
  this.ele_tree_ = ele;
};


/**
 * @const
 * @type {boolean}
 */
mbi.ui.SiteMapDisplay.SHOW_SUBPAGE = true;


/**
 * Create Tree Node recursively from site map data.
 * @param {goog.ui.tree.BaseNode} node
 * @param {mbi.data.SiteMap} data
 * @param {number} max_label Node level.
 * @param {number=} opt_level Node level.
 */
mbi.ui.SiteMapDisplay.createTreeFromData = function(node, data,
    max_label, opt_level) {
  opt_level = opt_level || 0;
  // here we use Path instead of URL, so that it navigate internally.
  var href = data.path || data.url;
  var a = document.createElement('a');
  a.textContent = data.getLabel();
  a.href = href;
  a.setAttribute('title', data.title || '');
  node.setHtml(a.outerHTML);
  if (opt_level > max_label) {
    return;
  }

  if (mbi.ui.SiteMapDisplay.SHOW_SUBPAGE) {
    for (var i = 0, n = data.countSubPage(); i < n; i++) {
      var child = data.subPage(i);
      var childNode = node.getTree().createNode('');
      node.add(childNode);
      mbi.ui.SiteMapDisplay.createTreeFromData(childNode, child,
          max_label, opt_level + 1);
    }
  }

  for (var i = 0, n = data.count(); i < n; i++) {
    var child = data.child(i);
    var childNode = node.getTree().createNode('');
    if (opt_level == 0) { // let first level expended
      childNode.setExpanded(true);
    }
    node.add(childNode);
    mbi.ui.SiteMapDisplay.createTreeFromData(childNode, child,
        max_label, opt_level + 1);
  }
};


/**
 * Redraw UI using given site map.
 * @param {mbi.data.SiteMap} map
 */
mbi.ui.SiteMapDisplay.prototype.setModel = function(map) {
  goog.asserts.assertInstanceof(map, mbi.data.SiteMap,
      'SiteMapDisplay require a valid site map object');
  this.map = map;
  this.ele_tree_.innerHTML = '';
  var treeConfig = goog.object.clone(goog.ui.tree.TreeControl.defaultConfig);
  if (this.tree_) {
    this.tree_.dispose();
  }
  this.tree_ = new goog.ui.tree.TreeControl(this.map.name || '', treeConfig);
  mbi.ui.SiteMapDisplay.createTreeFromData(this.tree_, this.map, this.max_label);
  this.tree_.render(this.ele_tree_);
};


/**
 * @inheritDoc
 */
mbi.ui.SiteMapDisplay.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');
  this.handler.dispose();
  this.ele_tree_ = null;
  this.map = null;
};
