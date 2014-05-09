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
 * @fileoverview Image base navigation.
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */



goog.provide('mbi.ui.SiteMapPage');
goog.require('goog.style');
goog.require('goog.ui.tree.TreeControl');
goog.require('mbi.app.shared');
goog.require('mbi.ui.FunctionInfoBox');
goog.require('mbi.ui.IVisible');
goog.require('mbi.ui.SiteMapDisplay');
goog.require('ydn.client.HttpRequestData');



/**
 * @param {mbi.data.Redirect} redirect
 * @param {boolean=} opt_is_admin
 * @constructor
 * @implements {mbi.ui.IVisible}
 */
mbi.ui.SiteMapPage = function(redirect, opt_is_admin) {
  /**
   * @protected
   * @type {mbi.data.Redirect}
   */
  this.redirect = redirect;
  /**
   * @protected
   * @type {number}
   */
  this.is_admin_app = opt_is_admin ? 1 : 0;
  /**
   * @protected
   * @type {Element}
   */
  this.root = null;
  this.renderred_ = false;
  /**
   * @type {mbi.ui.SiteMapDisplay}
   * @private
   */
  this.sitemap_tree_ = new mbi.ui.SiteMapDisplay();
  /**
   * @protected
   * @type {mbi.data.SiteMap}
   */
  this.site_map = null;
  /**
   * @final
   * @type {mbi.ui.FunctionInfoBox}
   */
  this.module_info = new mbi.ui.FunctionInfoBox(opt_is_admin);
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SiteMapPage.prototype.updateRedirect = function(e) {
  this.redirect.dump();
};


/**
 * @param {Element} ele
 */
mbi.ui.SiteMapPage.prototype.init = function(ele) {
  this.root = ele;
  if (this.root) {
    goog.soy.renderElement(this.root, templ.mbi.app.adminapp.siteMapPage);
    var btn = this.root.querySelector('button[name=update]');
    goog.events.listen(btn, 'click', this.updateSiteData, true, this);
    var btn_modules = this.root.querySelector('button[name=module]');
    goog.events.listen(btn_modules, 'click', this.updateModuleMatrix, true, this);
    var btn_redirect = this.root.querySelector('button[name=redirect]');
    goog.events.listen(btn_redirect, 'click', this.updateRedirect, true, this);
    var upload = this.root.querySelector('button[name=sitemap]');
    goog.events.listen(upload, 'click', this.uploadSiteMap, true, this);
  }
};


/**
 * Update sitemap data.
 * @param {number=} opt_force
 */
mbi.ui.SiteMapPage.prototype.updateSitemapModel = function(opt_force) {

  var dfs = [];
  dfs.push(mbi.app.shared.getTopicSiteMap(opt_force));
  dfs.push(mbi.app.shared.getModuleSiteMap(opt_force));
  dfs.push(mbi.app.shared.getHelpSiteMap(opt_force));
  var df = new goog.async.DeferredList(dfs);
  df.addCallback(function(res) {
    this.site_map = new mbi.data.SiteMap('/', 'MBInfo');
    for (var i = 0; i < res.length; i++) {
      if (!res[i][0]) {
        continue;
      }
      this.site_map.add(res[i][1]);
    }
    this.sitemap_tree_.setModel(this.site_map);
  }, this);

};


/**
 * @param {boolean} value
 */
mbi.ui.SiteMapPage.prototype.setVisible = function(value) {
  if (!this.root) {
    return;
  }
  goog.style.setElementShown(this.root, value);
  if (!this.renderred_) {

    var div_tree = this.root.querySelector('div[name=sitemap-tree]');

    this.sitemap_tree_.init(div_tree);
    this.updateSitemapModel(this.is_admin_app);

    this.renderred_ = true;

  }
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SiteMapPage.prototype.uploadSiteMap = function(e) {
  var a = e.target;
  a.setAttribute('disabled', '1');
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
  /**
   * @this {mbi.ui.SiteMapPage}
   * @param {mbi.data.SiteMap} sitemap
   * @param {string} url
   */
  var upload = function(sitemap, url) {
    var json = /** @type {!Object} */ (sitemap.toJSON());
    var headers = {
      'content-type': 'application/json'
    };
    var body = JSON.stringify(json);
    var hd = new ydn.client.HttpRequestData(url, 'PUT', null, headers, body);
    client.request(hd).execute(function(json, raw) {
      if (raw.isSuccess()) {
        mbi.app.shared.setStatus('uploaded to ' + url);
      }
    });
    mbi.data.storage.getStorage().put(mbi.app.base.STORE_NAME_DATA, json, url);
    this.updateSitemapModel(0); // already updated.

  };

  var dfs = [];
  dfs.push(mbi.app.shared.getModuleSiteMap(2).addCallback(function(map) {
    upload.call(this, map, mbi.app.base.SITEMAP_MODULE_URL);
    return map;
  }, this));
  dfs.push(mbi.app.shared.getTopicSiteMap(2).addCallback(function(map) {
    upload.call(this, map, mbi.app.base.SITEMAP_TOPIC_URL);
    return map;
  }, this));
  dfs.push(mbi.app.shared.getHelpSiteMap(2).addCallback(function(map) {
    upload.call(this, map, mbi.app.base.SITEMAP_HELP_URL);
    return map;
  }, this));
  dfs.push(mbi.app.shared.getHomeSiteMap().addCallback(function(map) {
    upload.call(this, map, mbi.app.base.SITEMAP_HOME_URL);
    return map;
  }, this));
  new goog.async.DeferredList(dfs).addCallback(function(res) {
    var sitemap = this.site_map.toXml('http://' + mbi.app.base.SITE_DOMAIN);
    // window.console.log(sitemap);
    var name = 'sitemaps.xml';
    var headers = {
      'content-type': 'application/xml'
    };
    var bk = mbi.app.shared.getBucket(mbi.app.base.BUCKET_SITE);
    bk.upload(sitemap, name, headers).addCallback(function(url) {
      mbi.app.shared.setStatus('uploaded to ' + bk.url(url));
    });
    a.removeAttribute('disabled');
  }, this);
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SiteMapPage.prototype.updateModuleMatrix = function(e) {
  this.module_info.update(e);
};


/**
 * @protected
 * @param {Event} e
 */
mbi.ui.SiteMapPage.prototype.updateSiteData = function(e) {
  var uri = 'https://sites.google.com/feeds/content/' + mbi.app.base.TOPIC_DOMAIN_NAME +
      '/' + mbi.app.base.TOPIC_SITE_NAME + '?alt=json&kind=webpage';
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
  var cnt = 0;
  var db = mbi.data.storage.getStorage();
  var op = db.getCoreOperator();
  var msg_span = this.root.querySelector('span[name=message]');
  msg_span.textContent = '.';
  var ids = [];

  // 'fields': 'entry(@gd:etag,id)'
  // Fields query parameter is not supported
  var load = function(uri) {
    var hd = new ydn.client.HttpRequestData(uri);
    client.request(hd).execute(function(json, raw) {
      if (json && json['feed'] && json['feed']['entry']) {
        var feed = json['feed'];
        var entries = /** @type {Array.<!GDataEntry>} */ (feed['entry']);
        if (entries.length > 0) {
          cnt += entries.length;
          msg_span.textContent = cnt + ' .';
          for (var i = 0; i < entries.length; i++) {
            var entry = new ydn.gdata.Entry(entries[i]);
            ids.push(entry.getId());
          }
          op.dumpInternal(mbi.app.base.TOPIC_SITE_NAME, entries).addCallback(function() {
            msg_span.textContent += '.';
            var next = new ydn.gdata.Entry(feed).getLink(ydn.atom.Link.Rel.NEXT);
            if (next) {
              load.call(this, next.href);
            } else {
              msg_span.textContent = cnt + ' entries updated, checking old pages...';
              var iter = new ydn.db.ValueIterator(mbi.app.base.TOPIC_SITE_NAME);
              var del_cnt = 0;
              var req = db.open(function(cursor) {
                if (ids.indexOf(cursor.getKey()) == -1) {
                  del_cnt++;
                  cursor.clear();
                }
              }, iter, ydn.db.base.TransactionMode.READ_WRITE);
              req.addBoth(function() {
                msg_span.textContent += del_cnt + ' deleted.';
                this.updateSitemapModel(2);
                msg_span.textContent += 'Done.';
              }, this);
            }
          }, this);
          // console.log(json.feed);
        } else {
          msg_span.textContent = cnt + ' entries. Done.';
        }
      }
    }, this);
  };
  load.call(this, uri);
};


/**
 * @inheritDoc
 */
mbi.ui.SiteMapPage.prototype.toString = function() {
  return 'SiteMapPage';
};
