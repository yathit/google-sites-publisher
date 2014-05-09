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
 * @fileoverview Figure renderer.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.fig.DndController');
goog.require('goog.log');
goog.require('mbi.app.base');
goog.require('mbi.fig.InPlaceEditor');
goog.require('mbi.fig.PlaceHolder');



/**
 * Figure, video uploader.
 * @param {mbi.data.Bucket} bucket figure bucket.
 * @constructor
 * @struct
 * @extends {goog.events.EventTarget}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 */
mbi.fig.DndController = function(bucket) {
  goog.base(this);
  /**
   * @type {mbi.fig.PlaceHolder}
   * @protected
   */
  this.placeholder;
  /**
   * @type {mbi.data.Bucket}
   * @protected
   */
  this.bucket = bucket;
};
goog.inherits(mbi.fig.DndController, goog.events.EventTarget);


/**
 * @const
 * @type {string} Drop event type.
 */
mbi.fig.DndController.DROP = 'dp';



/**
 * Drop event.
 * @param {mbi.fig.InPlaceEditor} placeholder figure element.
 * @constructor
 * @struct
 * @extends {goog.events.Event}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 */
mbi.fig.DndController.DropEvent = function(placeholder) {
  goog.base(this, mbi.fig.DndController.DROP);
  /**
   * Receiver element.
   * @type {mbi.fig.InPlaceEditor}
   */
  this.placeholder = placeholder;
};
goog.inherits(mbi.fig.DndController.DropEvent, goog.events.Event);


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.fig.DndController.prototype.logger =
    goog.log.getLogger('mbi.fig.DndController');


/**
 * @param {goog.events.BrowserEvent} evt
 */
mbi.fig.DndController.prototype.handleDragOver = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var e = evt.getBrowserEvent();
  var dt = /** @type {DataTransfer} */ (e.dataTransfer);
  if (this.placeholder) {
    dt.dropEffect = 'copy';
  } else {
    dt.dropEffect = 'none';
  }
};


/**
 * @type {number}
 * @private
 */
mbi.fig.DndController.prototype.last_run_ = NaN;


/**
 * Find a place and drop figure placeholder.
 * @param {Element} ele drop place to start with.
 */
mbi.fig.DndController.prototype.dropPlaceholder = function(ele) {
  if (!this.last_run_ || goog.now() - this.last_run_ > 1000) {
    if (this.placeholder) {
      this.placeholder.locate(/** @type {HTMLElement} */ (ele));
    }
    this.last_run_ = goog.now();
  }
};


/**]
 * @type {number}
 * @private
 */
mbi.fig.DndController.prototype.enter_count_ = 0;


/**
 * @param {goog.events.BrowserEvent} evt
 */
mbi.fig.DndController.prototype.handleDragEnter = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  this.enter_count_++;
  // console.log('enter ' + evt.target.tagName)
  if (goog.dom.classes.has(evt.target, 'wiki-content')) {
    return;
  }
  var e = /** @type {DragEvent} */ (evt.getBrowserEvent());
  var dt = /** @type {DataTransfer} */ (e.dataTransfer);
  var item = dt.items[0];
  if (item && item.kind == 'file' &&
      goog.string.startsWith(item.type, 'image/')) {
    if (!this.placeholder) {
      this.placeholder = new mbi.fig.PlaceHolder(document.createElement('div'));
    }
    this.dropPlaceholder(e.toElement);
  }
};


/**
 * @protected
 */
mbi.fig.DndController.prototype.disposePlaceholder = function() {
  if (this.placeholder) {
    this.placeholder.dispose();
    this.placeholder = null;
  }
};


/**
 * @param {goog.events.BrowserEvent} evt
 */
mbi.fig.DndController.prototype.handleDragLeave = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  // console.log('leave ' + evt.target.tagName)
  this.enter_count_--;
  if (this.enter_count_ <= 0) {
    this.disposePlaceholder();
    this.enter_count_ = 0;
  }
};


/**
 * @param {goog.events.BrowserEvent} evt
 */
mbi.fig.DndController.prototype.handleDrop = function(evt) {
  evt.stopPropagation();
  evt.preventDefault();
  var e = /** @type {DragEvent} */ (evt.getBrowserEvent());
  var dt = /** @type {DataTransfer} */ (e.dataTransfer);
  var item = dt.items[0]; // getAsFile()
  if (item && item.kind == 'file' &&
      goog.string.startsWith(item.type, 'image/')) {
    var file = item.getAsFile();
    if (this.placeholder && goog.string.startsWith(file.type, 'image/')) {
      var editor = new mbi.fig.InPlaceEditor(this.placeholder.getElement(),
          this.bucket, true);
      editor.uploadFile(file);
      this.dispatchEvent(new mbi.fig.DndController.DropEvent(editor));
      this.placeholder = null;
    } else {
      this.logger.fine(file.type + ' MIME not supported');
    }
  }
  this.disposePlaceholder();
  this.enter_count_ = 0;
};


/**
 * @param {Element} dropZone wiki content for drop zone.
 */
mbi.fig.DndController.prototype.init = function(dropZone) {
  goog.events.listen(dropZone, 'dragover', this.handleDragOver, false, this);
  goog.events.listen(dropZone, 'drop', this.handleDrop, false, this);
  goog.events.listen(dropZone, 'dragenter', this.handleDragEnter, false, this);
  goog.events.listen(dropZone, 'dragleave', this.handleDragLeave, false, this);
};


