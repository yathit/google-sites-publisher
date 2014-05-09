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
 * @fileoverview Wiki content editor.
 *
 * Provide UI components to edit wiki content.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.wiki.Editor');
goog.require('mbi.data.storage');
goog.require('mbi.ui.IVisible');
goog.require('mbi.wiki.HtmlRenderer');
goog.require('mbi.wiki.Renderer');
goog.require('templ.mbi.app.adminapp');
goog.require('templ.mbi.web.html');



/**
 * Wiki content processor.
 * @param {!mbi.gadget.ProteinInfobox} protein_infobox
 * @param {mbi.wiki.HtmlRenderer} processor wiki processor.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 * @implements {mbi.ui.IVisible}
 * @struct
 */
mbi.wiki.Editor = function(protein_infobox, processor) {
  goog.base(this);
  /**
   * @type {Element}
   * @private
   */
  this.ele_toolbar_ = null;
  /**
   * @final
   * @type {mbi.wiki.Renderer}
   */
  this.renderer = new mbi.wiki.Renderer(protein_infobox, true);
  /**
   * @protected
   * @type {mbi.wiki.HtmlRenderer}
   */
  this.processor = processor;
  /**
   * @type {Element}
   * @protected
   */
  this.root;

};
goog.inherits(mbi.wiki.Editor, goog.events.EventTarget);


/**
 * @define {boolean} debug flag
 */
mbi.wiki.Editor.DEBUG = false;


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.wiki.Editor.prototype.logger =
    goog.log.getLogger('mbi.wiki.Editor');


/**
 * Init UI.
 * @param {Element} ele_content
 */
mbi.wiki.Editor.prototype.init = function(ele_content) {
  this.root = ele_content;
  this.renderer.init(ele_content);
  // render toolbar
  this.ele_toolbar_ = document.getElementById('wiki-edit-toolbar');
  var buttons = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.BUTTON,
      null, this.ele_toolbar_);
  goog.events.listen(buttons[0], goog.events.EventType.CLICK, function(e) {
    this.normalize();
  }, false, this);
  goog.events.listen(buttons[1], goog.events.EventType.CLICK, function(e) {
    this.render();
  }, false, this);
  goog.events.listen(buttons[2], goog.events.EventType.CLICK, function(e) {
    this.publish();
  }, false, this);
  goog.events.listen(buttons[3], goog.events.EventType.CLICK, function(e) {
    this.save();
  }, false, this);
};


/**
 * Note: debug use.
 * @param {string} url
 * @private
 */
mbi.wiki.Editor.deletePageByUrl_ = function(url) {
  var db = mbi.data.storage.getStorage();
  var kr = ydn.db.KeyRange.only(url);
  db.values(mbi.app.base.TOPIC_SITE_NAME, 'alternate', kr).addCallback(
      function(x) {
        window.console.log(x);
        if (x[0]) {
          db.remove(mbi.app.base.TOPIC_SITE_NAME, x[0].id.$t).addCallback(
              function(x) {
                window.console.log(x);
              });
        }
      }
  );
};


/**
 * Normalize HTML.
 */
mbi.wiki.Editor.prototype.publish = function() {
  this.processor.publishDoc(document);
};


/**
 * Normalize HTML.
 */
mbi.wiki.Editor.prototype.render = function() {
  var rendered = this.processor.renderDoc(document);
  // console.log(rendered);
  mbi.wiki.utils.renderInWindow(rendered.html, rendered.title);
};


/**
 * @inheritDoc
 */
mbi.wiki.Editor.prototype.toString = function() {
  return 'Editor{' + this.renderer + '}';
};


/**
 * Normalize HTML.
 */
mbi.wiki.Editor.prototype.normalize = function() {
  var page = this.renderer.getPage();
  var has_changed = this.processor.normalize(page);
  if (has_changed) {
    var db = mbi.data.storage.getStorage();
    var data = page.getData();
    db.put(mbi.app.base.TOPIC_SITE_NAME, data).addCallbacks(function(x) {
      this.reload();
      // window.console.log(x);
    }, function(e) {
      throw e;
    }, this);
    var event = new mbi.wiki.UpdatedEvent(page, this);
    this.dispatchEvent(event);
    // console.log(page.getHtmlContent())
    // console.log(page.getDocument())
  }
};


/**
 * Migrate to new format.
 */
mbi.wiki.Editor.prototype.migrate = function() {
  var page = this.renderer.getPage();
  var has_changed = this.processor.migrate(page);
  if (has_changed) {
    var db = mbi.data.storage.getStorage();
    var data = page.getData();
    db.put(mbi.app.base.TOPIC_SITE_NAME, data).addCallbacks(function(x) {
      window.console.log(x);
    }, function(e) {
      throw e;
    }, this);
    var event = new mbi.wiki.UpdatedEvent(page, this);
    this.dispatchEvent(event);
  }
};


/**
 * Migrate all page to new format.
 */
mbi.wiki.Editor.prototype.migrateAll = function() {
  var db = mbi.data.storage.getStorage();
  var pro = this.processor;
  var logger = this.logger;
  var migrate = function(entries, i) {
    logger.info('migrating ' + i + ' of ' + entries.length);
    if (i < entries.length) {
      var page = new ydn.gdata.site.Page(entries[i]);
      var has_changed = pro.migrate(page);
      i++;
      if (has_changed) {
        var data = page.getData();
        db.put(mbi.app.base.TOPIC_SITE_NAME, data).addCallbacks(function(x) {
          logger.info('migrated ', x.id);
          migrate(entries, i);
        }, function(e) {
          throw e;
        });
      } else {
        migrate(entries, i);
      }
    }
  };
  var n = mbi.wiki.Editor.DEBUG ? 5 : 1000;
  db.values(mbi.app.base.TOPIC_SITE_NAME, null, n).addCallback(function(entries) {
    migrate(entries, 0);
  }, this);
};


/**
 * Save content to Google site.
 */
mbi.wiki.Editor.prototype.save = function() {
  var page = this.renderer.getPage();
  var msg = new mbi.ui.feed.Message('saving...');
  var url = page.getUrl();
  msg.link(url, page.getTitle());
  this.processor.update(document, page, msg);
  var db = mbi.data.storage.getStorage();
  var data = page.getData();
  // window.console.log(data);
  msg.title('uploading...');
  db.put(mbi.app.base.TOPIC_SITE_NAME, data).addCallbacks(function(x) {
    // window.console.log(x);
    msg.title('saved');
    var event = new mbi.wiki.UpdatedEvent(page, this);
    this.dispatchEvent(event);
  }, function(e) {
    msg.title('failed to upload');
    throw e;
  }, this);
};


/**
 * Render wiki page.
 * @param {string} url absolute URL of the wiki page.
 * @return {goog.async.Deferred} invoke after rendered.
 */
mbi.wiki.Editor.prototype.renderUrl = function(url) {
  var parts = ydn.gdata.site.utils.parseUrl(url);
  if (parts) {
    var db = mbi.data.storage.getStorage();
    var kr = ydn.db.KeyRange.only(url);
    var req = db.keys(parts.site_name, 'alternate', kr);
    return req.addCallbacks(function(x) {
      if (x[0]) {
        return this.renderById(parts.site_name, x[0]);
      } else {

      }
    }, function(e) {
      throw e;
    }, this);
  } else {
    this.logger.warning('Invalid page url: ' + url);
    return goog.async.Deferred.fail(new Error('Invalid page url: ' + url));
  }
};


/**
 * Render a given path.
 * @param {string} site_name site name.
 * @param {string} page_id if not found, Not Found page is render.
 * @return {goog.async.Deferred} invoke after rendered.
 */
mbi.wiki.Editor.prototype.renderById = function(site_name, page_id) {

  var db = mbi.data.storage.getStorage();
  var subpages;
  var req = mbi.data.storage.getStorage().get(site_name, page_id);
  /**
   * @this {mbi.wiki.Editor}
   * @param {ydn.gdata.site.Page} page
   * @return {goog.async.Deferred}
   */
  var render = function(page) {
    var index_parent = 'sites$parent';
    var kr = ydn.db.KeyRange.only(page.getId());
    return db.values(site_name, index_parent, kr).addCallback(function(pg) {
      this.logger.finest('rendering ' + page + ' with ' +
          pg.length + ' subpages');
      var subpages = pg.map(function(p) {
        return new ydn.gdata.site.Page(p);
      });
      subpages = subpages.filter(function(p) {
        return mbi.data.SiteMap.isSubPage(p.getName());
      });
      subpages.sort(function(a, b) {
        return a.getName() > b.getName() ? 1 : -1;
      });
      return this.renderer.render(page, subpages);
    }, this);
  };
  req.addProgback(function(p) {
    if (p) {
      p['_rendered'] = true;
      var page = new ydn.gdata.site.Page(p);
      render.call(this, page);
    }
  }, this);
  return req.addCallback(function(data) {
    if (data) {
      if (!data['_rendered']) {
        this.logger.finer('Rendering again for page content changes');
        var page = new ydn.gdata.site.Page(data);
        return render.call(this, page);
      }
    } else {
      var msg = 'Not found page id: ' + page_id;
      this.logger.warning(msg);
      mbi.app.shared.setStatus('Page not found.', page_id);
    }
  }, this);
};


/**
 * Reload the page.
 */
mbi.wiki.Editor.prototype.reload = function() {
  var page = this.renderer.getPage();
  this.renderById(page.getSiteName(), page.getId());
};


/**
 * @param {boolean} value
 */
mbi.wiki.Editor.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);
};
