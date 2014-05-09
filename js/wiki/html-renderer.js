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
 * @fileoverview Render HTML content of wiki content.
 *
 * Render wiki content into iFrame or given document and publish into HTML.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.wiki.HtmlRenderer');
goog.require('mbi.wiki.UpdatedEvent');
goog.require('ydn.gdata.site.Page');
goog.require('ydn.gdata.site.utils');



/**
 * Wiki content processor.
 * @constructor
 * @struct
 */
mbi.wiki.HtmlRenderer = function() {
  /**
   * For background rendering.
   * @protected
   * @type {Document}
   */
  this.doc = null;
  /**
   * @protected
   * @final
   * @type {mbi.wiki.Renderer}
   */
  this.renderer = new mbi.wiki.Renderer();
  /**
   * @protected
   * @type {mbi.ui.Breadcrumb}
   */
  this.breadcrumb = new mbi.ui.Breadcrumb();
};


/**
 * @define {boolean} debug flag.
 */
mbi.wiki.HtmlRenderer.DEBUG = false;


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.wiki.HtmlRenderer.prototype.logger =
    goog.log.getLogger('mbi.wiki.HtmlRenderer');


/**
 * Note: debug use.
 * @param {string} url
 * @private
 */
mbi.wiki.HtmlRenderer.deletePageByUrl_ = function(url) {
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
 * @const
 * @type {boolean}
 */
mbi.wiki.HtmlRenderer.USE_GAPI = false;


/**
 * @protected
 * @param {string} path
 * @param {string} html
 * @param {function(this: T, string)=} opt_cb callback after
 * publish. The uploaded url is return in the callback.
 * @param {T=} opt_scope scope.
 * @template T
 */
mbi.wiki.HtmlRenderer.prototype.upload = function(path, html, opt_cb,
                                                  opt_scope) {
  var bucket = mbi.app.base.BUCKET_SITE;
  // https://developers.google.com/storage/docs/reference-uris
  // FIXME https does not work for www.mechanobio.info bucket
  // since domains signed by SSL and request domain are different.
  // However at least, access token is time bound and carry over header and
  // the webapp is used only by mechanobio.info reviewers, the security
  // vulnerability is limited. However, using the app on public wifi
  // post vulnerable.
  // There are three solutions. The best is using none-domain bucket and deliver
  // through CDN. Another good option is using JSON API.
  // https://developers.google.com/storage/docs/json_api/v1/objects/insert
  // Currently the client library is not working.
  // An expensive solution will be server side proxying.
  var me = this;
  var is_raw = !COMPILED;
  var cache_control = is_raw ?
      'public, max-age=0, no-cache' : 'public, max-age=3600';
  var protocol = bucket.indexOf('.') == -1 ? 'https' : 'http';
  var name = path.replace(/^\//, ''); // remove path separator /
  var url = protocol + '://' + bucket + '.storage.googleapis.com/' + name;
  if (mbi.wiki.HtmlRenderer.USE_GAPI) {
    var params = {
      'bucket': bucket,
      'object': name,
      // for bug http://stackoverflow.com/questions/18440052
      'projection': 'full',
      // body included as 'resource' param
      'resource': {
        'media': {
          'cacheControl': cache_control,
          'contentType': 'text/html',
          'data': html
        }
      }
    };
    // NOTE: the client library must be load first. It is done in GAPI auth
    // module.
    var req = gapi.client.rpcRequest('storage.objects.update',
        mbi.app.base.GAPI_STORAGE_VERSION,
        params);
    req.execute(function(json, raw) {
      window.console.log(json, raw);
      if (opt_cb) {
        opt_cb.call(opt_scope, url);
      }
    });
  } else {
    var xm = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
    var headers = {
      'Content-Type': 'text/html',
      'Cache-Control': cache_control
    };
    var hd = new ydn.client.HttpRequestData(url, 'PUT', null, headers, html);
    var rq = xm.request(hd);
    rq.execute(function(raw, e) {
      var xhr = /** @type {ydn.client.HttpRespondData} */ (e);
      if (xhr.getStatus() == 200) {
        // add generation query to url so that it show this update.
        var gen = xhr.getHeader('x-goog-generation');
        if (gen) {
          gen = '?generation=' + gen;
        } else {
          gen = '';
        }
        me.logger.fine('published ' + url + gen);
        if (opt_cb) {
          opt_cb.call(opt_scope, url + gen);
        }
      } else {
        me.logger.warning('publishing to ' + url + ' failed: ' +
            xhr.getStatus() + ' [' + xhr.getStatusText() + ']');
      }
    });
  }
};


/**
 * Render html content.
 * @param {HTMLDocument} pDoc document to publish.
 * @return {{html: string, url: string, title: string}} html.
 */
mbi.wiki.HtmlRenderer.prototype.renderDoc = function(pDoc) {
  var pdoc_wiki_content = pDoc.getElementById('wiki-content');
  var pdoc_article = pdoc_wiki_content.querySelector('article');
  var name = pdoc_article.getAttribute('name');
  var pdoc_h2 = goog.dom.getElementsByTagNameAndClass('h2',
      null, pdoc_article)[0];
  var title = pdoc_h2.children[0].textContent;
  var a = pdoc_h2.querySelector('a');
  var edit_url = a ? a.href : undefined;
  var doc = this.getDoc();
  // this.logger.finest('publishing ' + url);
  var canonical_url;
  var parts = ydn.gdata.site.utils.parseUrl(edit_url);
  if (parts) {
    canonical_url = new goog.Uri('http://www.mechanobio.info/')
        .setPath(parts.path).toString();
  }
  var opt = {
    show_license: true,
    assess_domain: mbi.app.base.DOMAIN_ASSESS,
    canonical_url: canonical_url,
    is_raw: !COMPILED,
    title: title,
    edit_url: edit_url,
    date: (new Date()).toUTCString()
  };
  goog.soy.renderElement(doc.documentElement, templ.mbi.web.html.innerHtml,
      opt);
  var ele_wiki = doc.getElementById('wiki-content');
  ele_wiki.innerHTML =
      pdoc_wiki_content.innerHTML;
  doc.getElementById('breadcrumb-peer').innerHTML =
      pDoc.getElementById('breadcrumb-peer').innerHTML;
  doc.getElementById('breadcrumb').innerHTML =
      pDoc.getElementById('breadcrumb').innerHTML;
  var topic_panel = doc.getElementById('topic-definition-panel');
  topic_panel.innerHTML =
      pDoc.getElementById('topic-definition-panel').innerHTML;
  if (topic_panel.textContent) {
    goog.style.setElementShown(topic_panel, true);
  }
  doc.getElementById('relevant-panel').innerHTML =
      pDoc.getElementById('relevant-panel').innerHTML;
  return {
    html: '<!DOCTYPE html>' + doc.documentElement.outerHTML,
    title: title,
    name: name,
    url: edit_url
  };
};


/**
 * Publish given document, which contain rendered wiki content into
 * static HTML site.
 * @param {HTMLDocument} pDoc document to publish.
 * @param {mbi.ui.feed.Message=} opt_msg message to display progress.
 * @return {goog.async.Deferred} callback after publish. Uploading may
 * not finished when invoke this callback.
 */
mbi.wiki.HtmlRenderer.prototype.publishDoc = function(pDoc, opt_msg) {
  var df = new goog.async.Deferred();
  var content = this.renderDoc(pDoc);
  // window.console.log(html);
  var path = content.name;
  var msg = opt_msg;
  if (!opt_msg) {
    msg = new mbi.ui.feed.Message('publishing...');
    mbi.ui.feed.feed.add(msg);
  }
  msg.status('uploading...');
  msg.link(content.url, content.title);
  this.upload(path, content.html, function(x) {
    var url = /** @type {string} */ (x);
    msg.title('published');
    msg.status('');
    var uri = new goog.Uri(url);
    uri.setScheme('http');
    msg.link(uri.toString(), 'view');
  }, this);
  df.callback();
  return df;
};


/**
 * Update document content to page.
 * @param {HTMLDocument} pDoc document to push.
 * @param {ydn.gdata.site.Page} page
 * @param {mbi.ui.feed.Message} msg message.
 */
mbi.wiki.HtmlRenderer.prototype.update = function(pDoc, page, msg) {
  msg.title('preparing to save...');
  mbi.ui.feed.feed.add(msg);
  // this.logger.finest('publishing ' + url);
  var wiki_content = pDoc.getElementById('wiki-content');
  var content = wiki_content.firstElementChild.children[1].innerHTML;
  // convert HTML to XHTML
  content = content.replace(/<br>/g, '<br />');
  var doc = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml', 'html', null);
  var body = doc.createElement('body');
  var pre = '<div xmlns="http://www.w3.org/1999/xhtml"><table cellspacing="0" ' +
      'class="sites-layout-name-one-column sites-layout-hbox"><tbody>' +
      '<tr><td class="sites-layout-tile sites-tile-name-content-1">';
  var post = '</td></tr></tbody></table></div>';
  doc.documentElement.appendChild(body);
  body.innerHTML = pre + post;
  var td = doc.documentElement.querySelectorAll('td')[0];
  var clone = wiki_content.cloneNode(true);
  doc.adoptNode(clone);
  td.appendChild(clone);
  mbi.wiki.Renderer.encodeMeta(body);
  page.setDocument(doc);
//  var ele_wiki = doc.getElementById('wiki-content');
//  // conversion
//  mbi.wiki.Renderer.encodeMeta(ele_wiki);
//  page.setDocument(doc);
//  var data = page.getData();
//  var db = mbi.data.storage.getStorage();
//  msg.title('uploading...');
//  db.put(mbi.app.base.TOPIC_SITE_NAME, data).addCallbacks(function(x) {
//    // window.console.log(x);
//    msg.title('uploaded');
//    df.callback();
//  }, function(e) {
//    msg.title('saving fail');
//    df.errback(e);
//  }, this);
};


/**
 * Publish to static HTML site.
 * @param {ydn.gdata.site.Page} page page to publish.
 * @param {!Array.<ydn.gdata.site.Page>} sub_pages
 * @param {mbi.ui.feed.Message=} opt_msg message.
 * @return {goog.async.Deferred} callback after publish. Return published url.
 * @private
 */
mbi.wiki.HtmlRenderer.prototype.publish_ = function(page, sub_pages, opt_msg) {
  var df = new goog.async.Deferred();
  var url = page.getUrl();
  var title = page.getTitle();
  var msg = opt_msg;
  if (!msg) {
    msg = new mbi.ui.feed.Message('publishing');
    mbi.ui.feed.feed.add(msg);
  }
  msg.link(url, title);
  var doc = this.getDoc();
  // this.logger.finest('publishing ' + url);
  var parts = ydn.gdata.site.utils.parseUrl(url);
  var opt = {
    show_license: true,
    assess_domain: mbi.app.base.DOMAIN_ASSESS,
    is_raw: !COMPILED,
    title: title,
    edit_url: url,
    version: mbi.app.base.VERSION,
    date: (new Date()).toUTCString()
  };
  goog.soy.renderElement(doc.documentElement, templ.mbi.web.html.innerHtml,
      opt);
  this.renderer.init(doc.getElementById('section-content'));
  var peer = doc.getElementById('breadcrumb-peer');
  this.breadcrumb.init(doc.getElementById('breadcrumb'), peer);
  var result = [];
  mbi.app.shared.site_map.walk(url, result);
  this.breadcrumb.show(result);
  msg.link(url, title);
  msg.status('rendering...');
  this.renderer.render(page, sub_pages).addCallbacks(function() {
    // this.renderer.processMeta();
    var html = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
    // window.console.log(html);
    var path = parts.path;
    msg.status('uploading...');
    this.upload(path, html, function(x) {
      var url = /** @type {string} */ (x);
      msg.title('published');
      msg.status('');
      // url = url.replace('.storage.googleapis.com', '');
      msg.link(url.replace('https:', 'http:'), title, 'view page');
      df.callback(url);
    }, this);
  }, function(e) {
    df.errback(e);
  }, this);
  return df;
};


/**
 * Publish to static HTML site.
 * @param {ydn.gdata.site.Page} page page to publish.
 * @param {mbi.ui.feed.Message=} opt_msg message.
 * @return {goog.async.Deferred} callback after publish. Return published url.
 */
mbi.wiki.HtmlRenderer.prototype.publish = function(page, opt_msg) {
  var map = mbi.app.shared.site_map.walk(page.getUrl(), []);
  if (map) {
    var db = mbi.data.storage.getStorage();
    var ids = map.getSubPageIds();
    if (ids.length == 0) {
      return this.publish_(page, [], opt_msg);
    } else {
      return db.values(page.getSiteName(), ids).addCallback(function(pg) {
        this.logger.finest('rendering ' + page + ' with ' +
            pg.length + ' subpages');
        var sub_pages = [];
        for (var i = 0; i < pg.length; i++) {
          sub_pages[i] = new ydn.gdata.site.Page(pg[i]);
        }
        return this.publish_(page, sub_pages, opt_msg);
      }, this);
    }
  } else {
    this.logger.warning('Page "' + page.getUrl() + '" not found in' +
        ' sitemap');
    return this.publish_(page, [], opt_msg);
  }
};


/**
 * Publish wiki content.
 * @param {string} url
 * @param {mbi.ui.feed.Message=} opt_msg message.
 * @return {goog.async.Deferred} Return published url.
 */
mbi.wiki.HtmlRenderer.prototype.publishByUrl = function(url, opt_msg) {
  var out = new goog.async.Deferred();
  if (!goog.string.startsWith(url, 'https:')) {
    if (url.charAt(0) != '/') {
      url = '/' + url;
    }
    url = 'https://sites.google.com/a/' + mbi.app.base.TOPIC_DOMAIN_NAME + '/' +
        mbi.app.base.TOPIC_SITE_NAME + url;
  }
  var parts = ydn.gdata.site.utils.parseUrl(url);
  if (!parts) {
    out.errback(new Error('Invalid url ' + url));
    return out;
  }
  // check for subpage
  var parents = [];
  var map = mbi.app.shared.site_map.walk(url, parents);
  if (map) {
    if (map.isSubPage()) {
      var parent = parents[parents.length - 1];
      if (parent) {
        // publish parent page, instead of subpage.
        if (parent['url']) {
          url = parent['url'];
        } else {
          this.logger.warning('parent of ' + url + ' has is invalid');
        }
      } else {
        this.logger.warning('subpage ' + url + ' has no parent page.');
      }
    }
  } else {
    this.logger.warning('page ' + url + ' not found in sitemap.');
  }
  var db = mbi.data.storage.getStorage();
  var kr = ydn.db.KeyRange.only(url);
  var df = db.values(parts.site_name, 'alternate', kr);
  df.addCallbacks(function(x) {
    var data = /** @type {PageEntry} */ (x[0]);
    if (data) {
      // console.log('publishing ' + url);
      var page = new ydn.gdata.site.Page(data);
      this.publish(page, opt_msg).addCallbacks(function(s) {
        out.callback(s);
      }, function(e) {
        out.errback(e);
      }, this);
    } else {
      var msg = 'Not found page url: ' + url;
      out.errback(new Error(msg));
      this.logger.warning(msg);
    }
  }, function(e) {
    out.errback(e);
  }, this);
  return out;
};


/**
 * Publish all page to static web site.
 * This is only exported to command line use only.
 * @param {number=} opt_offset offset.
 * @private
 */
mbi.wiki.HtmlRenderer.prototype.publishAll_ = function(opt_offset) {
  var msg = new mbi.ui.feed.Message('publish all starting');
  mbi.ui.feed.feed.add(msg);
  var db = mbi.data.storage.getStorage();
  var limit = 5;
  var offset = opt_offset || 0;
  var krq = db.keys(mbi.app.base.TOPIC_SITE_NAME, null, limit, offset);
  krq.addCallbacks(function(keys) {
    var n = keys.length;
    msg.status(n + ' pages to be process.');
    /**
     * @this {mbi.wiki.HtmlRenderer}
     * @param {number} i
     */
    var publish = function(i) {
      if (mbi.wiki.HtmlRenderer.DEBUG && i > 3) {
        window.console.log('publishing tested');
        return;
      }
      if (i == limit) {
        this.publishAll_(i + offset); // continue publishing next
      }
      if (!keys[i]) {
        return;
      }
      var fm = offset ? ' from ' + offset : '';
      msg.status('publishing ' + i + ' of ' + n + fm);
      var req = db.get(mbi.app.base.TOPIC_SITE_NAME, keys[i]);
      req.addCallbacks(function(data) {
        goog.asserts.assertObject(data, keys[i]);
        var page = new ydn.gdata.site.Page(/** @type {!PageEntry} */ (data));
        this.publish(page, msg).addCallbacks(function(x) {
          publish.call(this, ++i);
        }, function(e) {
          throw e;
        }, this);
      }, function(e) {
        throw e;
      }, this);
    };
    publish.call(this, 0);
  }, function(e) {
    throw e;
  }, this);
};


/**
 * Publish all page to static web site starting from given parent id.
 * This is only exported to command line use only.
 * @param {string} parent_id parent id or relative path.
 * @param {mbi.ui.feed.Message=} opt_msg
 * @return {goog.async.Deferred}
 */
mbi.wiki.HtmlRenderer.prototype.publishAllByParent = function(
    parent_id, opt_msg) {
  var msg = opt_msg || new mbi.ui.feed.Message('publish');
  if (!opt_msg) {
    mbi.ui.feed.feed.add(msg);
  }
  var df = new goog.async.Deferred();
  if (!goog.string.startsWith(parent_id, 'https:')) {
    mbi.data.site.getByPath(parent_id, function(page) {
      this.publishAllByParent(page['id']['$t']).chainDeferred(df);
    }, this);
    return df;
  }
  msg.status(parent_id);
  var db = mbi.data.storage.getStorage();
  db.get(mbi.app.base.TOPIC_SITE_NAME, parent_id).addCallbacks(function(data) {
    if (data) {
      var page = new ydn.gdata.site.Page(data);
      if (mbi.data.SiteMap.isSubPage(page.getName())) {
        // sub page do not need to be rendered.
        df.callback();
        return;
      }
      this.publish(page, msg).addCallbacks(function(x) {
        // continue publishing children.
        var kr = ydn.db.KeyRange.only(parent_id);
        var krq = db.keys(mbi.app.base.TOPIC_SITE_NAME, 'sites$parent', kr);
        krq.addCallbacks(function(keys) {
          var publish = function(i) {
            if (!keys[i]) {
              df.callback();
            } else {
              this.publishAllByParent(keys[i], msg).addCallbacks(function() {
                publish.call(this, ++i);
              }, function(e) {
                throw e;
              }, this);
            }
          };
          publish.call(this, 0);
        }, function(e) {
          df.errback(e);
        }, this);
      }, function(e) {
        df.errback(e);
      }, this);
    }
  }, function(e) {
    df.errback(e);
  }, this);
  return df;
};


/**
 * @return {Document} get a clean document.
 */
mbi.wiki.HtmlRenderer.prototype.getDoc = function() {
  if (!this.doc) {
    var iFrame = document.createElement(goog.dom.TagName.IFRAME);
    // to prevent security error, give full path.
    var uri = new goog.Uri(window.location.href);
    uri.setPath('empty.html');
    uri.setFragment('');
    iFrame.setAttribute('src', uri.toString());
    // iFrame.style.width = '5px'; // like Google iframe, 5px.
    // iFrame.style.height = '5px';
    iFrame.style.display = 'none';
    document.body.appendChild(iFrame);
    this.doc = iFrame['contentDocument'];
  }
  return this.doc;
};


/**
 * Normalize HTML.
 * @param {ydn.gdata.site.Page} page page to normalize.
 * @return {boolean} true if changed.
 */
mbi.wiki.HtmlRenderer.prototype.normalize = function(page) {
  var doc = page.getDocument();
  // window.console.log(doc);
  var msg = new mbi.ui.feed.Message('Normalizing...');
  msg.link('#page/' + page.getName(), page.getTitle());
  mbi.ui.feed.feed.add(msg);
  var changed = mbi.wiki.utils.cleanHTML(doc.documentElement);
  if (changed) {
    page.setDocument(doc);
  } else {
    msg.status('[no change]');
  }
  msg.title('Normalized');
  return changed;
};


/**
 * Normalize HTML.
 * @param {ydn.gdata.site.Page} page page to normalize.
 * @return {boolean} true if changed.
 */
mbi.wiki.HtmlRenderer.prototype.migrate = function(page) {
  var doc = page.getDocument();
  // window.console.log(doc);
  var msg = new mbi.ui.feed.Message('Migrating...');
  msg.link('#page/' + page.getName(), page.getTitle());
  mbi.ui.feed.feed.add(msg);
  this.logger.finer('Migrating... ' + page.getUrl());
  var changed = mbi.wiki.utils.migrateCitationAFormat(doc.documentElement);
  if (changed) {
    page.setDocument(doc);
    var gdata_client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
    page.setClient(gdata_client);
    page.commit();
    this.logger.finer('migrated');
  } else {
    msg.status('[no change]');
    this.logger.finer('[no change]');
  }
  msg.title('Migrated');
  return changed;
};


/**
 * Publish wiki content.
 * <pre>
 *
 s = prompt();
 ss = s.split('\n');
 xp = app.exports();
 var mig = function(i) {
  if (ss[i]) {
    xp.processor.migrateByUrl(ss[i].trim())
    setTimeout(function() {
      i++;
      if (i < ss.length) {
        mig(i);
      }
    }, 100)
  }
}
 mig(0);
 * </pre>
 * @param {string} url
 * @param {mbi.ui.feed.Message=} opt_msg message.
 * @return {goog.async.Deferred} Return true if migrated, false if not necessary.
 */
mbi.wiki.HtmlRenderer.prototype.migrateByUrl = function(url, opt_msg) {
  var out = new goog.async.Deferred();
  if (!goog.string.startsWith(url, 'https:')) {
    if (url.charAt(0) != '/') {
      url = '/' + url;
    }
    url = 'https://sites.google.com/a/' + mbi.app.base.TOPIC_DOMAIN_NAME + '/' +
        mbi.app.base.TOPIC_SITE_NAME + url;
  }
  var parts = ydn.gdata.site.utils.parseUrl(url);
  if (!parts) {
    out.errback(new Error('Invalid url ' + url));
    return out;
  }
  // check for subpage

  var db = mbi.data.storage.getStorage();
  var kr = ydn.db.KeyRange.only(url);
  var df = db.values(parts.site_name, 'alternate', kr);
  df.addCallbacks(function(x) {
    var data = /** @type {PageEntry} */ (x[0]);
    if (data) {
      // console.log('publishing ' + url);
      var page = new ydn.gdata.site.Page(data);
      var conv = this.migrate(page);
      out.callback(conv);
    } else {
      var msg = 'Not found page url: ' + url;
      out.errback(new Error(msg));
      this.logger.warning(msg);
    }
  }, function(e) {
    out.errback(e);
  }, this);
  return out;
};


/**
 * Normalize HTML.
 * @param {ydn.gdata.site.Page} page
 */
mbi.wiki.HtmlRenderer.prototype.processMeta = function(page) {

};
