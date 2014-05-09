// This file was automatically generated from app.soy.
// Please don't edit this file by hand.

goog.provide('templ.mbi.app');

goog.require('soy');
goog.require('soydata');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.tools = function(opt_data, opt_ignored) {
  return '<div class="tools"><ul><li>' + templ.mbi.app.termDefinitionPanel(null) + '</li>' + ((opt_data.editable) ? '<li><a href="#upload" name="upload">Upload image</a></li><li><a href="#figure-list" name="list-figure">Figure list</a></li><li><a href="https://github.com/mbikt/mbinfo-extension/issues/new">Report bug</a></li>' : '<li><a href="/figure-list.html" name="list-figure">Figure list</a></li><li><a href="/feedback.html">Feedback</a></li><li><a href="/Help">Help</a></li>') + '<li><a href="/cgi?sitemap" id="btn-sitemap">Sitemap</a></li><li><a href="#setting" id="btn-tools-setting">Setting</a></li></ul></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.setting = function(opt_data, opt_ignored) {
  return '<h3>Setting</h3><div class="setting" name="track"><label>Track</label><select class="track"><option value="previous">Previous</option><option value="stable">Stable</option><option value="beta">Beta</option><option value="edge">Edge</option></select></div><div class="setting" name="theme"><label>Theme</label><select class="theme"><option value="featured">Featured</option><option value="simplicity">Simplicity</option></select></div><div class="setting"><label>Log</label><input type="checkbox" id="setting-logging"/></div><div class="setting"><details><summary>Advanced setting</summary>' + ((opt_data.admin_app) ? '<div><a class="logout">logout</a></div><div><a class="revoke">Revoke access</a> <a href="https://security.google.com/settings/security/permissions" >Manage credentials</a></div>' : '') + '<div><button type="button" title="Clear database cache." class="clear-cache">Clear cache</button><span> Require refresh.</span></div></details></div><br /><div>Version: <span class="version"></span></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.rightbar = function(opt_data, opt_ignored) {
  return '<div id="rightbar"><div style="position: relative"><div id="relevant-panel"></div><div id="protein-infobox"></div></div></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.content = function(opt_data, opt_ignored) {
  var output = '<article name="' + soy.$$escapeHtml(opt_data.name) + '"><h2><span>' + soy.$$escapeHtml(opt_data.title) + '</span>' + ((opt_data.edit_url) ? '<span class="wiki-editsection">[<a rel="nofollow" target="' + soy.$$escapeHtml(opt_data.edit_url) + '" href="' + soy.$$escapeHtml(opt_data.edit_url) + '">Edit</a>]</span>' : '') + '</h2><div id="subpages-panel"></div>';
  if (opt_data.sub_pages.length > 1) {
    output += '<div id="subsections-panel"><div class="subsections-title">Content</div><ol>';
    var subList91 = opt_data.sub_pages;
    var subListLen91 = subList91.length;
    for (var subIndex91 = 0; subIndex91 < subListLen91; subIndex91++) {
      var subData91 = subList91[subIndex91];
      output += '<li><a href="#' + soy.$$escapeHtml(subData91.name) + '">' + soy.$$escapeHtml(subData91.title) + '</a></li>';
    }
    output += '</ol></div>';
  }
  output += soy.$$filterNoAutoescape(opt_data.content);
  var subList101 = opt_data.sub_pages;
  var subListLen101 = subList101.length;
  for (var subIndex101 = 0; subIndex101 < subListLen101; subIndex101++) {
    var subData101 = subList101[subIndex101];
    output += '<div class="subpage"><h3><a href="' + soy.$$escapeHtml(subData101.path) + '" name="' + soy.$$escapeHtml(subData101.name) + '">' + soy.$$escapeHtml(subData101.title) + '</a><span class="wiki-editsection">[<a rel="nofollow" href="' + soy.$$escapeHtml(subData101.edit_url) + '" target="' + soy.$$escapeHtml(subData101.edit_url) + '">Edit</a>]</span></h3>' + soy.$$filterNoAutoescape(subData101.content) + '</div>';
  }
  output += ((opt_data.reference) ? soy.$$filterNoAutoescape(opt_data.reference) : '') + '</article>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.recentContent = function(opt_data, opt_ignored) {
  var output = '<div class="recent-content"><ul>';
  var rowList124 = opt_data.rows;
  var rowListLen124 = rowList124.length;
  for (var rowIndex124 = 0; rowIndex124 < rowListLen124; rowIndex124++) {
    var rowData124 = rowList124[rowIndex124];
    output += '<li><div><img src="' + soy.$$escapeHtml(rowData124.imgUrl) + '"/><a href="' + soy.$$escapeHtml(rowData124.url) + '">' + soy.$$escapeHtml(rowData124.title) + '</a></div></li>';
  }
  output += '</ul></div>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.subpagesPanel = function(opt_data, opt_ignored) {
  var output = '<div class="subpage-panel" ><h3>In this topic</h3><ul>';
  var rowList136 = opt_data.rows;
  var rowListLen136 = rowList136.length;
  for (var rowIndex136 = 0; rowIndex136 < rowListLen136; rowIndex136++) {
    var rowData136 = rowList136[rowIndex136];
    output += '<li><a href="' + soy.$$escapeHtml(rowData136.url) + '">' + soy.$$escapeHtml(rowData136.title) + '</a></li>';
  }
  output += '</ul></div>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.topicDefinitionPanel = function(opt_data, opt_ignored) {
  return '<div id="topic-definition-panel" style="display: none"><div><h3></h3><p></p></div></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.termDefinitionPanel = function(opt_data, opt_ignored) {
  return '<div id="term-definition-panel" style="display: none"><div><input name="name" title="Enter term for definition" placeholder="actin" list="definition-search-hint"/><a href="#" style="display: none" name="show-update">...</a><div class="definition"></div><datalist id="definition-search-hint"></datalist></div><div name="admin" class="admin-tool"><div name="upload-panel"  style="display: none">Count: <span title="Number of entries in the database" name="db-count"></span> / <span title="Number of entries in the source (Google spreadsheet)" name="source-count"></span><button>Upload</button></div></div></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.app.toolsPanel = function(opt_data, opt_ignored) {
  return '<div><button name="update-definition" title="Update definition from Google spreadsheet">Update Definition</button></div>';
};
