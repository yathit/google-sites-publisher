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
 * @fileoverview Background updater.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.admin.Updater');
goog.require('mbi.app.shared');
goog.require('mbi.data.Bucket');
goog.require('mbi.data.storage');



/**
 * Background updater.
 * @param {mbi.wiki.HtmlRenderer} processor wiki processor.
 * @constructor
 */
mbi.admin.Updater = function(processor) {
  /**
   * @protected
   * @type {mbi.wiki.HtmlRenderer}
   */
  this.processor = processor;
  /**
   * @protected
   * @type {mbi.data.Bucket}
   */
  this.figure_bucket = mbi.app.shared.getBucket(mbi.app.base.BUCKET_FIG);
  /**
   * @protected
   * @type {mbi.data.Bucket}
   */
  this.site_bucket = mbi.app.shared.getBucket(mbi.app.base.BUCKET_SITE);
  goog.events.listen(this.site_bucket, mbi.data.Bucket.CHANGED, this.handleChange,
      true, this);
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.admin.Updater.prototype.logger =
    goog.log.getLogger('mbi.admin.Updater');


/**
 * Run.
 */
mbi.admin.Updater.prototype.run = function() {
  mbi.data.storage.onStorageReady(function() {
    this.site_bucket.fetch(); // site
    this.figure_bucket.fetch();
  }, this);
};


/**
 * @return {mbi.data.Bucket}
 */
mbi.admin.Updater.prototype.getBucketFigure = function() {
  return this.figure_bucket;
};


/**
 * @return {mbi.data.Bucket}
 */
mbi.admin.Updater.prototype.getBucketSite = function() {
  return this.site_bucket;
};


/**
 * @param {number=} idx offset index.
 */
mbi.admin.Updater.prototype.updateSite = function(idx) {
  idx = idx || 0;
  var db = mbi.data.storage.getStorage();
  var last_entry = this.site_bucket.getLastUpdatedDate();
  // find pages that is 1 ms more recent than already published.
  var kr = last_entry ?
      ydn.db.KeyRange.lowerBound((+last_entry) + 1) : null;
  var req = db.values(mbi.app.base.TOPIC_SITE_NAME, 'updated.$t', kr, 1, idx,
      true);
  req.addCallbacks(function(entry) {
    // var ex = this.site_bucket.getByName(entry['name']);
    // window.console.log(entry, ex);
  }, function(e) {
    throw e;
  }, this);
};


/**
 * @param {mbi.data.BucketEvent} e
 */
mbi.admin.Updater.prototype.handleChange = function(e) {
  if (e.indexes) {
    // incremental update
  } else {
    // first full read of the bucket.
    this.updateSite();
  }
};


/**
 * @param {Event} e
 */
mbi.admin.Updater.prototype.publishAll = function(e) {
  var db = mbi.data.storage.getStorage();
  var me = this;
  var publish = function(offset) {
    var req = db.values(mbi.app.base.TOPIC_SITE_NAME, null, 1, offset);
    req.addCallbacks(function(items) {
      var entry = items[0];
      if (entry) {
        // publish
        var page = new ydn.gdata.site.Page(entry);
        this.logger.fine('publishing ' + page.getUrl());
        throw new Error('Not implemented');
        /*
        this.processor.publish(page).addCallback(function() {
          publish(offset + 1); // continue next
        });
        */
      }
    }, function(e) {
      throw e;
    }, me);
  };
  publish(0);
};
