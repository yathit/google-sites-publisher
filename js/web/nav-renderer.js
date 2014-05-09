/**
 * @fileoverview Navigation renderer.
 */


goog.provide('mbi.web.NavRenderer');
goog.require('goog.ui.PopupMenu');
goog.require('goog.ui.SubMenu');
goog.require('goog.ui.SubMenuRenderer');
goog.require('mbi.wiki.Renderer');



/**
 * Navigation renderer.
 * @param {mbi.wiki.Renderer} wiki_renderer wiki renderer.
 * @constructor
 * @deprecated use individual components instead.
 */
mbi.web.NavRenderer = function(wiki_renderer) {
  this.wiki_renderer = wiki_renderer;
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.web.NavRenderer.prototype.logger =
    goog.log.getLogger('mbi.web.NavRenderer');


/**
 * Initialize UI components.
 */
mbi.web.NavRenderer.prototype.init = function() {
  this.initMenu_(mbi.app.base.TOPIC_SITE_NAME);
};


/**
 * Decorate.
 */
mbi.web.NavRenderer.prototype.run = function() {

};


/**
 * @param {string} name
 * @private
 */
mbi.web.NavRenderer.prototype.initMenu_ = function(name) {
  var res = mbi.data.site.getSiteMap(name);
  res.addCallbacks(function(x) {
    var data = /** @type {MenuData} */ (x.toJSON());
    this.initTopMenu_(name, data);
  }, function(e) {
    throw e;
  }, this);
};


/**
 * Initialize top menu component.
 * @param {string} name site name.
 * @param {MenuData} site_map sitemap.
 * @private
 */
mbi.web.NavRenderer.prototype.initTopMenu_ = function(name, site_map) {
  var ele = document.getElementById('btn-menu-' + name);
  // render header
  var top_menu = new goog.ui.PopupMenu();
  top_menu.attach(ele, goog.positioning.Corner.BOTTOM_START);

  /**
   * Add menu items recrussively.
   * @param {goog.ui.Menu|goog.ui.SubMenu} menu
   * @param {MenuData} data
   */
  var addMenu = function(menu, data) {
    if (data) {
      var item;
      if (data.children && data.children.length > 0) {
        item = new goog.ui.SubMenu(data.title);
        for (var i = 0; i < data.children.length; i++) {
          addMenu(item, data.children[i]);
        }
      } else {
        item = new goog.ui.MenuItem(data.title);
        item.setValue(data.id);
      }
      menu.addItem(item);
    }
  };
  for (var i = 0; i < site_map.children.length; i++) {
    addMenu(top_menu, site_map.children[i]);
  }
  top_menu.render();
  top_menu.addEventListener('action', function(e) {
    if (e.target instanceof goog.ui.MenuItem) {
      var item = /** @type {goog.ui.MenuItem} */ (e.target);
      var page_id = item.getValue();
      if (page_id) {
        this.wiki_renderer.render(name, page_id);
      }
    }
  }, false, this);
};

