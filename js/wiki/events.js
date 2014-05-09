/**
 * @fileoverview Events.
 */


goog.provide('mbi.wiki.Event');
goog.provide('mbi.wiki.UpdatedEvent');



/**
 * Wiki events.
 * @param {string} type Event Type.
 * @param {Object} target Reference target.
 * @constructor
 * @extends {goog.events.Event}
 */
mbi.wiki.Event = function(type, target) {
  goog.base(this, type, target);
};
goog.inherits(mbi.wiki.Event, goog.events.Event);



/**
 * @param {ydn.gdata.site.Page} page
 * @param {Object} target Reference target.
 * @constructor
 * @extends {mbi.wiki.Event}
 */
mbi.wiki.UpdatedEvent = function(page, target) {
  goog.base(this, mbi.wiki.Event.EventType.UPDATED, target);
  /**
   * @type {ydn.gdata.site.Page}
   */
  this.page = page;
};
goog.inherits(mbi.wiki.UpdatedEvent, mbi.wiki.Event);
