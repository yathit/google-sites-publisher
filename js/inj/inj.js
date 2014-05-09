/**
 * @fileoverview About this file
 */

goog.provide('mbi.inj');
goog.require('goog.debug.Console');
goog.require('goog.log');
goog.require('goog.ui.Zippy');
goog.require('mbi.ui.feed.Feed');
goog.require('ydn.msg.Message');
goog.require('ydn.msg.Pipe');


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.inj.logger = goog.log.getLogger('mbi.inj');


/**
 * @const
 * @type {string}
 */
mbi.inj.version = 'i';


/**
 * @type {Element}
 * @private
 */
mbi.inj.ele_status_ = null;


/**
 * @final
 * @type {mbi.ui.feed.Feed}
 */
mbi.inj.feed = new mbi.ui.feed.Feed();


/**
 * Display a status message.
 * @param {string} msg
 */
mbi.inj.status = function(msg) {
  if (!mbi.inj.ele_status_) {
    var nav = document.getElementsByClassName('sites-ccc-nav')[0];
    if (!nav) {
      throw new Error('Element sites-ccc-nav not found in Google Site UI.');
    }
    var root = document.createElement('div');
    root.className = 'status-bar';
    var parent = nav.firstElementChild;
    parent.insertBefore(root, parent.firstElementChild);
    mbi.inj.ele_status_ = document.createElement('div');
    mbi.inj.ele_status_.className = 'status';
    var ele_feed = document.createElement('div');
    root.appendChild(mbi.inj.ele_status_);
    root.appendChild(ele_feed);
    mbi.inj.feed.init(ele_feed);
    var zippy = new goog.ui.Zippy(mbi.inj.ele_status_, ele_feed);
  }
  mbi.inj.ele_status_.textContent = msg;
  mbi.inj.feed.notify(msg);
};


/**
 * @protected
 * @final
 * @type {ydn.msg.Pipe}
 */
mbi.inj.pipe = new ydn.msg.Pipe(mbi.app.base.SERVICE_NAME);


/**
 * @final
 * @type {!ydn.msg.Channel}
 */
mbi.inj.ch_site = mbi.inj.pipe.getChannel();


/**
 *
 * @type {goog.debug.Console}
 * @private
 */
mbi.inj.logger_console_ = null;


/**
 * Log to console.
 */
mbi.inj.log = function() {
  if (!mbi.inj.logger_console_) {
    mbi.inj.logger_console_ = new goog.debug.Console();
    mbi.inj.logger_console_.setCapturing(true);
    goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.WARNING);
    if (COMPILED) {
      goog.log.getLogger('mbi').setLevel(goog.debug.Logger.Level.FINE);
    } else {
      goog.log.getLogger('mbi').setLevel(goog.debug.Logger.Level.FINEST);
    }
  }
};


/**
 * Test service with extension channel.
 */
mbi.inj.testService = function() {
  mbi.inj.logger.finest('testing service');
  var value = 'ok' + goog.now();

  mbi.inj.ch_site.send(mbi.app.base.Req.ECHO, value).addCallback(function(msg) {
    if (msg == value) {
      mbi.inj.logger.info('service OK');
      mbi.inj.status('mbi.app ' + mbi.app.base.VERSION + '.' +
          mbi.inj.version + ' ready.');
    }
  });
};
