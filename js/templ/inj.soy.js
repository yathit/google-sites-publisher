// This file was automatically generated from inj.soy.
// Please don't edit this file by hand.

goog.provide('templ.mbi.inj');

goog.require('soy');
goog.require('soydata');


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.inj.menubar = function(opt_data, opt_ignored) {
  return '<div id="mbi-mebubar" class="goog-menubar"><div id="placeButton" class="goog-menu-button" title="MBInfo"><span style="vertical-align:middle">MBInfo</span><div id="placeMenu" class="goog-menu"><div class="goog-menuitem" id="place-figure">Insert figure</div><div class="goog-menuitem" id="citation">Insert citation</div><div class="goog-menuitem" id="annotate-protein">Annotate protein</div><div class="goog-menuitem" id="annotate">Annotate</div><div class="goog-menuitem" id="clean">Clean HTML</div></div></div></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.inj.insertFigure = function(opt_data, opt_ignored) {
  return '<div style="display:block;text-align:left"><a href="' + soy.$$escapeHtml(opt_data.url) + '"><img border="0" src="' + soy.$$escapeHtml(opt_data.src) + '"></a></div>';
};


/**
 * @param {Object.<string, *>=} opt_data
 * @param {(null|undefined)=} opt_ignored
 * @return {string}
 * @notypecheck
 */
templ.mbi.inj.annotateDialog = function(opt_data, opt_ignored) {
  return '<form class="annotate-dialog"><div><label for="name" title="Case sensitive protein family name, such as \'Actin\'.">Protein family:</label><br/><input type="text" name="name" /></div><div><label for="uniprot" title="Specific protein.">UniProtId:</label><br/><input type="text" name="uniprot" /></div><div><label for="go" title="Gene ontology annotations.">GO:</label><br/><input type="text" name="go" /></div></form>';
};
