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
 * @fileoverview Select a figure dialog box.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.fig.Select');
goog.require('mbi.fig');
goog.require('goog.ui.Dialog');
goog.require('mbi.app.shared');
goog.require('mbi.data.Bucket');
goog.require('mbi.inj');
goog.require('templ.mbi.fig');



/**
 * List of figure page.
 * @param {mbi.data.Bucket=} opt_bucket figure bucket. If bucket is not provided
 * it is assumed that chrome runtime channel is available.
 * @constructor
 * @struct
 */
mbi.fig.Select = function(opt_bucket) {
  /**
   * @type {goog.ui.Dialog}
   */
  this.dialog = null;
  /**
   * @final
   * @type {mbi.data.Bucket}
   */
  this.bucket = opt_bucket || null;
  /**
   * @private
   * @type {Array}
   */
  this.list_ = null;
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.fig.Select.prototype.logger =
    goog.log.getLogger('mbi.fig.Select');


/**
 * @type {Array.<goog.async.Deferred>}
 */
mbi.fig.Select.prototype.dfs_;


/**
 * @return {goog.async.Deferred} list of figure meta data.
 */
mbi.fig.Select.prototype.list = function() {
  var df = new goog.async.Deferred();
  if (this.bucket) {
    this.bucket.ready().addBoth(function() {
      df.callback(this.bucket.list());
    }, this);
  } else if (this.list_) {
    df.callback(this.list_);
  } else {
    if (!this.dfs_) {
      this.dfs_ = [];
      mbi.inj.ch_site.send(mbi.app.base.Req.LIST_OF_FIGURES).addCallback(function(msg) {
        this.list_ = msg;
        this.logger.finest('receiving ' + this.list_.length + ' figures.');
        var df;
        while (df = this.dfs_.pop()) {
          df.callback(this.list_);
        }
      }, this);
    }
    this.dfs_.push(df);
  }
  return df;
};


/**
 * @protected
 */
mbi.fig.Select.prototype.renderContent = function() {

  this.list().addCallbacks(function(list) {
    var rows = [];
    var n = list.length;
    for (var i = 0; i < n; i++) {
      var item = new mbi.data.Object(list[i]);
      if (item.isDeleted()) {
        continue;
      }
      var title = item.getMeta('title') || item.getName();
      var src = item.getUrl();
      rows.push({
        no: i + 1,
        deleted: item.isDeleted(),
        title: title,
        src: src
      });
    }
    rows.sort(function(a, b) {
      return mbi.fig.normalizeTitle(a.title) >
          mbi.fig.normalizeTitle(b.title) ? 1 : -1;
    });
    // console.log(rows);
    var data = {
      rows: rows
    };
    this.logger.finest('rendering ' + rows.length + ' of ' + list.length);
    var html = templ.mbi.fig.selectFigure(data);
    // window.console.log(html);
    this.dialog.setContent(html);
  }, function(e) {
    throw e;
  }, this);
};


/**
 * @private
 * @type {Element}
 */
mbi.fig.Select.prototype.btn_default_;


/**
 * @return {Element}
 */
mbi.fig.Select.prototype.getDefaultButton = function() {
  if (!this.btn_default_) {
    var buttons = this.dialog.getButtonSet();
    var key = buttons.getDefault();
    goog.asserts.assertString(key);
    this.btn_default_ = buttons.getButton(key);
  }
  return this.btn_default_;
};


/**
 * Show dialog.
 * @param {function(this: T, string?)} cb callback on select or cancel.
 * @param {T} scope
 * @template T
 */
mbi.fig.Select.prototype.show = function(cb, scope) {
  if (!this.dialog) {
    this.dialog = new goog.ui.Dialog();
    this.dialog.setHasTitleCloseButton(false);
    this.dialog.setTitle('Select a wiki figure');
    // this.dialog.setContent('Loading');
    var buttons = goog.ui.Dialog.ButtonSet.createOkCancel();
    this.dialog.setButtonSet(buttons);
    this.renderContent();
    goog.events.listen(this.dialog.getContentElement(), 'click', function(e) {
      var li = null;
      if (e.target.tagName == goog.dom.TagName.LI) {
        li = e.target;
      }
      if (!li) {
        li = goog.dom.getAncestorByTagNameAndClass(e.target,
            goog.dom.TagName.LI);
      }
      if (li) {
        var name = parseInt(li.getAttribute('name'), 10);
        var btn = this.getDefaultButton();
        btn.setAttribute('name', name);
        btn.textContent = 'Select No. ' + (name + 1);
      }
    }, false, this);
  }
  mbi.inj.status('select a figure');
  this.dialog.setVisible(true);
  this.dialog.getDialogElement().focus();
  goog.events.listenOnce(this.dialog, goog.ui.Dialog.EventType.SELECT,
      function(e) {
        var de = /** @type {goog.ui.Dialog.Event} */ (e);
        if (de.key == 'cancel') {
          return;
        }
        var btn = this.getDefaultButton();
        var idx = parseInt(btn.getAttribute('name'), 10);
        if (!isNaN(idx)) {
          var ol = goog.dom.getElementsByTagNameAndClass('ol', null,
              this.dialog.getContentElement())[0];
          var li = ol.children[idx];
          var img = goog.dom.getElementsByTagNameAndClass('img', null, li)[0];
          cb.call(scope, img.src);
          btn.setAttribute('name', '');
          btn.textContent = 'Select None';
        }
      }, false, this);
};

