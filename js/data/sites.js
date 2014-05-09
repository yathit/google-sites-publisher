/**
 * @fileoverview Utilities for Google sites.
 */


goog.provide('mbi.data.site');
goog.require('mbi.data.SiteMap');
goog.require('mbi.data.storage');
goog.require('ydn.gdata.site.Page');
goog.require('ydn.gdata.site.utils');


/**
 * Build sitemap of given parent entry.
 * @param {string} site_name
 * @param {mbi.data.SiteMap} map
 * @param {boolean=} opt_non_recursive by default, site map build recursively.
 * @return {!ydn.async.Deferred}
 */
mbi.data.site.buildSiteMap = function(site_name, map, opt_non_recursive) {
  var result = new ydn.async.Deferred();
  mbi.data.storage.onStorageReady(function(db) {
    var index_path = 'alternate';
    var index_parent = 'sites$parent';
    goog.asserts.assert(map.id, 'parent id of the page missing');
    var kr = ydn.db.KeyRange.only(map.id);
    db.values(site_name, index_parent, kr).addCallbacks(
        function(x) {
          var children = /** @type {Array.<!PageEntry>} */ (x);
          var children_results = [];
          var children_map = [];
          // console.log(children.length + ' subpages in ' + map.id);
          for (var i = 0; i < children.length; i++) {
            var page = new ydn.gdata.site.Page(children[i]);
            var ch_map = new mbi.data.SiteMap(page.getUrl(),
                page.getTitle());
            ch_map.setPageName(page.getName());
            ch_map.id = page.getId();
            map.last_modified = page.getUpdated();
            map.add(ch_map);
            children_map.push(ch_map);
          }
          // df_result.notify(root_map);
          if (opt_non_recursive) {
            result.callback(map);
          } else {
            result.notify(map);
            for (var i = 0; i < children_map.length; i++) {
              children_results.push(mbi.data.site.buildSiteMap(site_name,
                  children_map[i], opt_non_recursive));
            }
            var re = new goog.async.DeferredList(children_results);
            re.addCallbacks(function() {
              result.callback(map);
            }, function(e) {
              throw e;
            });
          }
        }, function(e) {
          throw e;
        });
  });

  return result;
};


/**
 * @const
 * @type {boolean}
 */
mbi.data.site.DISABLE_ROOT_PAGE = true;


/**
 * Build sitemap of given parent entry by id.
 * @param {string} site_name
 * @param {string} id
 * @param {boolean=} opt_disable disable root link
 * @return {!goog.async.Deferred}
 */
mbi.data.site.buildSiteMapById = function(site_name, id, opt_disable) {
  var df = new goog.async.Deferred();
  mbi.app.shared.onReady.addCallback(function() {
    var db = mbi.data.storage.getStorage();
    var done = db.get(site_name, id).addCallback(function(entry) {
      if (!entry || !goog.isObject(entry)) {
        throw new Error('entry ' + id + ' not found in ' + site_name);
      }
      var page = new ydn.gdata.site.Page(entry);
      var root_url = opt_disable ? '' : page.getUrl();
      var map = new mbi.data.SiteMap(root_url, page.getTitle(), true);
      map.setPageName(page.getName());
      map.id = page.getId();
      map.last_modified = page.getUpdated();
      map.setSorted(true);
      return mbi.data.site.buildSiteMap(site_name, map);
    });
    done.chainDeferred(df);
  });
  return df;
};


/**
 * Generate sitemap data.
 * @param {string} site_name
 * @param {Array.<string>=} opt_root_nodes optional root nodes.
 * @return {!ydn.async.Deferred}
 */
mbi.data.site.getSiteMap = function(site_name, opt_root_nodes) {
  var df_result = new ydn.async.Deferred();
  /**
   * @type {mbi.data.SiteMap}
   */
  var site_map;
  var depth = 0;
  var max_depth = 2;
  var root_map = new mbi.data.SiteMap('/', 'Home', true);
  // query for parent id = 0 to get root pages.
  var base_id = 'https://sites.google.com/feeds/content/mechanobio.info/' +
      site_name + '/';
  root_map.id = base_id + '0';
  root_map.setPageName('Home');
  if (opt_root_nodes) {
    var dfs = [];
    for (var i = 0; i < opt_root_nodes.length; i++) {
      var id = base_id + opt_root_nodes[i];
      dfs[i] = mbi.data.site.buildSiteMapById(site_name, id);
    }
    var dfl = new goog.async.DeferredList(dfs);
    dfl.addCallbacks(function(maps) {
      for (var i = 0; i < maps.length; i++) {
        if (maps[i][0]) {
          var node = maps[i][1];
          goog.asserts.assertInstanceof(node, mbi.data.SiteMap);
          root_map.add(node);
        }
      }
      df_result.callback(root_map);
    }, function(e) {
      throw e;
    });
  } else {
    var req = mbi.data.site.buildSiteMap(site_name, root_map);
    req.addCallbacks(function(x) {
      df_result.callback(root_map);
    }, function(e) {
      throw e;
    });
  }

  return df_result;
};


/**
 * Get page entry by page id.
 * Note: debug use.
 * @param {string} id entry id.$t.
 * @param {function(Object)=} opt_cb callback.
 * @private
 */
mbi.data.site.get_ = function(id, opt_cb) {
  var db = mbi.data.storage.getStorage();
  var site_name = mbi.app.base.TOPIC_SITE_NAME;
  var req = db.get(site_name, id);
  req.addProgback(function(x) {
    window.console.log(x);
  });
  req.addCallbacks(function(entry) {
    if (entry) {
      if (opt_cb) {
        opt_cb(entry);
      } else {
        window.console.log(entry);
      }
    } else {
      throw new Error(id + ' not found in ' + site_name);
    }
  }, function(e) {
    throw e;
  });
};


/**
 * Get page entry by page path or full url.
 * Note: debug use.
 * Example url:
 *   "https://sites.google.com/a/mechanobio.info/mbinfo_go_2013-test-1/Home"
 * Example path:
 *   "/Home"
 * @param {string} url entry path or full url.
 * @param {function(this: T, Object)=} opt_cb callback. If not provided, it dump
 * on console.
 * @param {T=} opt_scope
 * @template T
 */
mbi.data.site.getByPath = function(url, opt_cb, opt_scope) {
  if (!goog.string.startsWith(url, 'https:')) {
    if (url.charAt(0) != '/') {
      url = '/' + url;
    }
    url = 'https://sites.google.com/a/mechanobio.info/' +
        mbi.app.base.TOPIC_SITE_NAME + url;
  }
  var db = mbi.data.storage.getStorage();
  var site_name = mbi.app.base.TOPIC_SITE_NAME;
  var kr = ydn.db.KeyRange.only(url);
  var req = db.values(site_name, 'alternate', kr);
  req.addProgback(function(x) {
    // window.console.log(x);
  });
  req.addCallbacks(function(entry) {
    if (opt_cb) {
      opt_cb.call(opt_scope, entry[0]);
    } else {
      window.console.log(entry[0]);
    }
  }, function(e) {
    throw e;
  });
};


/**
 * Make a page as root page by setting parent id to 0.
 * Note: debug use.
 * @param {string} id entry id.$t
 * eg: https://sites.google.com/feeds/content/mechanobio.info/mbinfo_go_2013/1881947260178915649.
 * @private
 */
mbi.data.site.makeRoot_ = function(id) {
  var db = mbi.data.storage.getStorage();
  var site_name = mbi.app.base.TOPIC_SITE_NAME;
  mbi.data.site.get_(id, function(entry) {
    window.console.log(entry);
    for (var i = 0; i < entry.link.length; ++i) {
      var link = entry.link[i];
      if (link.rel == 'http://schemas.google.com/sites/2008#parent') {
        throw new Error('parent already ' + link.href);
      }
    }
    var parent_id = id.replace(/\w+$/, '0');
    entry.link.push({
      href: parent_id,
      rel: 'http://schemas.google.com/sites/2008#parent',
      type: 'application/atom+xml'
    });
    db.put(site_name, entry).addCallbacks(function(x) {
      window.console.log(x);
    }, function(e) {
      throw e;
    });
  });
};
