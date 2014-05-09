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
 * @fileoverview Inplace uploader.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.fig.InPlaceEditor');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('mbi.fig');
goog.require('templ.mbi.fig');



/**
 * Figure, video uploader.
 * @param {Element} ele figure place holder.
 * @param {mbi.data.Bucket} bucket figure bucket.
 * @param {boolean} editable editable content.
 * @constructor
 * @struct
 * @extends {goog.events.EventTarget}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 */
mbi.fig.InPlaceEditor = function(ele, bucket, editable) {
  goog.base(this);
  /**
   * @type {Element}
   * @protected
   */
  this.root = ele;
  /**
   * @type {mbi.data.Bucket}
   * @protected
   */
  this.bucket = bucket;
  /**
   * @protected
   * @type {goog.events.EventHandler}
   */
  this.handler = new goog.events.EventHandler();
  /**
   * Object name.
   * @protected
   * @type {string|undefined}
   */
  this.name = undefined;
  /**
   * @protected
   * @type {boolean}
   */
  this.editable = editable;
  this.init_();
};
goog.inherits(mbi.fig.InPlaceEditor, goog.events.EventTarget);


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.fig.InPlaceEditor.prototype.logger =
    goog.log.getLogger('mbi.fig.InPlaceEditor');


/**
 * Initialize UI
 * @private
 */
mbi.fig.InPlaceEditor.prototype.init_ = function() {
  if (goog.dom.classes.has(this.root, 'figure-placeholder')) {
    // figure place holder from drag and drop.
    this.root.className = 'wikic figure-box';
    this.root.innerHTML = '';
    var opt = {
      editable: this.editable
    };
    goog.soy.renderElement(this.root, templ.mbi.fig.figureBox, opt);
  } else {
    // existing image from wiki content.
    goog.dom.classes.add(this.root, 'wikic figure-box');
  }
  if (this.editable) {
    var ele = goog.dom.getElementByClass('figure-title', this.root);
    if (ele) {
      this.handler.listenWithScope(ele, goog.events.EventType.BLUR,
          this.handleMetaChange, false, this);
    }
    ele = goog.dom.getElementByClass('figure-description', this.root);
    if (ele) {
      this.handler.listenWithScope(ele, goog.events.EventType.BLUR,
          this.handleMetaChange, false, this);
    }
  }
};


/**
 * @type {goog.async.Delay}
 * @private
 */
mbi.fig.InPlaceEditor.prototype.delay_update_ = null;


/**
 * Update metadata to server.
 * @protected
 */
mbi.fig.InPlaceEditor.prototype.updateMeta = function() {
  if (!this.delay_update_) {
    this.delay_update_ = new goog.async.Delay(function(e) {
      var obj = this.bucket.getByName(this.name);
      if (obj) {
        var has_changed = obj.setMeta('title', this.getTitle());
        has_changed |= obj.setMeta('description', this.getDescription());
        if (has_changed) {
          this.bucket.patch(obj);
        } else {
          this.logger.finest('no change in title or description');
        }
      } else {
        this.logger.warning('object ' + this.name + ' not found in ' +
            this.bucket);
      }
    }, 1000, this);
  }
  this.delay_update_.start();
};


/**
 * @protected
 * @param {Event} e
 */
mbi.fig.InPlaceEditor.prototype.handleMetaChange = function(e) {
  this.updateMeta();
};


/**
 * @param {!File} file
 */
mbi.fig.InPlaceEditor.prototype.uploadFile = function(file) {
  // update fields
  var meta = mbi.fig.getMeta(file);
  this.setTitle(meta.title);
  // show figure
  var reader = new FileReader();
  var me = this;
  reader.onload = function(e) {
    me.setImgSrc(e.target.result);
  };
  reader.readAsDataURL(file);
  // upload to server

  var msg = new mbi.ui.feed.Message('Uploading... ' + file.name);
  mbi.ui.feed.feed.add(msg);
  this.bucket.upload(file, this.name, meta).addCallback(function(name) {
    // depending on bucket policy, file name can change.
    this.name = name;
    msg.title('Uploaded');
    msg.link('#figure/' + name, 'view');
  }, this);
};


/**
 * Get figure title from the title element content.
 * @return {string}
 */
mbi.fig.InPlaceEditor.prototype.getTitle = function() {
  var ele = goog.dom.getElementByClass('figure-title', this.root);
  return ele ? goog.string.trim(ele.textContent) : '';
};


/**
 * Set figure title from the title element content.
 * @param {string} title
 */
mbi.fig.InPlaceEditor.prototype.setTitle = function(title) {
  var ele = goog.dom.getElementByClass('figure-title', this.root);
  if (ele) {
    ele.textContent = title;
  }
};


/**
 * Get figure title from the title element content.
 * @return {string}
 */
mbi.fig.InPlaceEditor.prototype.getDescription = function() {
  var ele = goog.dom.getElementByClass('figure-description', this.root);
  return ele ? goog.string.trim(ele.textContent) : '';
};


/**
 * Set figure title from the title element content.
 * @param {string} title
 */
mbi.fig.InPlaceEditor.prototype.setDescription = function(title) {
  var ele = goog.dom.getElementByClass('figure-description', this.root);
  if (ele) {
    ele.textContent = title;
  }
};


/**
 * @param {string} src image src string.
 */
mbi.fig.InPlaceEditor.prototype.setImgSrc = function(src) {
  var img = goog.dom.getElementsByTagNameAndClass('img', null,
      this.root)[0];
  img.src = src;
};


/**
 * @inheritDoc
 */
mbi.fig.InPlaceEditor.prototype.disposeInternal = function() {
  this.handler.dispose();
  this.handler = null;
  this.bucket = null;
  this.root = null;
};

