/**
 * @fileoverview Prepare redirect data.
 */


goog.provide('mbi.data.Redirect');
goog.require('mbi.data.doc.SpreadSheet');



/**
 * Prepare redirect data.
 * @param {boolean=} opt_is_admin for running as admin to update database.
 * @constructor
 * @struct
 */
mbi.data.Redirect = function(opt_is_admin) {
  this.is_admin = !!opt_is_admin;

  /**
   * @protected
   * @type {mbi.data.doc.SpreadSheet}
   */
  this.ss = null;
  /**
   * Url map.
   * @type {Object}
   * @private
   */
  this.maps_ = null;
};


/**
 * @const
 * @type {string}
 */
mbi.data.Redirect.prototype.KEY = '0Al008S3kosepdDFUTUl0c0pqV2p4d1NQcmdISVNMUnc';


/**
 * @const
 * @type {string}
 */
mbi.data.Redirect.CACHE_URL = mbi.app.base.URL_DATA_BASE + 'redirect-maps.json';


/**
 * Update redirect map.
 * @returns {!goog.async.Deferred}
 */
mbi.data.Redirect.prototype.buildRedirectMap = function() {
  this.ss = this.ss || new mbi.data.doc.SpreadSheet(this.KEY);

  var cano = function(old) {
    if (old) {
      old = old.replace(/"/g, '');
      old = old.replace(/'/g, '');
      old = old.replace(/\/\//g, '/');
      return old.trim();
    }
  };
  return this.ss.fetchSheets().addCallback(function(sheets) {
    var sheet = this.ss.getSheet(0);
    return sheet.fetchRows().addCallback(function(rows) {
      // window.console.log(rows);
      this.maps_ = {};
      var n = rows.length;
      for (var i = 0; i < n; i++) {
        var map = rows[i];
        var old = map['old'];
        var new_ = map['new'];
        if (old && new_) {
          old = cano(old);
          new_ = cano(new_);
          this.maps_[old] = new_;
        }
      }
      mbi.data.updateCacheData(mbi.data.Redirect.CACHE_URL, this.maps_).addCallback(function(x) {
        if (x) {
          mbi.app.shared.setStatus('Redirect map updated with ' + n + ' rows.');
        } else {
          mbi.app.shared.setStatus('Redirect update map not required.');
        }
      }, this);
      return this.maps_;
    }, this);
  }, this);
};


/**
 * Update redirect map.
 * @returns {!goog.async.Deferred}
 */
mbi.data.Redirect.prototype.getRedirectMap = function() {
  if (this.maps_) {
    return goog.async.Deferred.succeed(this.maps_);
  }
  if (this.is_admin) { // update for admin
    var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
    if (!client) {
      return mbi.data.getCacheData(mbi.data.Redirect.CACHE_URL).addCallback(function(maps) {
        this.maps_ = maps;
        return maps;
      }, this);
    } else {
      return this.buildRedirectMap().addCallback(function(x) {
        return x;
      }, this);
    }
  } else {
    return mbi.data.getCacheData(mbi.data.Redirect.CACHE_URL).addCallback(function(maps) {
      this.maps_ = maps;
      return maps;
    }, this);
  }
};


/**
 * Get redirect path. this will update and upload to backet if necessary.
 * @param {string} path
 * @return {!goog.async.Deferred}
 */
mbi.data.Redirect.prototype.getRedirect = function(path) {
  return this.getRedirectMap().addCallback(function(map) {
    return map ? map[path] || null : null;
  }, this);
};


/**
 * Dump url mapping data for python.
 */
mbi.data.Redirect.prototype.dump = function() {
  this.getRedirectMap().addCallback(function(maps) {
    var arr = [];
    for (var key in maps) {
      if (key == '_etag') {
        continue;
      }
      arr.push("'" + key.replace(/'/g, '') + "': '" + maps[key].replace(/'/g, '') + "'");
    }
    window.console.log('redirectMaps = {' + arr.join(', ') + '}');
  });
};

