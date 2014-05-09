/**
 * @fileoverview Messenter topic.
 */

goog.provide('mbi.web.base');
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.log');
goog.require('goog.object');
goog.require('goog.pubsub.PubSub');


/**
 * @enum {string}
 */
mbi.web.base.Topics = {
  PROTEIN: 'pt', // domain gadget change protein
  GENE: 'ge', // linkout gadget change gene
  TAXON: 'tx'
};


/**
 * @type {goog.debug.Logger}
 */
mbi.web.base.logger =
    goog.log.getLogger('mbi.web.base');


/**
 *
 * @type {goog.debug.Console}
 * @private
 */
mbi.web.base.logger_console_ = null;


/**
 * Log to console.
 * @param {string=} opt_scope logger id.
 * @param {string|number=} opt_level loggering level.
 */
mbi.web.base.log = function(opt_scope, opt_level) {
  if (!mbi.web.base.logger_console_) {
    mbi.web.base.logger_console_ = new goog.debug.Console();
    mbi.web.base.logger_console_.setCapturing(true);
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.WARNING);
    goog.log.getLogger('mbi').setLevel(goog.debug.Logger.Level.INFO);
    goog.log.getLogger('mbi.wiki.Renderer').setLevel(goog.debug.Logger.Level.FINER);
    goog.log.getLogger('mbi.utils.storage').setLevel(goog.debug.Logger.Level.FINEST);

    // goog.log.getLogger('mbi.wiki.Renderer').setLevel(goog.debug.Logger.Level.FINEST);
    // goog.log.getLogger('goog.net')
    //    .setLevel(goog.debug.Logger.Level.FINEST);
    // goog.log.getLogger('mbi.web.GapiAuth').setLevel(
    //    goog.debug.Logger.Level.FINEST);
    goog.log.getLogger('ydn.db').setLevel(
        goog.debug.Logger.Level.WARNING);
    goog.log.getLogger('ydn.db.tr').setLevel(
        goog.debug.Logger.Level.OFF);

  }
  if (opt_scope) {
    var level = opt_level || 'finest';
    var log_level = goog.isNumber(level) ? new goog.debug.Logger.Level(
        'log', level) :
        goog.isString(level) ? goog.debug.Logger.Level.getPredefinedLevel(
            level.toUpperCase()) :
            goog.debug.Logger.Level.FINE;

    goog.log.getLogger(opt_scope).setLevel(log_level);
  }
};


/**
 * @type {goog.pubsub.PubSub}
 * @private
 */
mbi.web.base.pubsub_;


/**
 * @const
 * @type {string}
 */
mbi.web.base.BK_HOSTNAME = 'mbinfo-backend.appspot.com';


/**
 * @const
 * @type {string}
 */
mbi.web.base.LOGIN_ORIGIN = 'https://' + mbi.web.base.BK_HOSTNAME;


/**
 * Get PubSub channel to broadcast global.
 * @return {!goog.pubsub.PubSub}
 */
mbi.web.base.getChannel = function() {
  return mbi.web.base.pubsub_ = mbi.web.base.pubsub_ ||
      new goog.pubsub.PubSub();
};


