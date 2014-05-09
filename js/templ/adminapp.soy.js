// This file was automatically generated from adminapp.soy.
// Please don't edit this file by hand.

goog.provide('templ.mbi.app.adminapp');

goog.require('soy');
goog.require('soydata');
goog.require('templ.mbi.app');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.toolbar = function(opt_data, opt_ignored) {
  return '<div class="toolbar" id="wiki-edit-toolbar"><button name="normalize" title="Normalize wiki HTML content" style="display: none">Clean HTML</button><button name="render" title="Render content into new window">Preview</button><button name="publish" title="Publish the page to static site">Publish</button><button name="save" title="Save to Google Site content" style="display: none">Save</button><a name="view" id="toolbar-view" target="_blank" title="View static web page">View</a></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.figureSection = function(opt_data, opt_ignored) {
  var output = '<img src="' + soy.$$filterNoAutoescape(opt_data.img_src) + '" alt="' + soy.$$escapeHtml(opt_data.title) + '" /><h3>Summary</h3><table cellpadding="2"><tbody>';
  var iLimit11 = opt_data.rows.length;
  for (var i11 = 0; i11 < iLimit11; i11++) {
    output += '<tr><td>' + soy.$$filterNoAutoescape(opt_data.rows[i11].key) + '</td><td>' + soy.$$filterNoAutoescape(opt_data.rows[i11].value) + '</td></tr>';
  }
  output += '</tbody></table><div class="copyright-box"><div class="copyright-icon"><span class="copyright-char">&#169;</span></div><div>This image is under <b>copyright </b>to the National University of Singapore. <b>Any other uses of this image without written consent might be copyright infringement.</b></div></div>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.sidebar = function(opt_data, opt_ignored) {
  return '<section class="sidebar"><div class="sidebar-top"><div class="logo" style="display: none"><img src="https://mbinfo.storage.googleapis.com/image/mbinfo-logo.png" alt="MBInfo logo"/></div><div id="image-nav"></div></div><div class="sidebar-bottom"><div class="sidebar-bottom-scroller"><div role="navigation" id="breadcrumb-peer" class="menu-box"></div>' + templ.mbi.app.topicDefinitionPanel(null) + ((opt_data.theme == 'simplicity') ? '<div id="rightbar"><div id="relevant-panel" style="display: none"></div><div id="protein-infobox"></div></div>' : '') + '<div class="user-toolbar"><div><a id="user-login">...</a></div><div><span id="user-name" style="display: none;"></span></div></div>' + templ.mbi.app.tools(opt_data) + '</div></div></section>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.body = function(opt_data, opt_ignored) {
  return '<div id="body-content">  <div><div id="banner"><div class="left"><a href="#" id="home-link"></a><div class="tools" style="display: none"><ul class="banner-menu-bar"><li><div><a href="http://www.mechanobio.info">Home</a></div></li></ul></div></div><div class="right"><input type="text" placeholder="Search MBInfo" width="8em" id="search-input"/></div></div><div class="adminapp">' + templ.mbi.app.adminapp.sidebar(opt_data) + '<div id="main-panel"><div id="main-panel-topbar"><div id="breadcrumb"></div></div><div id="main-panel-content"><section class="content" id="section-content"><div id="content-toolbar">' + templ.mbi.app.adminapp.toolbar(null) + '</div><div id="content-main">' + templ.mbi.app.rightbar(opt_data) + '<div id="wiki-content" class="wiki-content"></div></div></section><section id="section-home"></section><section class="figure" id="section-figure"></section><section  id="section-sitemap"></section><section id="section-figure-list"></section><section id="section-setting">' + templ.mbi.app.setting(opt_data) + '</section></div></div></div><div id="status-panel"><div id="feed" class="feed" style="display: none"></div><div id="status-bar"><div id="status-bar-content"></div></div></div></div></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.index = function(opt_data, opt_ignored) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>MBInfo Admin App</title><meta name="viewport" content="width=device-width, initial-scale=1">' + ((opt_data.is_raw) ? '<script type="text/javascript" src="https://mbinfo.storage.googleapis.com/jsc/raphael-min-2.1.0.js"><\/script><script type="text/javascript" src="http://localhost/mbi-app/meta-data.js"><\/script><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/fonts.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/base.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/wiki.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/img-orb-nav.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/figure.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/goog.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/breadcrumb.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/base.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/domain.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/interaction.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/linkout.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/protein-card.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/pubmed.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/theme/simplicity.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/theme/featured.css"><script type="text/javascript" src="http://localhost/closure-library/closure/goog/base.js"><\/script><script  type="text/javascript" src="http://localhost:8085/ydn-base/src/deps.js"><\/script><script  type="text/javascript" src="http://localhost:8085/ydn/src/deps.js"><\/script><script  type="text/javascript" src="http://localhost:8085/ydn-db/src/deps.js"><\/script><script  type="text/javascript" src="http://localhost:8085/ydn-db-sync/src/deps.js"><\/script><script  type="text/javascript" src="http://localhost:8085/gdata/src/deps.js"><\/script><script  type="text/javascript" src="http://localhost/mbinfo-app-script/js/deps.js"><\/script><script  type="text/javascript" src="http://localhost/mbinfo-wiki/js/deps.js"><\/script><script type="text/javascript" src="http://localhost/mbi-app/js/deps.js"><\/script><script type="text/javascript" src="http://localhost/mbi-app/js/admin/include.js"><\/script>' : '<link rel="stylesheet" type="text/css" href="https://storage.googleapis.com/www.mechanobio.info/css/common.css"><script type="text/javascript" src="https://mbinfo.storage.googleapis.com/jsc/mbi-app-bootstrip.js"><\/script>') + '</head><body><script type="text/javascript" src="https://apis.google.com/js/client.js"><\/script>' + ((opt_data.is_raw) ? '<script type="text/javascript" src="http://localhost/mbi-app/js/admin/main.js"><\/script>' : '') + '</body></html>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.gdrivePanel = function(opt_data, opt_ignored) {
  return '<div class="gdrive-panel"><details><summary>Publish from Google Drive to Static web site</summary><ul></ul></details></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.adminapp.siteMapPage = function(opt_data, opt_ignored) {
  return '<div class="sitemap"><div name="sitemap-tree"></div><div class="admin-tool"><button name="module" title="Update functional module matrix from spreadsheet">Update module matrix</button><button name="sitemap" title="Update sitemap and sitemaps.xml.">Update sitemap</button><button name="redirect" title="Manual update on server-side required. This will just dump the data on console.">Update redirect url</button><details><summary>Advanced</summary><button name="update" title="Invalidate all Google Site page content cached in this app. Instead of this, you should better report the problem to Kyaw.">Validate Google Site cache</button><span name="message"></span></details></div></div>';
};
