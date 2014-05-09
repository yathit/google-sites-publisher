// This file was automatically generated from image-nav.soy.
// Please don't edit this file by hand.

goog.provide('mbi.templ.ui');

goog.require('soy');
goog.require('soydata');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
mbi.templ.ui.imgNav = function(opt_data, opt_ignored) {
  return '<div class="imgnav-base"><div class="imgnav-cell first"><img src="' + soy.$$filterNoAutoescape(opt_data.imgUrl) + '"/></div><span class="imgnav-panels">' + mbi.templ.ui.imgPanel(opt_data) + '</span></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
mbi.templ.ui.orbNav = function(opt_data, opt_ignored) {
  return '<div class="orb-base"><div class="orb-cell first"><span class="bg-image"></span></div><span class="orb-panels">' + mbi.templ.ui.orbPanel(opt_data) + '</span></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
mbi.templ.ui.orbPanel = function(opt_data, opt_ignored) {
  var output = '';
  var panelList408 = opt_data.panels;
  var panelListLen408 = panelList408.length;
  for (var panelIndex408 = 0; panelIndex408 < panelListLen408; panelIndex408++) {
    var panelData408 = panelList408[panelIndex408];
    output += '<div class="orb-cell">' + ((panelData408['title']) ? '<h3>' + soy.$$escapeHtml(panelData408['title']) + '</h3>' : '') + '<ul>';
    var linkList416 = panelData408['links'];
    var linkListLen416 = linkList416.length;
    for (var linkIndex416 = 0; linkIndex416 < linkListLen416; linkIndex416++) {
      var linkData416 = linkList416[linkIndex416];
      output += '<li><a href="' + soy.$$escapeHtml(opt_data.url_base) + soy.$$escapeHtml(linkData416['url']) + '">' + soy.$$escapeHtml(linkData416['title']) + '</a></li>';
    }
    output += '</ul></div>';
  }
  return output;
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
mbi.templ.ui.imgPanel = function(opt_data, opt_ignored) {
  var output = '';
  var panelList427 = opt_data.panels;
  var panelListLen427 = panelList427.length;
  for (var panelIndex427 = 0; panelIndex427 < panelListLen427; panelIndex427++) {
    var panelData427 = panelList427[panelIndex427];
    output += '<div class="imgnav-cell">' + ((panelData427['title']) ? '<h3>' + soy.$$escapeHtml(panelData427['title']) + '</h3>' : '') + '<ul>';
    var linkList435 = panelData427['links'];
    var linkListLen435 = linkList435.length;
    for (var linkIndex435 = 0; linkIndex435 < linkListLen435; linkIndex435++) {
      var linkData435 = linkList435[linkIndex435];
      output += '<li><a href="' + soy.$$escapeHtml(opt_data.url_base) + soy.$$escapeHtml(linkData435['url']) + '">' + soy.$$escapeHtml(linkData435['title']) + '</a></li>';
    }
    output += '</ul></div>';
  }
  return output;
};
