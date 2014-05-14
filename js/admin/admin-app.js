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
 * @fileoverview MBInfo Admin app.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.app.AdminApp');
goog.require('goog.history.Html5History');
goog.require('goog.ui.ScrollFloater');
goog.require('mbi.admin.Updater');
goog.require('mbi.app.base');
goog.require('mbi.app.service');
goog.require('mbi.app.shared');
goog.require('mbi.data.Bucket');
goog.require('mbi.data.Redirect');
goog.require('mbi.data.site');
goog.require('mbi.fig.DndController');
goog.require('mbi.fig.List');
goog.require('mbi.fig.Page');
goog.require('mbi.gadget.ProteinInfobox');
goog.require('mbi.ui.Breadcrumb');
goog.require('mbi.ui.Definition');
goog.require('mbi.ui.HomePanel');
goog.require('mbi.ui.OrbNav');
goog.require('mbi.ui.SettingControl');
goog.require('mbi.ui.SiteMapPage');
goog.require('mbi.ui.StatusBar');
goog.require('mbi.ui.feed.Feed');
goog.require('mbi.web.GaeAuth');
goog.require('mbi.web.base');
goog.require('mbi.wiki.Editor');
goog.require('mbi.wiki.HtmlRenderer');
goog.require('mbi.wiki.Renderer');
goog.require('mbi.wiki.ui.RecentPage');



/**
 * Chrome app background demon.
 * @constructor
 * @extends {mbi.web.GaeAuth}
 * @struct
 */
mbi.app.AdminApp = function() {
  goog.base(this);
  /**
   * @final
   * @type {goog.history.Html5History}
   */
  this.history = new goog.history.Html5History();
  /**
   * @protected
   * @type {mbi.data.Redirect}
   */
  this.redirect = new mbi.data.Redirect(true);
  /**
   * @final
   * @type {mbi.wiki.HtmlRenderer}
   */
  this.processor = new mbi.wiki.HtmlRenderer();
  /**
   * @protected
   * @type {mbi.admin.Updater}
   */
  this.updater = new mbi.admin.Updater(this.processor);
  /**
   * @protected
   * @type {mbi.ui.Breadcrumb}
   */
  this.breadcrumb = new mbi.ui.Breadcrumb(true);
  /**
   * @protected
   * @type {mbi.gadget.ProteinInfobox}
   */
  this.protein_infobox = new mbi.gadget.ProteinInfobox();
  /**
   * @protected
   * @type {mbi.ui.HomePanel}
   */
  this.home_panel = new mbi.ui.HomePanel(this.updater);
  /**
   * @protected
   * @type {mbi.ui.Definition}
   */
  this.definition_ctrl = new mbi.ui.Definition(true);
  /**
   * @protected
   * @type {mbi.wiki.Editor}
   */
  this.wiki_editor = new mbi.wiki.Editor(this.protein_infobox, this.processor);
  /**
   * @protected
   * @type {mbi.ui.SettingControl}
   */
  this.setting_ctrl = new mbi.ui.SettingControl();
  /**
   * @protected
   * @type {mbi.ui.SiteMapPage}
   */
  this.sitemap_page = new mbi.ui.SiteMapPage(this.redirect, true);
  /**
   * @protected
   * @type {mbi.ui.OrbNav}
   */
  this.img_nav = new mbi.ui.OrbNav();
  /**
   * @protected
   * @type {mbi.fig.DndController}
   */
  this.dnd_controller = new mbi.fig.DndController(
      this.updater.getBucketFigure());
  /**
   * @protected
   * @type {mbi.fig.List}
   */
  this.figure_list = new mbi.fig.List(this.updater.getBucketFigure());
  /**
   * @protected
   * @type {mbi.fig.Page}
   */
  this.figure_page = new mbi.fig.Page(this.updater.getBucketFigure(), true);
  /**
   * @protected
   * @type {MbiAppUserSetting}
   */
  this.setting = null;
  /**
   * @protected
   * @type {mbi.ui.StatusBar}
   */
  this.status_bar = new mbi.ui.StatusBar();
  mbi.app.shared.status_bar = this.status_bar;

  // this.history.setUseFragment(false);
  this.history.setPathPrefix(new goog.Uri(document.location.href).getPath() +
      '/');
  goog.events.listen(this.history, goog.history.EventType.NAVIGATE,
      this.handleHistory, false, this);
};
goog.inherits(mbi.app.AdminApp, mbi.web.GaeAuth);


/**
 * @inheritDoc
 */
mbi.app.AdminApp.prototype.getScope = function() {
  return 'email https://sites.google.com/feeds/ ' +
      'https://www.googleapis.com/auth/devstorage.full_control';
};


/**
 * For a given path, get redirect url. This will update database too.
 * @param {string} path
 */
mbi.app.AdminApp.prototype.getContentFor404 = function(path) {

};


/**
 * @inheritDoc
 */
mbi.app.AdminApp.prototype.getClientId = function() {
  return '749422248201-aef1a3oll0k94anq9pfmgapvtbiqf8ii.apps.googleusercontent.com';
};


/**
 * @inheritDoc
 */
mbi.app.AdminApp.prototype.getApiKey = function() {
  return 'AIzaSyA-ld7NSMON2D611Y3j7oLPsCajizXKQwQ';
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.app.AdminApp.prototype.logger =
    goog.log.getLogger('mbi.app.AdminApp');


/**
 * @type {string?}
 * @private
 */
mbi.app.AdminApp.prototype.prev_token_ = null;


/**
 * @param {goog.history.Event} e
 */
mbi.app.AdminApp.prototype.handleHistory = function(e) {
  if (e.token == this.prev_token_) {
    // fixme: to fix repeat call.
    return;
  }

  this.prev_token_ = e.token;
  if (!e.token || e.token == '/') {
    // go home
    this.goHome();
    // scroll to top.
    document.documentElement.scrollTop = 0;
  } else if (e.token == 'upload') {
    this.figure_list.showUploadFile();
    this.prev_token_ = '';
  } else if (e.token == 'figure-list') {
    this.breadcrumb.show([mbi.app.shared.site_map]);
    this.figure_list.show();
    this.hideAll(this.figure_list);
  } else if (e.token == 'setting') {
    this.breadcrumb.show([mbi.app.shared.site_map]);
    this.hideAll(this.setting_ctrl);
  } else if (e.token == 'sitemap') {
    this.hideAll(this.sitemap_page);
  } else if (goog.string.startsWith(e.token, 'figure')) {
    this.breadcrumb.show([mbi.app.shared.site_map]);
    this.figure_page.show(e.token.substr(7));
    this.hideAll(this.figure_page);
    document.documentElement.scrollTop = 0;
  } else if (goog.string.startsWith(e.token, 'page/')) {
    var path = e.token.substr(4);
    var url = 'https://sites.google.com/a/mechanobio.info/' +
        mbi.app.base.TOPIC_SITE_NAME + path;
    var is_module = /^\/module/.test(path);
    var sitemap = mbi.app.shared.site_map;
    if (is_module) {
      sitemap = mbi.app.shared.module_map;
    } else if (/^\/Help/.test(path)) {
      sitemap = mbi.app.shared.help_map;
    } else if (/^\/what-is/.test(path)) {
      sitemap = mbi.app.shared.what_is_map;
    }
    var ok = this.navigateWikiUrl(sitemap, url);
    if (!ok) {
      // not found
      return this.redirect.getRedirect(path).addCallback(function(x) {
        // window.console.log(x);
        if (x) {
          this.navigateWikiUrl(sitemap, x);
        } else {

        }
      }, this);
    } else {
      document.documentElement.scrollTop = 0;
    }
  }
};


/**
 * Go home.
 */
mbi.app.AdminApp.prototype.goHome = function() {
  this.hideAll(this.home_panel);
  mbi.app.shared.getTopicSiteMap().addCallback(function(map) {
    this.breadcrumb.show([map]);
  }, this);
};


/**
 * Enable floating scrollbar on right side.
 * @type {boolean}
 */
mbi.app.AdminApp.ENABLE_FLOAT = false;


/**
 * Initialize UI.
 * @param {!MbiAppUserSetting} setting
 */
mbi.app.AdminApp.prototype.init = function(setting) {
  if (setting.logging) {
    mbi.web.base.log('mbi', 'finest');
  }
  this.logger.finest('init ' + this);

  var is_extension = !!window['chrome'] && !!window['chrome']['runtime'];
  this.setting = setting;
  var body_data = {
    theme: this.setting.theme,
    admin_app: true,
    editable: true
  };
  var ele = goog.soy.renderAsElement(templ.mbi.app.adminapp.body, body_data);
  document.body.appendChild(ele);
  var ele_feed = document.getElementById('feed');
  // ele_feed.parentElement.removeChild(ele_feed);
  // var ele_sidebar = goog.dom.getElementByClass('sidebar');
  // ele_sidebar.appendChild(ele_feed);
  mbi.ui.feed.feed.init(ele_feed);
  this.figure_page.init(document.getElementById('section-figure'));
  this.figure_list.init(document.getElementById('section-figure-list'));
  var btn_sitemap = document.getElementById('btn-sitemap');
  btn_sitemap.href = '#sitemap';
  this.sitemap_page.init(document.getElementById('section-sitemap'));
  this.initNav();
  this.initWiki();
  this.hideAll(mbi.ui.feed.feed);
  this.status_bar.status('Initializing ' + this);
  this.status_bar.init(document.getElementById('status-bar-content'),
      mbi.ui.feed.feed);


  if (mbi.app.AdminApp.ENABLE_FLOAT && this.setting.theme == mbi.app.base.Theme.DESKTOP) {
    mbi.ui.installScrollFloater();
  }

};


/**
 * Setup navigation UI controls.
 * @protected
 */
mbi.app.AdminApp.prototype.initNav = function() {
  var ele_logo = goog.dom.getElementByClass('logo');
  goog.events.listen(ele_logo, 'click', function(e) {
    this.history.setToken('');
  }, false, this);

  var children = document.getElementById('breadcrumb-children');
  this.setting_ctrl.init(this.setting, document.getElementById(
      'section-setting'));
  var peer = document.getElementById('breadcrumb-peer');
  this.breadcrumb.init(document.getElementById('breadcrumb'), peer);
  goog.events.listen(this.breadcrumb, 'click', function(e) {
    // e.target.href
    if (e.target.tagName == 'A') {
      var uri = new goog.Uri(e.target.href);
      this.history.setToken('page' + uri.getPath());
    }
  }, false, this);
  this.img_nav.init(document.getElementById('image-nav'));
  this.home_panel.init(document.getElementById('section-home'));
  this.initSitemap_();

};


/**
 * Setup wiki UI controls.
 * @protected
 */
mbi.app.AdminApp.prototype.initWiki = function() {
  var ele_wiki_content = document.getElementById('section-content');
  this.wiki_editor.init(ele_wiki_content);
  goog.events.listen(this.wiki_editor, mbi.wiki.Event.EventType.UPDATED,
      function(e) {
        // updated.
      }, false, this);
  goog.events.listen(this.wiki_editor.renderer,
      mbi.wiki.Event.EventType.ACTIVE_PROTEIN, function(e) {
        var pe = /** @type {mbi.wiki.ActiveProteinChangedEvent} */ (e);
        this.protein_infobox.show(pe.uniprot_id, pe.family_name);
      }, false, this);
  this.dnd_controller.init(ele_wiki_content);
  var compact = this.setting.theme == mbi.app.base.Theme.SIMPLICITY;
  this.protein_infobox.init(document.getElementById('protein-infobox'),
      [], compact);
  var ele_main_panel = document.getElementById('main-panel');
  goog.events.listen(ele_main_panel, 'click', function(e) {
    // handle self link
    var a = e.target;
    if (e.target.tagName == goog.dom.TagName.IMG &&
        e.target.parentElement.tagName == goog.dom.TagName.A) {
      a = e.target.parentElement;
    }
    if (a.tagName == 'A') {
      var url = new goog.Uri(a.href);
      var path = url.getPath();
      if ((!url.getDomain() || url.getDomain() == window.location.host)) {
        if (goog.string.startsWith(path, '/topics')) {
          e.preventDefault();
          this.history.setToken('page' + path);
          return true;
        } else if (goog.string.startsWith(path, '/modules')) {
          e.preventDefault();
          this.history.setToken('page' + path);
          return true;
        } else if (goog.string.startsWith(path, '/Help')) {
          e.preventDefault();
          this.history.setToken('page' + path);
          return true;
        } else if (goog.string.startsWith(path, '/what-is')) {
          e.preventDefault();
          this.history.setToken('page' + path);
          return true;
        } else if (goog.string.startsWith(path, '/figure/')) {
          e.preventDefault();
          this.history.setToken(path.replace(/^\//, '').replace(/\.html$/, ''));
          return true;
        } else if (goog.string.startsWith(path, '/system/')) {
          e.preventDefault();
          this.status_bar.status('Invalid link', path);
          return true;
        }
      }
    }
  }, false, this);
};


/**
 * Hide all components.
 * @param {mbi.ui.IVisible=} opt_comp_show optional component to show.
 */
mbi.app.AdminApp.prototype.hideAll = function(opt_comp_show) {
  this.logger.finest('going ' + opt_comp_show);
  this.wiki_editor.setVisible(false);
  this.home_panel.setVisible(false);
  this.figure_page.setVisible(false);
  this.figure_list.setVisible(false);
  this.setting_ctrl.setVisible(false);
  this.sitemap_page.setVisible(false);
  if (opt_comp_show) {
    opt_comp_show.setVisible(true);
  }
};


/**
 * @protected
 * @param {mbi.data.SiteMap} sitemap
 * @param {string} url wiki site url.
 * @return {boolean} true if rendereed.
 */
mbi.app.AdminApp.prototype.navigateWikiUrl = function(sitemap, url) {
  var result = [];
  if (url && url != '/') {
    var node = sitemap.walk(url, result);
  }
  if (result.length > 0) {
    var current = result[result.length - 1];
    this.hideAll(this.wiki_editor);
    this.protein_infobox.render(null); // clear content
    this.wiki_editor.renderUrl(node.url).addCallback(function() {
    }, this);
    this.breadcrumb.show(result);
    return true;
  } else {
    // go home
    this.logger.finer('url ' + url + ' not found on ' + sitemap);
    this.goHome();
    return false;
  }
};


/**
 * @private
 */
mbi.app.AdminApp.prototype.initSitemap_ = function() {
  goog.Timer.callOnce(function() {
    // run in seperate thread so that it error not interifer with others
    var map_req = mbi.app.shared.getTopicSiteMap(1);
    map_req.addCallbacks(function(x) {
      this.breadcrumb.show([x]);
      //console.log(JSON.stringify(x.toJSON()));
      goog.Timer.callOnce(function() {
        // should not require timeout here, but background process is
        // interfering.
        this.history.setEnabled(true);
      }, 100, this);
    }, function(e) {
      throw e;
    }, this);
  }, 10, this);
};


/**
 * Run the app.
 * @override
 */
mbi.app.AdminApp.prototype.run = function(token) {
  this.logger.finest('run ' + this);
  goog.base(this, 'run', token);
  // this.protein_infobox.show('P18206');
  // mbi.data.Object.setClient(ydn.client.getClient(ydn.client.Scopes.GOOGLE_CLIENT));
  if (token) {
    this.updater.run();
    mbi.app.service.start(this.processor);
  }
  this.status_bar.status('Ready');
  this.setting_ctrl.updateUserInfo(this.getAuthResult(), token);
  this.definition_ctrl.decorate(document.getElementById('term-definition-panel'));
  mbi.app.shared.onReady.callback();
};


/**
 * Export internals.
 * @return {Object}
 */
mbi.app.AdminApp.prototype.exports = function() {
  return {
    'getSiteMap': mbi.app.shared.getSiteMap,
    'editor': this.wiki_editor,
    'redirect': this.redirect,
    'figureList': this.figure_list,
    'orbNav': this.img_nav,
    'processor': this.processor
  };
};


/**
 * @inheritDoc
 */
mbi.app.AdminApp.prototype.toString = function() {
  return 'AdminApp:' + mbi.app.base.VERSION;
};


/**
 * Create the app on global space.
 * @return {mbi.app.AdminApp}
 */
mbi.app.AdminApp.runApp = function() {
  if (goog.DEBUG) {
    mbi.web.base.log();
  }
  var app = new mbi.app.AdminApp();
  window.onerror = function winOnError(errorMsg, url, lineNumber) {
    var msg = errorMsg;
    if (url) {
      msg += ' on ' + lineNumber + ' of ' + url;
    }
    mbi.ui.feed.feed.add(new mbi.ui.feed.Message(msg));
  };
  return app;
};


goog.exportSymbol('runApp', mbi.app.AdminApp.runApp);
goog.exportProperty(mbi.app.AdminApp.prototype, 'run',
    mbi.app.AdminApp.prototype.run);
goog.exportProperty(mbi.app.AdminApp.prototype, 'exports',
    mbi.app.AdminApp.prototype.exports);
goog.exportProperty(mbi.wiki.HtmlRenderer.prototype, 'publishAllByParent',
    mbi.wiki.HtmlRenderer.prototype.publishAllByParent);
goog.exportProperty(mbi.wiki.HtmlRenderer.prototype, 'migrateByUrl',
    mbi.wiki.HtmlRenderer.prototype.migrateByUrl);
goog.exportProperty(mbi.wiki.Editor.prototype, 'migrateAll',
    mbi.wiki.Editor.prototype.migrateAll);
goog.exportProperty(mbi.fig.List.prototype, 'publish',
    mbi.fig.List.prototype.publish);
goog.exportProperty(mbi.data.Redirect.prototype, 'dump',
    mbi.data.Redirect.prototype.dump);
goog.exportProperty(mbi.data.Redirect.prototype, 'getRedirect',
    mbi.data.Redirect.prototype.getRedirect);


