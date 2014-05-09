/**
 * @fileoverview Read and write google spreadsheet file.
 */


goog.provide('mbi.data.doc.SpreadSheet');
goog.require('goog.async.Deferred');
goog.require('mbi.data.doc.Sheet');
goog.require('ydn.client');
goog.require('ydn.client.SimpleClient');



/**
 * Google spreadsheet file.
 * @param {string} id sheet id.
 * @constructor
 */
mbi.data.doc.SpreadSheet = function(id) {
  /**
   * @final
   * @type {string}
   */
  this.id = id;
  /**
   * @protected
   * @type {ydn.client.Client}
   */
  this.client = null;
  /**
   * @protected
   * @type {Array.<mbi.data.doc.Sheet>}
   */
  this.sheets = null;
};


/**
 * @return {ydn.client.Client}
 */
mbi.data.doc.SpreadSheet.prototype.getClient = function() {
  return this.client || ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT) ||
      ydn.client.getClient(ydn.http.Scopes.DEFAULT) || new ydn.client.SimpleClient();
};


/**
 * @param {ydn.client.Client} client
 */
mbi.data.doc.SpreadSheet.prototype.setClient = function(client) {
  this.client = client;
};


/**
 * Get cached sheets. Call #fetchSheets to load from server.
 * @return {Array.<mbi.data.doc.Sheet>}
 */
mbi.data.doc.SpreadSheet.prototype.getSheets = function() {
  goog.asserts.assert(this.sheets);
  return this.sheets;
};


/**
 * Get cached sheet at i. Call #fetchSheets to load from server.
 * @param {number} i
 * @return {mbi.data.doc.Sheet}
 */
mbi.data.doc.SpreadSheet.prototype.getSheet = function(i) {
  goog.asserts.assert(this.sheets);
  return this.sheets[i] || null;
};


/**
 * Fetch sheets
 * @return {!goog.async.Deferred}
 */
mbi.data.doc.SpreadSheet.prototype.fetchSheets = function() {
  if (this.sheets) {
    return goog.async.Deferred.succeed(this.sheets);
  }
  var uri = 'https://spreadsheets.google.com/feeds/worksheets/' + this.id + '/private/full';
  var params = {
    'alt': 'json'
  };
  var data = new ydn.client.HttpRequestData(uri, 'GET', params);
  var df = new goog.async.Deferred();
  this.getClient().request(data).execute(function(json, raw) {
     // window.console.log(json);
    if (raw.getStatus() == 200) {
      var entries = /** @type {Array.<!GDataEntry>} */ (json['feed']['entry']);
      this.sheets = [];
      for (var i = 0; i < entries.length; i++) {
        this.sheets.push(new mbi.data.doc.Sheet(entries[i], this.getClient()));
      }
      df.callback(this.sheets);
    } else {
      df.errback(raw);
    }
  }, this);
  return df;
};



