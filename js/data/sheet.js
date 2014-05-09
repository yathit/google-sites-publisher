/**
 * @fileoverview About this file
 */


goog.provide('mbi.data.doc.Sheet');
goog.require('ydn.gdata.Entry');



/**
 * Google spreadsheet file.
 * @param {!GDataEntry} data sheet id.
 * @param {ydn.client.Client} client sheet id.
 * @constructor
 * @extends {ydn.gdata.Entry}
 */
mbi.data.doc.Sheet = function(data, client) {
  goog.base(this, data);
  /**
   * @final
   * @type {ydn.client.Client}
   */
  this.client = client;
  /**
   * @protected
   * @type {Array.<Object>}
   */
  this.rows = null;
  /**
   * @protected
   * @type {Array.<Array.<string>>}
   */
  this.cells = null;
};
goog.inherits(mbi.data.doc.Sheet, ydn.gdata.Entry);


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.data.doc.Sheet.prototype.logger =
    goog.log.getLogger('mbi.data.doc.Sheet');


/**
 * Get rows. Call #fetchRows first.
 * @return {Array.<Object>}
 */
mbi.data.doc.Sheet.prototype.getRows = function() {
  return this.rows;
};


/**
 * Fetch sheet rows.
 * Note: only sheet having heading row has row list feed.
 * @see #fetchCells
 * @return {goog.async.Deferred}
 */
mbi.data.doc.Sheet.prototype.fetchRows = function() {
  var link = this.getLink(ydn.atom.Link.Rel.LIST_FEED);
  var params = {
    'alt': 'json'
  };
  if (!link) {
    this.logger.warning('Rows feed not found in ' + this.getTitle() + + ' of ' + this.getId());
    return goog.async.Deferred.fail(null);
  }
  var data = new ydn.client.HttpRequestData(link.href, 'GET', params);
  var df = new goog.async.Deferred();
  this.getClient().request(data).execute(function(json, raw) {
    // window.console.log(json);
    if (raw.getStatus() == 200) {
      this.rows = [];
      var entries = /** @type {Array.<!GDataEntry>} */ (json['feed']['entry']);
      for (var i = 0; i < entries.length; i++) {
        var obj = {};
        for (var key in entries[i]) {
          if (goog.string.startsWith(key, 'gsx$')) {
            var id = key.substr('gsx$'.length);
            obj[id] = entries[i][key]['$t'];
          }
        }
        this.rows.push(obj);
      }
      df.callback(this.rows);
    } else {
      df.errback(null);
    }
  }, this);
  return df;
};


/**
 * Return 0 index base cell matrix.
 * Must call {@see #fetchCells} first.
 * @return {Array.<Array.<string>>}
 */
mbi.data.doc.Sheet.prototype.getCells = function() {
  return this.cells;
};


/**
 * Fetch sheet cells. Cells are 0 index base.
 * @return {goog.async.Deferred}
 */
mbi.data.doc.Sheet.prototype.fetchCells = function() {
  var link = this.getLink(ydn.atom.Link.Rel.CELLS_FEED);
  var params = {
    'alt': 'json'
  };
  if (!link) {
    this.logger.warning('Rows feed not found in ' + this.getTitle() + + ' of ' + this.getId());
    return goog.async.Deferred.fail(null);
  }
  var data = new ydn.client.HttpRequestData(link.href, 'GET', params);
  var df = new goog.async.Deferred();
  this.getClient().request(data).execute(function(json, raw) {
    window.console.log(json);
    if (raw.getStatus() == 200) {
      this.cells = [];
      var entries = /** @type {Array.<!GDataEntry>} */ (json['feed']['entry']);
      for (var i = 0; i < entries.length; i++) {
        var cell = entries[i]['gs$cell'];
        var row = parseInt(cell['row'], 10);
        var col = parseInt(cell['col'], 10);
        if (row >= 0 && col >= 0) {
          if (!this.cells[row - 1]) {
            this.cells[row - 1] = [];
          }
          this.cells[row - 1][col - 1] = cell['$t'];
        }
      }
      df.callback(this.cells);
    } else {
      df.errback(null);
    }
  }, this);
  return df;
};
