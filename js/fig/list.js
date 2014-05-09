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
 * @fileoverview List of figure page.
 *
 * Visiting list of figure page will update the list on each visit.
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.fig.List');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.style');
goog.require('mbi.data.Bucket');
goog.require('mbi.fig');
goog.require('mbi.ui.IVisible');
goog.require('templ.mbi.web.html');



/**
 * List of figure page.
 * @param {mbi.data.Bucket} bucket figure bucket.
 * @constructor
 * @implements {mbi.ui.IVisible}
 * @struct
 */
mbi.fig.List = function(bucket) {
  /**
   * @protected
   * @type {Element}
   */
  this.root = null;
  /**
   * @protected
   * @type {Element}
   */
  this.toolbar = null;
  /**
   * @final
   * @type {mbi.data.Bucket}
   */
  this.bucket = bucket;
  goog.events.listen(this.bucket, mbi.data.Bucket.CHANGED, this.handleUpdated,
      false, this);
  goog.events.listen(this.bucket, mbi.data.Bucket.EventType.CREATED,
      this.handleObjectCreated, false, this);
  goog.events.listen(this.bucket, mbi.data.Bucket.EventType.UPDATED,
      this.handleObjectUpdated, false, this);
  this.rendered_ = false;
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.fig.List.prototype.logger = goog.log.getLogger('mbi.fig.List');


/**
 * @param {Element} ele
 */
mbi.fig.List.prototype.init = function(ele) {
  var data = {
    editable: true
  };
  this.root = ele;

  goog.soy.renderElement(ele, templ.mbi.fig.figureList, data);
  this.toolbar = goog.dom.getElementByClass('toolbar', ele);
  goog.events.listen(this.toolbar, 'click', function(e) {
    var name = e.target.getAttribute('name');
    if (name == 'publish') {
      this.publish();
    }
  }, false, this);
  this.attachUploadInput(ele);
};


/**
 * @type {Element}
 * @private
 */
mbi.fig.List.prototype.ele_input_ = null;


/**
 * Attach input element for handling uploading.
 * @param {Element} ele an element having one INPUT element.
 */
mbi.fig.List.prototype.attachUploadInput = function(ele) {
  var input = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.INPUT,
      null, ele)[0];
  this.ele_input_ = document.createElement('input');
  this.ele_input_.type = 'file';
  this.ele_input_.style.display = 'none';
  ele.appendChild(this.ele_input_);
  goog.events.listen(this.ele_input_, goog.events.EventType.CHANGE,
      this.handleUploadFile, true, this);
};


/**
 * Show upload file dialog.
 */
mbi.fig.List.prototype.showUploadFile = function() {
  if (this.ele_input_) {
    this.ele_input_.click();
  } else {
    this.logger.warning('input Element not attached.');
  }
};


/**
 * @param {Event} ev input change event.
 */
mbi.fig.List.prototype.handleUploadFile = function(ev) {
  // update fields
  var file = ev.target.files[0];
  if (file) {
    var meta = mbi.fig.getMeta(file);
    var df = this.bucket.upload(file, undefined, meta);
    df.addCallback(function(name) {
      var uri = new goog.Uri(name);
      // go to figure detail page.
      var path = uri.getPath();
      if (path.charCodeAt(0) != '/') {
        path = '/' + path;
      }
      var obj = this.bucket.getByName(name);
      mbi.fig.Page.putCopyrightedFigurePage(obj);
      window.location.hash = '#figure' + path;
    }, this);
  } else {
    this.logger.info('no file selected');
  }
};


/**
 * @type {boolean}
 * @private
 */
mbi.fig.List.prototype.rendered_ = false;


/**
 * Render list.
 * @param {boolean=} opt_static for static web site, use absolute path for
 * figure href and copy links.
 * @return {Array} list of figure rows.
 * @protected
 */
mbi.fig.List.prototype.getRows = function(opt_static) {
  var rows = [];
  var ele_tbody = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.TBODY,
      null, this.root)[0];
  // console.log(this.list);
  var n = this.bucket.count();
  for (var i = 0; i < n; i++) {
    var item = this.bucket.get(i);
    var title = item.getMeta('title') || item.getName();
    var des = item.getMeta('description') || '';
    var src = opt_static ? 'http://www.mechanobio.info/' + item.getName() : this.bucket.url(item);
    var fig_path = new goog.Uri(src).getPath();
    var path = opt_static ? new goog.Uri(src).getPath() + '.html' :
        '#figure' + fig_path;
    var refs = [];
    if (opt_static) {
      var a = ele_tbody.querySelector('a[href="#figure' + fig_path + '"]');
      if (!a) {
        continue;
      }
      var tr = goog.dom.getAncestorByTagNameAndClass(a, 'TR');
      if (tr && tr.children[2]) {
        var ref_td = tr.children[2];
        var ul = ref_td.children[0];
        for (var j = 0, jn = ul.childElementCount; j < jn; j++) {
          var ch = ul.children[j].children[0];
          if (ch) {
            refs.push({
              name: ch.textContent,
              href: new goog.Uri(ch.href).getPath() // get relative url
            });
          }
        }
      }
    }
    rows.push({
      no: i + 1,
      deleted: item.isDeleted(),
      title: title,
      src: src,
      path: path,
      refs: refs,
      description: des
    });
  }

  rows.sort(function(a, b) {
    return mbi.fig.normalizeTitle(a.title) > mbi.fig.normalizeTitle(b.title) ? 1 : -1;
  });
  for (var i = 0; i < rows.length; i++) {
    rows[i].no = i + 1;
  }
  return rows;
};


/**
 * Render list.
 * @protected
 */
mbi.fig.List.prototype.renderTable = function() {
  var msg = new mbi.ui.feed.Message('Figure list');
  mbi.ui.feed.feed.add(msg);
  var rows = this.getRows();
  var data = {
    rows: rows
  };
  var table_div = goog.dom.getElementByClass('figure-table', this.root);
  goog.soy.renderElement(table_div, templ.mbi.fig.figureListTable, data);
  this.renderRefPages(msg);
  this.rendered_ = true;
};


/**
 * Render reference page that link to the image.
 * @param {mbi.ui.feed.Message} msg
 * @protected
 */
mbi.fig.List.prototype.renderRefPages = function(msg) {
  var publish_btn = this.toolbar.children[0];
  publish_btn.setAttribute('disabled', 'true');
  var db = /** @type {ydn.db.crud.DbOperator} */ (mbi.data.storage.getStorage()
      .branch(null, undefined, undefined, undefined, undefined, true));
  var ele_tbody = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.TBODY,
      null, this.root)[0];
  var np = 0;
  var nf = 0;
  /**
   * @this {mbi.fig.List}
   * @param {mbi.data.SiteMap} map
   * @param {Function} cb
   */
  var batch = function(map, cb) {
    if (!map) {
      cb.call(this);
      return;
    }
    msg.title('Figure list (' + np + ', ' + nf + ')');
    var ids = map.getSubPageIds();
    ids.unshift(map.id);
    db.values(mbi.app.base.TOPIC_SITE_NAME, ids).addCallback(function(ps) {
      var data = /** @type {!PageEntry} */ (ps[0]);
      var p = new ydn.gdata.site.Page(data);
      msg.status('analyzing ' + p.getTitle());

      var content = p.getHtmlContent();
      for (var j = 1; j < ps.length; j++) {
        if (ps[j]) {
          var sp = new ydn.gdata.site.Page(ps[j]);
          content += sp.getHtmlContent();
        }
      }
      var n = ele_tbody.childElementCount;
      var found = false;
      for (var i = 0; i < n; i++) {
        var tr = ele_tbody.children[i];
        var img_td = tr.children[3];
        var img = img_td.children[0].children[0];
        // src: https://mbi-figure.storage.googleapis.com/1384241602789.jpg
        var m = img.src.match(/([^\/]+)$/); // last token as filename.
        if (!m) {
          continue;
        }
        var img_name = m[1];
        var has_link = content.indexOf(img_name) >= 0; // false positive?
        if (has_link) {
          var ul = tr.children[2].children[0];
          if (ul) {
            var a = document.createElement('a');
            a.textContent = p.getTitle();
            var parts = ydn.gdata.site.utils.parseUrl(p.getUrl());
            a.href = parts.path;
            var li = document.createElement('li');
            li.appendChild(a);
            ul.appendChild(li);
            nf++;
            found = true;
          }
        }
      }
      if (found) {
        np++;
      }

      var callChild = function(i) {
        if (i < map.count()) {
          batch.call(this, map.child(i), function() {
            callChild.call(this, ++i);
          });
        } else {
          cb.call(this);
        }
      };
      callChild.call(this, 0);
    }, this);
  };
  mbi.app.shared.getTopicSiteMap().addCallback(function(map) {
    batch.call(this, map, function() {
      msg.title('Figure list');
      msg.done('done. ' + nf + ' figures in ' + np + ' pages found.');
      publish_btn.removeAttribute('disabled');
    });
  }, this);
};


/**
 * @protected
 * @param {mbi.data.Bucket.ObjectEvent} e
 */
mbi.fig.List.prototype.handleObjectCreated = function(e) {
  this.renderTable();
};


/**
 * @protected
 * @param {mbi.data.Bucket.ObjectEvent} e
 */
mbi.fig.List.prototype.handleObjectUpdated = function(e) {
  this.renderTable();
};


/**
 * @protected
 * @param {mbi.data.BucketEvent} e
 */
mbi.fig.List.prototype.handleUpdated = function(e) {
  if (e.indexes && e.indexes.length > 0) {
    var rows = goog.dom.getElementsByTagNameAndClass('tr', null, this.root);
    for (var i = 0; i < e.indexes.length; ++i) {
      var idx = e.indexes[i];
      var item = this.bucket.get(idx);
      var tr = rows[idx];
      // console.log(item, tr);
      if (tr) {
        goog.style.setElementShown(tr, !item.isDeleted());
        var ele_title = goog.dom.getElementByClass('title', tr);
        ele_title.textContent = item.getMeta('title');
        var ele_description = goog.dom.getElementByClass('description', tr);
        ele_description.textContent = item.getMeta('description');
      } else {
        this.logger.warning('Item ' + idx + ' ' + item.getName() +
            ' not found, probably not rendered yet.');
      }
    }
  }
};


/**
 * Update data and re-render.
 */
mbi.fig.List.prototype.update = function() {
  this.bucket.fetch().addCallbacks(function(indexes) {
    if (!this.rendered_ || !indexes || indexes.length > 0) {
      this.renderTable();
      this.logger.finer('figure list updated');
    } else {
      this.logger.finer('no update require for figure list');
    }
  }, function(e) {
    throw e;
  }, this);
};


/**
 * Render UI and set visible.
 */
mbi.fig.List.prototype.show = function() {
  this.setVisible(true);
  this.update();
};


/**
 * Publish to static HTML site.
 * @return {goog.async.Deferred} callback after publish. Return published url.
 */
mbi.fig.List.prototype.publish = function() {
  var msg = new mbi.ui.feed.Message('Publish');
  mbi.ui.feed.feed.add(msg);
  var opt = {
    assess_domain: mbi.app.base.DOMAIN_ASSESS,
    is_raw: !COMPILED,
    version: mbi.app.base.VERSION,
    rows: this.getRows(true)
  };
  var html = templ.mbi.web.html.figureList(opt);
  var bk = mbi.app.shared.getBucket(mbi.app.base.BUCKET_SITE);
  msg.status('uploading...');
  return bk.upload(html, 'figure-list.html').addCallback(function(name) {
    var url = 'http://' + mbi.app.base.BUCKET_SITE + '/' + name;
    msg.link(url, 'view');
    msg.done('');
  }, this);
};


/**
 * @param {boolean} value
 */
mbi.fig.List.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);
};


/**
 * @inheritDoc
 */
mbi.fig.List.prototype.toString = function() {
  return 'FigureList';
};


