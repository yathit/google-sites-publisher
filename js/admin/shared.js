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
 * @fileoverview Shared services.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.app.shared');
goog.require('goog.async.DeferredList');
goog.require('goog.log');
goog.require('goog.net.XhrManager');
goog.require('mbi.data.Bucket');
goog.require('mbi.data.SiteMap');
goog.require('mbi.data.site');
goog.require('mbi.ui.StatusBar');


/**
 * @type {goog.debug.Logger}
 */
mbi.app.shared.logger =
    goog.log.getLogger('mbi.app.shared');


/**
 * Site map object for wiki.
 * This value is set by mbi.app.AdminApp and used in mbi.wiki.HtmlRenderer.
 * @type {mbi.data.SiteMap}
 */
mbi.app.shared.site_map = null;


/**
 * Site map object for wiki.
 * This value is set by mbi.app.AdminApp and used in mbi.wiki.HtmlRenderer.
 * @type {mbi.data.SiteMap}
 */
mbi.app.shared.module_map = null;


/**
 * Site map object for wiki.
 * This value is set by mbi.app.AdminApp and used in mbi.wiki.HtmlRenderer.
 * @type {mbi.data.SiteMap}
 */
mbi.app.shared.help_map = null;


/**
 * Site map object for wiki.
 * This value is set by mbi.app.AdminApp and used in mbi.wiki.HtmlRenderer.
 * @type {mbi.data.SiteMap}
 */
mbi.app.shared.home_map = null;


/**
 * Site map for all.
 * This value is set by mbi.app.AdminApp and used in mbi.wiki.HtmlRenderer.
 * @type {mbi.data.SiteMap}
 */
mbi.app.shared.root_map = null;


/**
 * @type {goog.net.XhrManager}
 * @private
 */
mbi.app.shared.xhr_manager_;


/**
 * @type {goog.net.XhrManager}
 * @private
 */
mbi.app.shared.auth_xhr_manager_;


/**
 * Get default xhr manager.
 * @return {!goog.net.XhrManager}
 */
mbi.app.shared.getXhrManager = function() {
  if (!mbi.app.shared.xhr_manager_) {
    /**
     * @final
     */
    mbi.app.shared.xhr_manager_ = new goog.net.XhrManager(0);
  }
  return mbi.app.shared.xhr_manager_;
};


/**
 * @return {ydn.client.Client}
 */
mbi.app.shared.getClient = function() {
  var client = ydn.client.getClient(ydn.http.Scopes.DEFAULT);
  if (!client) {
    var xhr = mbi.app.shared.getXhrManager();
    client = new ydn.client.SimpleClient(xhr);
    ydn.client.setClient(client, ydn.http.Scopes.DEFAULT);
  }
  return client;
};


/**
 * @private
 * @type {mbi.data.Bucket}
 */
mbi.app.shared.figure_bucket_ = null;


/**
 * @private
 * @type {mbi.data.Bucket}
 */
mbi.app.shared.site_bucket_ = null;


/**
 * Get bucket
 * @param {string} name mbi.app.base.BUCKET_FIG, mbi.app.base.BUCKET_SITE
 * @return {mbi.data.Bucket}
 */
mbi.app.shared.getBucket = function(name) {
  if (name == mbi.app.base.BUCKET_FIG) {
    if (!mbi.app.shared.figure_bucket_) {
      mbi.app.shared.figure_bucket_ =
          new mbi.data.Bucket(mbi.app.base.BUCKET_FIG,
              mbi.app.base.BUCKET_FIG_PREFIX, true);
    }
    return mbi.app.shared.figure_bucket_;
  } else if (name == mbi.app.base.BUCKET_SITE) {
    if (!mbi.app.shared.site_bucket_) {
      mbi.app.shared.site_bucket_ =
          new mbi.data.Bucket(mbi.app.base.BUCKET_SITE);
    }
    return mbi.app.shared.site_bucket_;
  } else {
    throw new Error(name);
  }
};


/**
 * @type {!goog.async.Deferred}
 * @private
 */
mbi.app.shared.sitemap_df_;


/**
 * @type {!goog.async.Deferred}
 * @private
 */
mbi.app.shared.sitemap_module_df_;


/**
 * @type {!goog.async.Deferred}
 * @private
 */
mbi.app.shared.sitemap_help_df_;


/**
 * @type {!goog.async.Deferred}
 * @private
 */
mbi.app.shared.sitemap_home_df_;


/**
 * @return {!goog.async.Deferred}
 * @protected
 */
mbi.app.shared.buildTopicSiteMap = function() {

  var base_id = 'https://sites.google.com/feeds/content/' +
      mbi.app.base.TOPIC_DOMAIN_NAME + '/' + mbi.app.base.TOPIC_SITE_NAME + '/';
  var page_id = base_id + mbi.app.base.TOPICS_PAGE_ID;
  return mbi.data.site.buildSiteMapById(mbi.app.base.TOPIC_SITE_NAME, page_id);

};


/**
 * @param {string} page_id
 * @param {number=} opt_force 1. build if necessary, 2. force build
 * @param {boolean=} opt_disable disable root link
 * @return {!goog.async.Deferred}
 * @private
 */
mbi.app.shared.getSiteMap_ = function(page_id, opt_force, opt_disable) {

  var base_id = 'https://sites.google.com/feeds/content/' +
      mbi.app.base.TOPIC_DOMAIN_NAME + '/' + mbi.app.base.TOPIC_SITE_NAME + '/';
  var feed_id = base_id + page_id;
  if (opt_force == 2) {
    mbi.app.shared.logger.fine('rebuilding sitemap ' + base_id + ' on ' +
        mbi.app.base.TOPIC_SITE_NAME);
    return mbi.data.site.buildSiteMapById(mbi.app.base.TOPIC_SITE_NAME, feed_id, opt_disable);
  } else {
    var cache_key = mbi.app.base.buildSitemapCacheUrl(page_id);
    return mbi.data.getCacheData(cache_key).addCallbacks(function(data) {
      if (data) {
        return mbi.data.SiteMap.fromJSON(data);
      } else if (opt_force) {
        mbi.app.shared.logger.fine('building sitemap ' + base_id + ' on ' +
            mbi.app.base.TOPIC_SITE_NAME);
        return mbi.data.site.buildSiteMapById(mbi.app.base.TOPIC_SITE_NAME, feed_id, opt_disable);
      } else {
        mbi.app.shared.logger.warning('require data file ' +
            cache_key + ' not found.');
        return goog.async.Deferred.succeed(new mbi.data.SiteMap('', ''));
      }
    }, function(e) {
      mbi.app.shared.sitemap_df_.errback(e);
    });
  }

};


/**
 * @param {number=} opt_force 1. build if necessary, 2. force build
 * @return {!goog.async.Deferred}
 */
mbi.app.shared.getTopicSiteMap = function(opt_force) {
  if (!mbi.app.shared.sitemap_df_ || opt_force == 2) {
    mbi.app.shared.sitemap_df_ =
        mbi.app.shared.getSiteMap_(mbi.app.base.TOPICS_PAGE_ID, opt_force,
            mbi.data.site.DISABLE_ROOT_PAGE);
    mbi.app.shared.sitemap_df_.addCallback(function(map) {
      mbi.app.shared.site_map = map;
    });
  }
  return mbi.app.shared.sitemap_df_;
};


/**
 * @param {number=} opt_force 1. build if necessary, 2. force build
 * @return {!goog.async.Deferred}
 */
mbi.app.shared.getModuleSiteMap = function(opt_force) {
  if (!mbi.app.shared.sitemap_module_df_ || opt_force == 2) {
    mbi.app.shared.sitemap_module_df_ =
        mbi.app.shared.getSiteMap_(mbi.app.base.MODULE_PAGE_ID, opt_force,
        mbi.data.site.DISABLE_ROOT_PAGE);
    mbi.app.shared.sitemap_module_df_.addCallback(function(map) {
      mbi.app.shared.module_map = map;
    });
  }
  return mbi.app.shared.sitemap_module_df_;
};


/**
 * @param {number=} opt_force 1. build if necessary, 2. force build
 * @return {!goog.async.Deferred}
 */
mbi.app.shared.getHelpSiteMap = function(opt_force) {
  if (!mbi.app.shared.sitemap_help_df_ || opt_force == 2) {
    mbi.app.shared.sitemap_help_df_ =
        mbi.app.shared.getSiteMap_(mbi.app.base.HELP_PAGE_ID, opt_force);
    mbi.app.shared.sitemap_help_df_.addCallback(function(map) {
      mbi.app.shared.help_map = map;
    });
  }
  return mbi.app.shared.sitemap_help_df_;
};


/**
 * Get site map. Used only on debug mode.
 * @param {string} group 'module', 'help' or 'topic'
 * @return {mbi.data.SiteMap}
 */
mbi.app.shared.getSiteMap = function(group) {
  if (group == 'module') {
    return mbi.app.shared.module_map;
  } else if (group == 'help') {
    mbi.app.shared.getHelpSiteMap();
    return mbi.app.shared.help_map;
  } else {
    return mbi.app.shared.site_map;
  }
};


/**
 * @param {number=} opt_force 1. build if necessary, 2. force build
 * @return {!goog.async.Deferred}
 */
mbi.app.shared.getHomeSiteMap = function(opt_force) {
  if (!mbi.app.shared.sitemap_home_df_ || opt_force == 2) {
    mbi.app.shared.sitemap_home_df_ = new goog.async.Deferred();
    var obj = goog.global['sitemapHome'];
    if (!obj) {
      mbi.app.shared.home_map = new mbi.data.SiteMap('', '');
    } else {
      mbi.app.shared.home_map = mbi.data.SiteMap.fromJSON(obj);
    }
    mbi.app.shared.sitemap_home_df_.callback(mbi.app.shared.home_map);
  }
  return mbi.app.shared.sitemap_home_df_;
};


/**
 * Get combined map.
 * @return {!goog.async.Deferred}
 */
mbi.app.shared.getRootSiteMap = function() {
  if (mbi.app.shared.root_map) {
    return goog.async.Deferred.succeed(mbi.app.shared.root_map);
  } else {
    mbi.app.shared.root_map = new mbi.data.SiteMap('/', 'Home');
    var df = new goog.async.DeferredList([mbi.app.shared.getHomeSiteMap(), mbi.app.shared.getTopicSiteMap(),
        mbi.app.shared.getModuleSiteMap(), mbi.app.shared.getHelpSiteMap()]);
    return df.addCallback(function(results) {
      if (mbi.app.shared.home_map) {
        mbi.app.shared.root_map.add(mbi.app.shared.home_map);
      }
      if (mbi.app.shared.site_map) {
        mbi.app.shared.root_map.add(mbi.app.shared.site_map);
      }
      if (mbi.app.shared.module_map) {
        mbi.app.shared.root_map.add(mbi.app.shared.module_map);
      }
      if (mbi.app.shared.help_map) {
        mbi.app.shared.root_map.add(mbi.app.shared.help_map);
      }
      return mbi.app.shared.root_map;
    });
  }
};


/**
 * @type {mbi.ui.StatusBar}
 */
mbi.app.shared.status_bar = null;


/**
 * @param e
 */
mbi.app.shared.clearAllDatabases = function(e) {
  var type = mbi.app.base.isChromeExtension ? 'indexeddb' : undefined;
  if (window.confirm('Are you sure you want to clear cache?')) {
    ydn.db.deleteDatabase(mbi.app.base.SITE_DB_NAME, type)
        .addCallback(function(e) {
          return ydn.db.deleteDatabase(mbi.utils.storage.DB_NAME_MBINFO_BI, type);
        })
        .addCallback(function(e) {
          window.location.reload();
        });
  }
};


/**
 * Update status.
 * @param {string=} opt_title
 * @param {string=} opt_msg
 */
mbi.app.shared.setStatus = function(opt_title, opt_msg) {
  if (mbi.app.shared.status_bar) {
    mbi.app.shared.status_bar.status(opt_title, opt_msg);
  }
};


/**
 * Ready after authentication.
 * @type {!goog.async.Deferred}
 */
mbi.app.shared.onReady = new goog.async.Deferred();

