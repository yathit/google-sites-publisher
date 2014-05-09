// This file was automatically generated from html.soy.
// Please don't edit this file by hand.

goog.provide('templ.mbi.web.html');

goog.require('soy');
goog.require('soydata');
goog.require('templ.mbi.app');
goog.require('templ.mbi.fig');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.jsHead = function(opt_data, opt_ignored) {
  return '<meta name="viewport" content="width=device-width, initial-scale=1">' + ((opt_data.canonical_url) ? '<link rel="canonical" href="' + soy.$$escapeHtml(opt_data.canonical_url) + '"/>' : '') + ((opt_data.is_raw) ? '<script type="text/javascript" src="https://mbinfo.storage.googleapis.com/jsc/raphael-min-2.1.0.js"><\/script><script type="text/javascript" src="http://localhost/mbi-app/meta-data.js"><\/script><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/fonts.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/img-orb-nav.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/base.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/wiki.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/goog.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/figure.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/breadcrumb.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/we-are-hiring.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/base.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/domain.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/interaction.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/linkout.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/protein-card.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbinfo-app-script/css/pubmed.css"/><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/theme/simplicity.css"><link rel="stylesheet" type="text/css" href="http://localhost/mbi-app/gss/theme/featured.css"><script type="text/javascript" src="http://localhost/closure-library/closure/goog/base.js"><\/script><script type="text/javascript" src="http://localhost:8085/ydn-base/src/deps.js"><\/script><script type="text/javascript" src="http://localhost:8085/ydn/src/deps.js"><\/script><script type="text/javascript" src="http://localhost:8085/ydn-db/src/deps.js"><\/script><script type="text/javascript" src="http://localhost:8085/ydn-db-sync/src/deps.js"><\/script><script type="text/javascript" src="http://localhost:8085/gdata/src/deps.js"><\/script><script type="text/javascript" src="http://localhost/mbinfo-app-script/js/deps.js"><\/script><script type="text/javascript" src="http://localhost/mbinfo-wiki/js/deps.js"><\/script><script type="text/javascript" src="http://localhost/mbi-app/js/deps.js"><\/script><script type="text/javascript" src="http://localhost/mbi-app/js/web/include.js"><\/script>' : '<link rel="stylesheet" type="text/css" href="//www.mechanobio.info/css/common.css"><script type="text/javascript" src="//' + soy.$$escapeHtml(opt_data.assess_domain) + '/jsc/web-bootstrip.js"><\/script>');
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.jsBody = function(opt_data, opt_ignored) {
  return (opt_data.is_raw) ? '<script type="text/javascript" src="http://localhost/mbi-app/js/web/bootstrip-dev.js"><\/script>' : '';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.innerHtml = function(opt_data, opt_ignored) {
  return '<head><meta charset="utf-8"/><title>' + ((opt_data.title) ? soy.$$escapeHtml(opt_data.title) + ' - ' : '') + 'MBInfo Wiki</title>' + templ.mbi.web.html.jsHead(opt_data) + '</head><body>' + templ.mbi.web.html.body(opt_data) + templ.mbi.web.html.jsBody(opt_data) + '</body>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.index = function(opt_data, opt_ignored) {
  return '<!DOCTYPE html><html>' + templ.mbi.web.html.innerHtml(opt_data) + '</html>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.sidebar = function(opt_data, opt_ignored) {
  return '<section class="sidebar"><div class="sidebar-top"><div class="logo" style="display: none"><a href="/"></a></div><div id="image-nav"></div></div><div class="sidebar-bottom"><div class="sidebar-bottom-scroller"><div role="navigation" id="breadcrumb-peer" class="menu-box">' + ((opt_data.breadcrumbPeer) ? soy.$$filterNoAutoescape(opt_data.breadcrumbPeer) : '<ul class="breadcrumb-sidemenu"><li><a href="/topics/cytoskeleton-dynamics">Cytoskeleton Dynamics</a></li><li><a href="/topics/synthesis">Synthesis</a></li><li><a href="/topics/signaling">Signaling</a></li><li><a href="/topics/modules">Modules</a></li><li><a href="/topics/cellular-organization">Cellular Organization</a></li></ul>') + '</div>' + templ.mbi.app.topicDefinitionPanel(null) + '<div id="toolbar"></div></div></div></section>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.body = function(opt_data, opt_ignored) {
  return '<div id="body-content"><div><div id="banner"><div class="left"><a href="http://www.mechanobio.info/" id="home-link"></a></div><div class="right"><div class="top"><div class="login-bar"><div><span id="user-name" style="display: none;"></span></div><div><a id="user-login">...</a></div></div></div><div class="bottom"><input type="text" placeholder="Search MBInfo" width="8em" id="search-input"/></div></div></div>' + templ.mbi.web.html.sidebar(opt_data) + '<div id="main-panel"><div id="main-panel-topbar"><div id="breadcrumb">' + ((opt_data.breadcrumb) ? soy.$$filterNoAutoescape(opt_data.breadcrumb) : '') + '</div></div><div id="main-panel-content"><section class="content" id="section-content"><div id="content-main">' + templ.mbi.app.rightbar(opt_data) + '<div id="wiki-content" class="wiki-content">' + ((opt_data.content) ? templ.mbi.app.content(opt_data) : '') + '</div></div>' + ((opt_data.date) ? '<div class="history"><div><div class="left">Updated on: ' + soy.$$escapeHtml(opt_data.date) + '</div><div class="center"></div><div class="right"><a href="#" class="show-history">History</a></div></div></div>' : '') + '</section></div></div>' + templ.mbi.web.html.footer(opt_data) + '</div></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.footer = function(opt_data, opt_ignored) {
  return '<footer>' + ((opt_data.show_license) ? '<div class="license"><span class="cc-by-nc"></span> <span xmlns:dct="http://purl.org/dc/terms/" property="dct:title">MBInfo</span> by <a xmlns:cc="http://creativecommons.org/ns#" href="http://www.mechanobio.info" property="cc:attributionName" rel="cc:attributionURL">MBI</a>, <a href="http://www.nus.edu.sg">NUS</a> is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative&nbsp;Commons Attribution-NonCommercial&nbsp;4.0 International&nbsp;License</a>; additional terms may apply.</div>' : '') + '<div><div id="all-logos"><img usemap="imgmap201436163455" src="//www.mechanobio.info/image/home/all-logo.png"/></div><map id="imgmap201436163455" name="imgmap201436163455"><area shape="rect" alt="MBInfo" title="" coords="1,1,118,35" href="//www.mechanobio.info" target="" /><area shape="rect" alt="NUS" title="" coords="126,3,202,38" href="http://www.nus.edu.sg" target="" /><area shape="rect" alt="MOE" title="" coords="210,4,358,39" href="http://www.moe.edu.sg/" target="" /><area shape="rect" alt="NRF" title="" coords="365,5,440,39" href="http://www.nrf.gov.sg/" target="" /></map></div><div class="menu-block"><ul class="menu"><li><a href="http://mbi.nus.edu.sg/opportunities/">Jobs</a></li><li><a href="http://www.mechanobio.info/about.html">About us</a></li><li><a href="/terms-of-use.html"><span>Terms of Use</span></a></li><li><a href="/privacy.html"><span>Privacy</span></a></li></ul></div></footer>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.home = function(opt_data, opt_ignored) {
  return '<article>The goal of mechanobiology is to understand the functional effects of the structural micro-environment and force-induced deformations. These factors, when combined with chemical signals, determine the local cell response that is integrated to drive multicellular functions in whole organisms.</article>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.error = function(opt_data, opt_ignored) {
  return '<article><p>The URL ' + soy.$$escapeHtml(opt_data.url) + ' you are looking for cannot be found on server.</p><p id="error-similar-page"></p></article>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.history = function(opt_data, opt_ignored) {
  var output = '<div class="history-detail"><table width="98%"><thead><tr><th>Version</th><th>Last Published</th><th>Published by</th><th>Size and changes</th></tr></thead><tbody>';
  var objList350 = opt_data.items;
  var objListLen350 = objList350.length;
  for (var objIndex350 = 0; objIndex350 < objListLen350; objIndex350++) {
    var objData350 = objList350[objIndex350];
    output += '<tr><td><a target="_blank" href="' + soy.$$escapeHtml(opt_data.url) + '?generation=' + soy.$$escapeHtml(objData350['Generation']) + '">Version ' + soy.$$escapeHtml(objData350['No']) + '</a></td><td>' + soy.$$escapeHtml(objData350['LastModified']) + '</td><td>' + soy.$$escapeHtml(objData350['Owner']['DisplayName']) + '</td><td>' + soy.$$escapeHtml(objData350['Size']) + ' bytes ' + soy.$$escapeHtml(objData350['Change']) + '</td></tr>';
  }
  output += '</tbody></table></div>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.figure = function(opt_data, opt_ignored) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>MBInfo Figure Page ' + ((opt_data.title) ? ' - ' + soy.$$escapeHtml(opt_data.title) : '') + ' </title>' + templ.mbi.web.html.jsHead(opt_data) + '</head><body><div id="body-content"><div><div id="banner"><div class="left"><a href="//www.mechanobio.info/" id="home-link"></a></div><div class="right"><div class="top"><div class="login-bar"><div><span id="user-name" style="display: none;"></span></div><div><a id="user-login">...</a></div></div></div><div class="bottom"><input type="text" placeholder="Search MBInfo" width="8em" id="search-input"/></div></div></div>' + templ.mbi.web.html.sidebar(opt_data) + '<section class="content" id="section-content"><div id="main-panel"><div id="main-panel-topbar"><div id="breadcrumb"></div></div><div id="main-panel-content"><section class="figure" id="section-figure"><div class="copyrighted-figure">' + templ.mbi.fig.figure(opt_data) + '</div></section></div></div></section>' + templ.mbi.web.html.jsBody(opt_data) + '</div></div></body></html>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.web.html.figureList = function(opt_data, opt_ignored) {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"/><title>MBInfo - List of figures </title>' + templ.mbi.web.html.jsHead(opt_data) + '</head><body><div id="body-content"><div><div id="banner"><div class="left"><a href="//www.mechanobio.info/" id="home-link"></a></div><div class="right"><div class="top"><div class="login-bar"><div><span id="user-name" style="display: none;"></span></div><div><a id="user-login">...</a></div></div></div><div class="bottom"><input type="text" placeholder="Search MBInfo" width="8em" id="search-input"/></div></div></div>' + templ.mbi.web.html.sidebar(opt_data) + '<section class="content" id="section-content"><div id="main-panel"><section class="topbar"><div id="breadcrumb"></div></section><section class="figure-list" id="section-figure-list"><h3>List of figures</h3><div class="figure-table">' + templ.mbi.fig.figureListTable(opt_data) + '</div></section></div></section>' + templ.mbi.web.html.footer(opt_data) + '</div></div>' + templ.mbi.web.html.jsBody(opt_data) + '</body></html>';
};
