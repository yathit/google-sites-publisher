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
 * @fileoverview A copyrighted figure page.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.fig.Page');
goog.require('goog.Uri');
goog.require('goog.string');
goog.require('goog.style');
goog.require('mbi.ui.IVisible');
goog.require('templ.mbi.fig');



/**
 * A copyrighted figure page.
 * @param {mbi.data.Bucket} bucket figure bucket.
 * @param {boolean} editable editable page.
 * @constructor
 * @implements {mbi.ui.IVisible}
 * @struct
 */
mbi.fig.Page = function(bucket, editable) {
  /**
   * @protected
   * @type {Element}
   */
  this.root = null;
  /**
   * @protected
   * @type {Element}
   */
  this.content = null;
  /**
   * @final
   * @type {mbi.data.Bucket}
   */
  this.bucket = bucket;
  /**
   * Figure object name on the bucket.
   * @type {string}
   */
  this.name = '';
  /**
   * @final
   * @type {boolean}
   */
  this.editable = editable;
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.fig.Page.prototype.logger =
    goog.log.getLogger('mbi.fig.Page');


/**
 * @param {Element} ele
 */
mbi.fig.Page.prototype.init = function(ele) {
  this.root = ele;
  goog.soy.renderElement(this.root, templ.mbi.fig.editFigure);
  this.content = goog.dom.getElementByClass('copyrighted-figure', this.root);
  var buttons = goog.dom.getElementsByTagNameAndClass('button', null,
      this.root);
  goog.events.listen(buttons[0], 'click', this.handleDelete, true, this);
  goog.events.listen(buttons[1], 'click', this.handleSave, true, this);
  var input = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.INPUT,
      null, ele)[0];
  goog.events.listen(input, goog.events.EventType.CHANGE,
      this.handleUploaded, false, this);
};


/**
 * Collect meta data from the UI values.
 * @return {mbi.data.Object}
 * @protected
 */
mbi.fig.Page.prototype.collect = function() {
  var obj = this.bucket.getByName(this.name);
  if (obj) {
    var tds = goog.dom.getElementsByTagNameAndClass('td', null, this.content);
    for (var i = tds.length - 1; i >= 0; --i) {
      var name = tds[i].getAttribute('name');
      if (name && ['title', 'name', 'description', 'created', 'author',
        'license'].indexOf(name) >= 0) {
        obj.setMeta(name, goog.string.trim(tds[i].textContent));
      }
    }
    return obj;
  } else {
    return null;
  }
};


/**
 * @param {mbi.data.Bucket.ObjectEvent} e
 */
mbi.fig.Page.prototype.handleUploaded = function(e) {
  // after uploaded, meta data need to update.
  var file = e.target.files[0];
  if (file) {
    this.bucket.upload(file, this.name).addCallback(function() {
      this.update(true);
    }, this);
  } else {
    this.logger.info('no file selected');
  }
};


/**
 * @param {Event} e
 */
mbi.fig.Page.prototype.handleDelete = function(e) {
  var obj = this.collect();
  if (obj) {
    this.bucket.delete(obj).addCallbacks(function() {
      var bk = mbi.app.shared.getBucket(mbi.app.base.BUCKET_SITE);
      var name = obj.getName() + '.html';
      var html_obj = bk.getByName(name);
      if (html_obj) {
        bk.delete(html_obj);
      }
      window.location.hash = '#figure-list';
    }, function(e) {
      mbi.ui.feed.feed.add(new mbi.ui.feed.Message('Deleting ' + this.name +
          ' failed, ' + e));
    }, this);
  }
};


/**
 * Create copyrighted figure page and put to the static html bucket.
 * @param {mbi.data.Object} obj figure object.
 * @return {goog.async.Deferred} return name of object.
 */
mbi.fig.Page.putCopyrightedFigurePage = function(obj) {
  // mbi.app.shared.figure_bucket_.get(2)
  // app.figure_list.putCopyrightedFigurePage(obj)

  var options = mbi.fig.Page.getFigureOptions_(obj, false);

  var html = templ.mbi.web.html.figure(options);
  // window.console.log(html);
  // mbi.wiki.utils.renderInWindow(html);
  var bk = mbi.app.shared.getBucket(mbi.app.base.BUCKET_SITE);
  var name = obj.getName() + '.html';
  return bk.upload(html, name);
};


/**
 * @param {Event} e
 */
mbi.fig.Page.prototype.handleSave = function(e) {
  var msg = new mbi.ui.feed.Message('Save figure');
  mbi.ui.feed.feed.add(msg);
  var obj = this.collect();
  if (obj) {
    // window.console.log(obj);
    this.bucket.patch(obj).addCallbacks(function(x) {
      msg.status('patched');
    }, function(e) {
      msg.status('patch failed');
    });
    mbi.fig.Page.putCopyrightedFigurePage(obj).addCallbacks(function(name) {
      var url = new goog.Uri('http://' + mbi.app.base.BUCKET_SITE);
      url.setPath(name);
      msg.link(url.toString(), 'view');
    }, function(e) {
      msg.status('fail to update figure page');
    });
  } else {
    this.logger.warning('object not found');
    msg.done('object not found');
  }
};


/**
 * Apply mark to the figure.
 * @param {boolean=} opt_cc CC
 */
mbi.fig.Page.applyWaterMark = function(opt_cc) {
  var h = 30;
  var cf = goog.dom.getElementByClass('copyrighted-figure');
  if (!cf) {
    mbi.app.shared.logger.severe('copyrighted-figure element not found.');
    return;
  }
  var img = cf.querySelector('img');
  if (!img) {
    mbi.app.shared.logger.severe('IMG element not found.');
    return;
  }
  var canvas = document.createElement('canvas');
  var img_w = img.width;
  var img_h = img.height;
  var n_w = img.naturalWidth;
  var n_h = img.naturalHeight;
  var img_name = new goog.Uri(img.src).getPath().replace('/figure/', '');
  canvas.width = n_w;
  canvas.height = n_h + h;
  canvas.style.maxWidth = '800px';
  var a = document.createElement('a');
  a.appendChild(canvas);
  cf.insertBefore(a, img);
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  cf.removeChild(img);

  context.fillStyle = '#ffffff';
  context.fillRect(0, n_h, n_w, h);

  var year = new Date().getFullYear();
  context.fillStyle = '#163c77;';
  context.font = '14px bold Arial, sans-serif';
  context.fillText(year + ' © ' + 'MBInfo [http://www.mechanobio.info]', 30, n_h + 21);


  var img_logo = new Image();
  img_logo.onload = function() {
    context = canvas.getContext('2d');
    context.drawImage(img_logo, 8, n_h + 6);
  };
  img_logo.src = 'http://www.mechanobio.info/image/logo-19.png';

  if (opt_cc) {
    var img_cc = new Image();
    img_cc.onload = function() {
      context = canvas.getContext('2d');
      context.drawImage(img_cc, n_w - 86, n_h + 9);
    };
    img_cc.src = 'http://www.mechanobio.info/image/home/cc-by-nc.png';
  }

  a.href = '#';
  var attachDownload = function(e) {
    a.href = canvas.toDataURL('image/jpeg');
    a.setAttribute('download', img_name);
    a.removeEventListener('click', attachDownload, true);
  };
  a.addEventListener('click', attachDownload, true);
};


/**
 * @param {boolean} value
 */
mbi.fig.Page.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);
};


/**
 * Object option for rendering.
 * @param {mbi.data.Object} obj item object from the bucket.
 * @param {boolean} editable
 * @param {boolean=} opt_gen use generation number.
 * @return {Object}
 * @private
 */
mbi.fig.Page.getFigureOptions_ = function(obj, editable, opt_gen) {
  var name = obj ? obj.getName() : '';
  var d = new Date();
  // cross browser?
  var today = d.toLocaleDateString('en-US',
      {year: 'numeric', month: 'long', day: 'numeric'});
  var options = {
    assess_domain: mbi.app.base.DOMAIN_ASSESS,
    is_raw: !COMPILED,
    name: name,
    title: name,
    description: '',
    created: '',
    author: '',
    license: undefined,
    img_src: undefined,
    editable: editable,
    today: today,
    page_url: 'http://www.mechanobio.info/figure/' + name + '.html'
  };

  if (obj) {
    // obj.getUrl()
    var img_src_url = 'http://www.mechanobio.info/' + name;
    if (opt_gen) {
      img_src_url += '?generation=' + obj.getGeneration();
    }
    options.img_src = img_src_url;
    options.name = name;
    options.title = obj.getMeta('title') || '';
    options.description = obj.getMeta('description') || '';
    options.created = obj.getMeta('created') || '';
    options.author = obj.getMeta('author') || '';
    options.license = obj.getMeta('license');
  }
  return options;
};


/**
 * Render.
 * @param {boolean=} opt_gen use generation number.
 * @param {mbi.data.Object} obj item object from the bucket.
 */
mbi.fig.Page.prototype.render = function(obj, opt_gen) {
  var options = mbi.fig.Page.getFigureOptions_(obj, this.editable, opt_gen);

  goog.soy.renderElement(this.content, templ.mbi.fig.figure, options);

  var cf = goog.dom.getElementByClass('copyrighted-figure');
  var img = cf.querySelector('img');
  img.onload = function() {
    mbi.fig.Page.applyWaterMark();
  };

  // render again with full information.
  /*
  this.bucket.head(obj).addCallbacks(function(obj) {
    var options = {
      title: obj['x-goog-meta-title'] || obj['name'],
      date: obj['x-goog-meta-created'] || '',
      author: obj['x-goog-meta-author'] || '',
      license: obj['x-goog-meta-license'],
      img_src: url
    };
    goog.soy.renderElement(this.content, templ.mbi.app.figure, options);
  }, function(obj) {
    // warning
  }, this);
  */
};


/**
 * @param {boolean=} opt_gen use generation number in the image src so that
 * to point to the exact image.
 * @protected
 */
mbi.fig.Page.prototype.update = function(opt_gen) {
  this.bucket.ready().addCallbacks(function() {
    var obj = this.bucket.getByName(this.name);
    this.render(obj, opt_gen);
  }, function(e) {
    throw e;
  }, this);
};


/**
 * @param {string=} opt_target figure name.
 */
mbi.fig.Page.prototype.show = function(opt_target) {
  var name = opt_target || '';
  if (name == this.name) {
    return;
  } else {
    if (!goog.string.startsWith(name, mbi.app.base.BUCKET_FIG_PREFIX)) {
      name = mbi.app.base.BUCKET_FIG_PREFIX + name;
    }
    this.name = name;
  }
  if (this.name) {
    this.update();
  } else {
    goog.soy.renderElement(this.content, templ.mbi.fig.figure);
  }

};
