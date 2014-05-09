// This file was automatically generated from figure.soy.
// Please don't edit this file by hand.

goog.provide('templ.mbi.fig');

goog.require('soy');
goog.require('soydata');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.editFigure = function(opt_data, opt_ignored) {
  return '<div class="figure-toolbar toolbar"><input type="file" name="upload-figure-file"><button name="delete">Delete</button><button name="save">Publish</button></div><div class="copyrighted-figure"></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.figure = function(opt_data, opt_ignored) {
  return '<h2>' + soy.$$escapeHtml(opt_data.title) + '</h2>' + ((! opt_data.img_src) ? '<div class="notfound">Figure ' + soy.$$escapeHtml(opt_data.name) + ' not found.</div>' : '<img src="' + soy.$$filterNoAutoescape(opt_data.img_src) + '" alt="' + soy.$$escapeHtml(opt_data.name) + '" />') + '<h3>Summary</h3><table cellpadding="2"  class="figure-table"><tbody><tr><td>Title</td><td name="title" ' + ((opt_data.editable) ? 'contenteditable' : '') + '>' + soy.$$escapeHtml(opt_data.title) + '</td></tr><tr><td>Description</td><td name="description" ' + ((opt_data.editable) ? 'contenteditable' : '') + '>' + soy.$$escapeHtml(opt_data.description) + '</td></tr><tr><td>Date</td><td name="created" ' + ((opt_data.editable) ? 'contenteditable' : '') + '>' + soy.$$escapeHtml(opt_data.created) + '</td></tr><tr><td>Author</td><td name="author" ' + ((opt_data.editable) ? 'contenteditable' : '') + '>' + soy.$$escapeHtml(opt_data.author) + '</td></tr><tr><td>Permission</td>' + ((opt_data.license) ? '<!-- Note: name attribute is given only if defined --><td name="license">' + soy.$$escapeHtml(opt_data.license) + '</td>' : '<td>Modification, copying and distribution (commercial or non-commercial) of this image is strictly prohibited without written consent. Please contact MBInfo at <b>feedback@mechanobio.info</b> to request permission to use this image.</td>') + '</tr></tbody></table><div class="citation-box"><details><summary>How to cite this page?</summary><div class="citation"><span class="author">MBInfo contributors.</span> <span class="title">' + soy.$$escapeHtml(opt_data.title) + '. </span>In <span class="journal-title">MBInfo Wiki</span>, Retrieved ' + soy.$$escapeHtml(opt_data.today) + ' from ' + soy.$$escapeHtml(opt_data.page_url) + '</div></details></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.figureBox = function(opt_data, opt_ignored) {
  return '<div class="wikic figure-img"><img/></div><div class="wikir figure-toolbar"><span class="figure-title" name="title"  ' + ((opt_data.editable) ? 'contenteditable' : '') + '>Title</span><span>: </span><span class="figure-description" name="description"  ' + ((opt_data.editable) ? 'contenteditable' : '') + '>Description</span></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.figureListTable = function(opt_data, opt_ignored) {
  var output = '<table cellspacing = "0" cellpadding = "5"><thead><tr><th>No</th><th>Title</th><th>Referred pages</th><th>Image</th></tr></thead><tbody>';
  var iLimit220 = opt_data.rows.length;
  for (var i220 = 0; i220 < iLimit220; i220++) {
    output += '<tr ' + ((opt_data.rows[i220].deleted) ? 'style="display: none;"' : '') + '><td>' + soy.$$escapeHtml(opt_data.rows[i220].no) + '.</td><td><span><a href="' + soy.$$escapeHtml(opt_data.rows[i220].path) + '" class="title">' + soy.$$escapeHtml(opt_data.rows[i220].title) + '</a>: </span><span class="description">' + soy.$$escapeHtml(opt_data.rows[i220].description) + '</span></td><td><ul class="reference">';
    var refList234 = opt_data.rows[i220].refs;
    var refListLen234 = refList234.length;
    for (var refIndex234 = 0; refIndex234 < refListLen234; refIndex234++) {
      var refData234 = refList234[refIndex234];
      output += '<li><a href="' + soy.$$escapeHtml(refData234.href) + '">' + soy.$$escapeHtml(refData234.name) + '</a></li>';
    }
    output += '</ul></td><td><a href="' + soy.$$escapeHtml(opt_data.rows[i220].path) + '">' + ((opt_data.rows[i220].deleted) ? '<img/>' : '<img width="120" src="' + soy.$$escapeHtml(opt_data.rows[i220].src) + '"/>') + '</a></td></tr>';
  }
  output += '</tbody></table>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.selectFigure = function(opt_data, opt_ignored) {
  var output = '<div class="select-figure"><ol>';
  var iLimit255 = opt_data.rows.length;
  for (var i255 = 0; i255 < iLimit255; i255++) {
    output += '<li name="' + soy.$$escapeHtml(i255) + '"><div>' + soy.$$escapeHtml(opt_data.rows[i255].title) + '</div><img height="40" src="' + soy.$$escapeHtml(opt_data.rows[i255].src) + '"/></li>';
  }
  output += '</ol></div>';
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.toolbar = function(opt_data, opt_ignored) {
  return '';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.fig.figureList = function(opt_data, opt_ignored) {
  return '<div class="figure-list"><div class="toolbar"><button name="publish" title="Publish the page to static site">Publish</button></div><h3>List of figures</h3><div class="figure-table"></div></div>';
};
