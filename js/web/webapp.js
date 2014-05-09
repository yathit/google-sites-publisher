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
 * @fileoverview MBInfo wiki decoration app.
 *
 * This app is used by static HTML site to decorate control UI components.
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.web.WebApp');
goog.require('goog.Timer');
goog.require('goog.asserts');
goog.require('goog.soy');
goog.require('goog.string');
goog.require('goog.ui.ScrollFloater');
goog.require('mbi.app.base');
goog.require('mbi.app.shared');
goog.require('mbi.data.Redirect');
goog.require('mbi.data.site');
goog.require('mbi.fig.Page');
goog.require('mbi.gadget.ProteinInfobox');
goog.require('mbi.ui.Breadcrumb');
goog.require('mbi.ui.OrbNav');
goog.require('mbi.ui.Search');
goog.require('mbi.ui.SettingDialog');
goog.require('mbi.ui.SiteMapPage');
goog.require('mbi.web.GapiAuth');
goog.require('mbi.web.base');
goog.require('mbi.wiki.Renderer');
goog.require('templ.mbi.app');
goog.require('ydn.db.Storage');
goog.require('ydn.dom');



/**
 * Create a webapp.
 * @constructor
 * @extends {mbi.web.GapiAuth}
 */
mbi.web.WebApp = function() {
  goog.base(this);
  this.logger.info('starting webapp');
  /**
   * @protected
   * @type {mbi.gadget.ProteinInfobox}
   */
  this.protein_infobox = new mbi.gadget.ProteinInfobox();
  this.wiki_renderer = new mbi.wiki.Renderer(this.protein_infobox);
  /**
   * @protected
   * @type {mbi.data.Redirect}
   */
  this.redirect = new mbi.data.Redirect();
  /**
   * User profile as found in
   * @type {Object}
   */
  this.user_profile = null;
  /**
   * @protected
   * @type {MbiAppUserSetting}
   */
  this.setting = null;
  /**
   * @protected
   * @type {mbi.ui.Breadcrumb}
   */
  this.breadcrumb = new mbi.ui.Breadcrumb();
  /**
   * @protected
   * @type {mbi.ui.Search}
   */
  this.search_panel = new mbi.ui.Search();
  /**
   * @protected
   * @type {mbi.ui.OrbNav}
   */
  this.img_nav = new mbi.ui.OrbNav();
  /**
   * @type {mbi.ui.SettingDialog}
   * @protected
   */
  this.setting_dialog = new mbi.ui.SettingDialog(false);
  /**
   * Url to continue after login.
   * @type {string?}
   * @protected
   */
  this.continue_url = null;
};
goog.inherits(mbi.web.WebApp, mbi.web.GapiAuth);


/**
 * @define {boolean} debug flag.
 */
mbi.web.WebApp.DEBUG = false;


/**
 * @inheritDoc
 */
mbi.web.WebApp.prototype.getLib = function() {
  return ['storage', mbi.app.base.GAPI_STORAGE_VERSION];
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.web.WebApp.prototype.logger =
    goog.log.getLogger('mbi.web.WebApp');


/**
 * @inheritDoc
 */
mbi.web.WebApp.prototype.getScope = function() {
  return 'email';
};


/**
 * @private
 */
mbi.web.WebApp.prototype.initSitemap_ = function() {
  mbi.app.shared.getRootSiteMap().addCallback(function(x) {
    var site_map =  /** @type {mbi.data.SiteMap} */ (x);
    // console.log(site_map);
    if (!x || site_map.count() == 0) {
      // let original HTML navigation do the job.
      return;
    }
    var result = [];
    var uri = new goog.Uri(window.location.href);
    uri.setScheme('');
    var url = 'https://sites.google.com/a/mechanobio.info/' +
        mbi.app.base.TOPIC_SITE_NAME + uri.getPath();
    site_map.walk(url, result);
    // window.console.log(result);
    // console.log(site_map, result);
    if (result.length == 0) {
      result = [site_map];
    } else /* if (result[1] && result[1].title == 'TOPICS')*/ {
      goog.array.removeAt(result, 0);
    }
    var peer = document.getElementById('breadcrumb-peer');
    this.breadcrumb.init(document.getElementById('breadcrumb'), peer);
    this.breadcrumb.show(result);
  }, this);
};


/**
 * Check if current user is editor.
 * @return {boolean}
 */
mbi.web.WebApp.prototype.isUserEditor = function() {
  return this.user_profile ? !!this.user_profile['isEditor'] : false;
};


/**
 * Handle after login.
 * @param {Object} data
 */
mbi.web.WebApp.prototype.handleLogin = function(data) {
  // cache editor membership.
  // here we want to optimize require to hit server.
  var key = 'user-profile-' + data['sub'];
  var s = goog.global.localStorage.getItem(key);
  this.user_profile = s ? /** @type {Object} */ (JSON.parse(s)) : null;
  if (!this.user_profile) {
    var client = ydn.client.getClient(ydn.http.Scopes.DEFAULT);
    var params = {
      'email': data['email']
    };
    var hd = new ydn.client.HttpRequestData(mbi.web.base.LOGIN_ORIGIN + '/register',
        'GET', params);
    client.request(hd).execute(function(json, raw) {
      if (raw.isSuccess()) {
        this.user_profile = data;
        this.user_profile['isEditor'] = true;
        var s = goog.global.localStorage.setItem(key, JSON.stringify(this.user_profile));
        this.logger.info('user ' + data['email'] + ' registered as editor');
        if (this.continue_url) {
          window.location = this.continue_url;
        }
      }
    }, this);
  } else {
    this.logger.info('user ' + data['email'] + ' is ' +
        (this.user_profile['isEditor'] ? ' editor ' : ' not-editor'));
  }
  if (goog.global['_gaq']) {
    var category = 'user';
    var label = data['email'];
    var action = 'login';
    goog.global['_gaq']['push'](['_trackEvent', category, action, label]);
  }
};


/**
 * Initialize components.
 * @param {Object} data
 */
mbi.web.WebApp.prototype.run = function(data) {
  goog.base(this, 'run', data);
  this.logger.finer('running');
  // window.console.log(data);
  if (data && data['sub']) {
    this.handleLogin(data);
  }
};


/**
 * Run the app if not already.
 * @param {!MbiAppUserSetting} setting
 */
mbi.web.WebApp.prototype.init = function(setting) {
  goog.base(this, 'init', setting);
  this.setting = setting;
  var uri = new goog.Uri(window.location.href);
  var query = uri.getQuery();
  var path = uri.getPath() || '/';
  this.logger.finest('initializing ' + mbi.app.base.VERSION);

  var ele_content = goog.dom.getElementsByTagNameAndClass('SECTION',
      'content')[0];
  var ele_section_content = document.getElementById('section-content');
  var ele_wiki_content = document.getElementById('wiki-content');
  var ele_main_panel = document.getElementById('main-panel');
  var ele_main_panel_content = document.getElementById('main-panel-content');

  if (path == '/error404.html') {
    // error page
    // var renderer = new mbi.wiki.Renderer();
  } else if (goog.string.startsWith(path, '/figure/')) {
    // figure page
    mbi.fig.Page.applyWaterMark();
  } else if (query == 'sitemap') {
    var sitemap_page = new mbi.ui.SiteMapPage(this.redirect);
    sitemap_page.init(ele_main_panel_content);
    sitemap_page.setVisible(true);
    ele_main_panel_content.addEventListener('click', function(e) {
      // console.log(e);
      if (e.target.tagName == 'A') {
        window.location.href = e.target.href;
      }
    }, false);
  } else if (/figure-list/.test(window.location.search)) {
    // list of figure page

  } else if (ele_section_content.querySelector('article')) {

    this.wiki_renderer.init(ele_section_content);
    var p_ids = this.wiki_renderer.listProteinAnnotation();

    var compact = this.setting.theme == mbi.app.base.Theme.SIMPLICITY;
    this.protein_infobox.init(document.getElementById('protein-infobox'),
        [], compact);
    mbi.wiki.Decorator.decorator.decorate(ele_main_panel);
    goog.events.listen(this.wiki_renderer,
        mbi.wiki.Event.EventType.ACTIVE_PROTEIN, function(e) {
          var pe = /** @type {mbi.wiki.ActiveProteinChangedEvent} */ (e);
          this.protein_infobox.show(pe.uniprot_id, pe.family_name);
        }, false, this);
    /*
    show_license = goog.dom.getElementsByTagNameAndClass('article',
        null, ele_wiki_content).length == 1;
    */
    this.wiki_renderer.showProteinInfobox();
    goog.events.listen(ele_section_content, 'click', function(e) {
      var p = e.target.parentElement;
      if (e.target.tagName == 'A' && p && p.tagName == 'SPAN' &&
          goog.dom.classes.has(p, 'wiki-editsection')) {
        if (goog.global['_gaq']) {
          var ele_name = document.getElementById('user-name');
          var category = 'edit';
          var label = ele_name ? ele_name.textContent : '';
          var action = e.target.href;
          goog.global['_gaq']['push'](['_trackEvent', category, action, label]);
        }
        var ele = document.getElementById('user-login');
        if (!this.isUserEditor() && ele.textContent == 'login') {
          e.preventDefault();
          // we will redirect only after login and hence become a member;
          this.continue_url = 'https://www.google.com/accounts/AccountChooser?service=jotspot&continue=' + e.target.href;
          var me = this;
          this.handleAuthClick(e);
        } else if (!goog.global.sessionStorage.getItem('done-account-choose')) {
          e.target.href = 'https://www.google.com/accounts/AccountChooser?service=jotspot&continue=' +
              e.target.href;
          goog.global.sessionStorage.setItem('done-account-choose', '1');
        }
      }
    }, false, this);
    var relevant_panel = goog.dom.getElementByClass('relevant-pages-panel');
    var p_info = document.getElementById('protein-infobox');
    if (relevant_panel && p_info) {
      if (goog.dom.classes.has(relevant_panel, 'empty') && goog.dom.classes.has(p_info, 'empty')) {
        var rightbar = document.getElementById('rightbar');
        goog.dom.classes.add(rightbar, 'empty');
        goog.dom.classes.add(ele_wiki_content, 'rightbar-empty');
        goog.dom.classes.add(document.body, 'rightbar-empty');
      }
    }
    var btn_sitemap = document.getElementById('btn-sitemap');
    if (btn_sitemap) {
      btn_sitemap.href = '/cgi?sitemap';
    }

    if (this.setting.theme == mbi.app.base.Theme.DESKTOP) {
      mbi.ui.installScrollFloater();
    }
  } else if (uri.getParameterValue('q')) {
    var q = uri.getParameterValue('q');
    this.search_panel.search(/** @type {string} */ (q));
    goog.dom.classes.add(document.body, 'rightbar-empty');
  } else if (ele_wiki_content) {
    // 404 pages.
    if (goog.global['_gaq']) {
      var category = 'visit';
      var label = document.location.href;
      var action = 'PageNotFound';
      goog.global['_gaq']['push'](['_trackEvent', category, action, label]);
    }
    var opt = {
      url: document.location.href
    };
    goog.soy.renderElement(ele_wiki_content, templ.mbi.web.html.error, opt);
    this.redirect.getRedirect(uri.getPath()).addCallback(function(url) {
      if (url) {
        window.location.href = url;
      }
    }, this);

  } else {
    this.logger.warning('I don\'t know what to do.');
  }


  var sidebar = goog.dom.getElementByClass('sidebar');
  var ele_sidebar_sc = goog.dom.getElementByClass('sidebar-bottom-scroller',
      sidebar);

  var setting_ele = goog.soy.renderAsElement(templ.mbi.app.setting);
  if (ele_content && ele_sidebar_sc && setting_ele) {
    var tools = goog.soy.renderAsElement(templ.mbi.app.tools);
    ele_sidebar_sc.appendChild(tools);
    var btn_setting = document.getElementById('btn-tools-setting');
    goog.events.listen(btn_setting, 'click', function(e) {
      e.preventDefault();
      goog.style.setElementShown(setting_ele, true);
    }, true, this);
    goog.style.setElementShown(setting_ele, false);
    ele_content.appendChild(setting_ele);
  }

  var img_nav = document.getElementById('image-nav');
  if (img_nav) {
    this.img_nav.init(img_nav);
  }

  this.setting_dialog.init(setting);
  var ele_setting = document.getElementById('btn-tools-setting');
  goog.events.listen(ele_setting, 'click', function(e) {
    this.setting_dialog.setVisible(true);
  }, true, this);

  this.search_panel.enterDocument();

  this.initSitemap_();

  mbi.web.WebApp.addWeAreHiring();
};


/**
 * Create the app on global space.
 * @return {mbi.web.WebApp}
 */
mbi.web.WebApp.runApp = function() {
  if (goog.DEBUG) {
    mbi.web.base.log();
  }
  return new mbi.web.WebApp();
};


/**
 * Add we are hiring. Note share with home.js.
 */
mbi.web.WebApp.addWeAreHiring = function() {

  var base = document.getElementById('banner');
  if (base) {
    var showHiring = function(text, href) {
      // base = base.firstElementChild;
      var hir = document.createElement('div');
      var a = document.createElement('a');
      hir.className = 'we-are-hiring marquee';
      a.textContent = text;
      a.href = href;
      hir.appendChild(a);
      var wrap = document.createElement('div');
      wrap.className = 'wrapper';
      wrap.appendChild(hir);
      base.appendChild(wrap);
      setTimeout(function() {
        hir.classList.remove('marquee');
        hir.classList.add('home');
      }, 10000);
    };

    // delay a bit so that it is noticable.
    setTimeout(function() {
      /*
      var r = Math.random();
      if (r < 0.3) {
        showHiring('We are hiring awesome developer',
            'http://mbi.nus.edu.sg/opportunities/web-application-developer-needed-at-mechanobiology-institute-singapore/');
      } else if (r < 0.8) {
        showHiring('We are hiring scientific writer',
            'http://mbi.nus.edu.sg/opportunities/scientific-writer-position-now-open-at-mechanobiology-institute-singapore/');
      } else {
        showHiring('We are hiring', 'http://mbi.nus.edu.sg/opportunities/');
      }
      */
      showHiring('We are hiring', 'http://mbi.nus.edu.sg/opportunities/');
    }, 5000 * Math.random());
  }
};


/**
 * Export internals.
 * @return {Object}
 */
mbi.web.WebApp.prototype.exports = function() {
  return {
    'getSiteMap': mbi.app.shared.getSiteMap,
    'orbNav': this.img_nav,
    'renderer': this.wiki_renderer
  };
};


/**
 * @inheritDoc
 */
mbi.web.WebApp.prototype.toString = function() {
  return 'WebApp:' + mbi.app.base.VERSION;
};


goog.exportSymbol('runApp', mbi.web.WebApp.runApp);
goog.exportProperty(mbi.web.WebApp.prototype, 'init',
    mbi.web.WebApp.prototype.init);
goog.exportProperty(mbi.web.WebApp.prototype, 'run',
    mbi.web.WebApp.prototype.run);
goog.exportProperty(mbi.web.WebApp.prototype, 'exports',
    mbi.web.WebApp.prototype.exports);

