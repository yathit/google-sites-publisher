/**
 * @fileoverview Provide storage.
 */


goog.provide('mbi.data.storage');
goog.require('goog.net.XhrManager');
goog.require('mbi.data');
goog.require('mbi.gadget.base');
goog.require('ydn.db.Storage');
goog.require('ydn.db.sync');


/**
 * @private
 * @type {ydn.db.Storage}
 */
mbi.data.storage.storage_;


/**
 * @private
 * @type {goog.async.Deferred}
 */
mbi.data.storage.on_storage_ready_df_;


/**
 * @type {goog.debug.Logger}
 */
mbi.data.storage.logger =
    goog.log.getLogger('mbi.data.storage');


/**
 * @param {string} site_name
 * @return {StoreSchema}
 * @private
 */
mbi.data.storage.buildStoreSchema_ = function(site_name) {
  var schema = {
    name: site_name, // page content
    keyPath: 'id.$t',
    type: 'TEXT',
    indexes: [
      {
        name: 'alternate',
        type: 'TEXT'
      }, {
        name: 'sites$parent',
        type: 'TEXT'
      }, {
        name: 'updated.$t',
        type: 'TEXT'
      }, {
        name: 'sites$pageName.$t',
        type: 'TEXT'
      }, {
        name: 'published.$t',
        type: 'TEXT'
      }],
    Sync: {
      format: 'gdata-sites',
      prefetch: 'full',
      prefetchRefractoryPeriod: 5 * 60 * 1000,
      Options: {
        kind: 'webpage',
        domain: mbi.app.base.TOPIC_DOMAIN_NAME,
        siteName: site_name
      }
    }
  };

  return /** @type {StoreSchema} */ (/** @type {Object} */ (schema));
};


/**
 * @const
 * @type {DatabaseSchema}
 */
mbi.data.storage.schema =
    /** @type {DatabaseSchema} */ (/** @type {Object} */ ({
      version: 22,
      stores: [
        {
          name: 'page', // page relationship data
          keyPath: 'url'
        },
        {
          name: mbi.app.base.STORE_NAME_DEFINITION,
          keyPath: 'name',
          type: 'TEXT'
        },
        {
          name: mbi.app.base.STORE_NAME_MODULES,
          keyPath: 'name',
          type: 'TEXT'
        },
        {
          name: mbi.app.base.STORE_NAME_DATA // general data
        },
        mbi.data.storage.buildStoreSchema_(mbi.app.base.TOPIC_SITE_NAME)
      ]
    }));


/**
 * Update meta-data.js field value.
 * @param {string} key
 * @param {*} value
 * @return {goog.async.Deferred}
 */
mbi.data.updateMetaDataValue = function(key, value) {
  var nimp = true;
  if (nimp) {
    return goog.async.Deferred.fail('not implemented');
  }
  var url = 'https://mbinfo.storage.googleapis.com/meta-data-update.js';
  var xm = mbi.app.shared.getXhrManager();
  var df = new goog.async.Deferred();
  xm.send(url, url, 'GET', null, null, undefined, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    var json = {};
    if (xhr.getStatus() == 200) {
      json = JSON.parse(xhr.getResponseText());
    }
    ydn.db.utils.setValueByKeys(/** @type {Object} */ (json), key, value);
    var headers = {
      'content-type': 'application/javascript'
    };
    var body = JSON.stringify(json);
    xm.send(url, url, 'PUT', body, headers, undefined, function(e) {
      var xhr = /** @type {goog.net.XhrIo} */ (e.target);
      df.callback(xhr.getStatus());
    });
  });
  return df;
};


/**
 * Retrieve cache data from database to server. If data is found in database,
 * this return immediately from the database data.
 * @param {string} url
 * @return {goog.async.Deferred}
 */
mbi.data.getCacheData = function(url) {
  var df = new goog.async.Deferred();
  var client = mbi.app.shared.getClient();
  mbi.data.storage.onStorageReady(function(db) {

    var load = function(headers) {
      var hd = new ydn.client.HttpRequestData(url, 'GET', null, headers);
      client.request(hd).execute(function(json, raw) {
        if (raw.getStatus() == 200 && json) {
          var etag = raw.getHeader('etag');
          if (etag) {
            json['_etag'] = etag;
          }
          db.put(mbi.app.base.STORE_NAME_DATA, json, url);
          if (!df.hasFired()) {
            df.callback(json);
          }
        } else if (raw.getStatus() == 309) {
          // df.callback(data); already called
        } else {
          if (!df.hasFired()) {
            df.callback(null); // likely 404
          }
        }
      });
    };

    db.get(mbi.app.base.STORE_NAME_DATA, url).addCallback(function(data) {
      if (data && data['_etag']) {
        var params = {
          'if-none-match': data['_etag']
        };
        if (data) {
          df.callback(data); // callback quickly and don't wait for server data.
        }
        load(params);
      } else {
        load(null);
      }
    });
  });
  return df;
};


/**
 * Update cache data. Data is updated only when different in the database.
 * @param {string} url
 * @param {!Object} data
 * @return {!goog.async.Deferred} true if updated.
 */
mbi.data.updateCacheData = function(url, data) {
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT) ||
      mbi.app.shared.getClient();
  var db = mbi.data.storage.getStorage();
  if (!data || (goog.isObject(data) && goog.object.isEmpty(data)) ||
      (goog.isArray(data) && data.length == 0)) {
    return goog.async.Deferred.succeed(false);
  }
  return db.get(mbi.app.base.STORE_NAME_DATA, url).addCallback(function(xdata) {
    var headers = {
      'content-type': 'application/json'
    };
    if (!xdata || !ydn.object.equals(data, xdata)) {
      db.put(mbi.app.base.STORE_NAME_DATA, data, url);
      var body = JSON.stringify(data);
      var hd = new ydn.client.HttpRequestData(url, 'PUT', null, headers, body);
      client.request(hd).execute(function(json, raw) {
        // OK.
      }, this);
      return true;
    } else {
      return false;
    }
  });
};


/**
 * Get all records from the bucket.
 * @param {string} store
 * @return {goog.async.Deferred}
 */
mbi.data.storage.getAllData = function(store) {
  var url = mbi.app.base.protocol + '//' +
      mbi.app.base.DATA_BUCKET + '.storage.googleapis.com/all/' + store;
  var xm = mbi.app.shared.getXhrManager();
  var df = new goog.async.Deferred();
  xm.send(url, url, 'GET', null, null, undefined, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    // mbi.data.storage.logger.finest('req ' + xhr.getLastUri() + ' get ' + xhr.getStatus());
    if (xhr.getStatus() == 200) {
      var json = JSON.parse(xhr.getResponseText());
      df.callback(json);
    } else {
      df.errback(xhr.getStatusText());
    }
  });
  return df;
};


/**
 * Populate store.
 * @param {string} store
 * @return {goog.async.Deferred}
 */
mbi.data.storage.populate = function(store) {
  return mbi.data.storage.getAllData(store).addCallback(function(json) {
    mbi.data.storage.storage_.clear(store);
    return mbi.data.storage.storage_.put(store, /** @type {!Object} */ (json));
  });
};


/**
 * @return {ydn.db.Storage}
 */
mbi.data.storage.getStorage = function() {
  if (!mbi.data.storage.storage_) {
    mbi.data.storage.on_storage_ready_df_ = new goog.async.Deferred();
    var db_name = mbi.app.base.SITE_DB_NAME;
    var options = {
      // 'mechanisms': ['websql'],
      'policy': 'single',
      'isSerial': false
    };
    var options_json =
        /** @type {!StorageOptions} */ (/** @type {Object} */ (options));
    mbi.data.storage.storage_ =
        new ydn.db.Storage(db_name, mbi.data.storage.schema, options_json);

    var bucket = mbi.app.base.DATA_BUCKET;

    mbi.data.storage.storage_.addEventListener('fail', function(e) {
      var err = e.getError();
      var msg = 'database ' + db_name + ' fail ' + err.message;
      if (!mbi.data.storage.on_storage_ready_df_.hasFired()) {
        mbi.data.storage.on_storage_ready_df_.errback(err);
        msg = 'Opening ' + msg;
      }
      mbi.data.storage.logger.severe(msg);
      mbi.data.storage.storage_ = null;
    });

    var counts = goog.global['metaWikiCounts'] || [
      {name: 'page', count: 133},
      {name: mbi.app.base.STORE_NAME_DEFINITION, count: 100}
    ];

    mbi.data.storage.storage_.addEventListener('ready', function(e) {
      mbi.data.storage.logger.finest(mbi.data.storage.storage_ + ' ready');
      if (e.getVersion() != e.getOldVersion()) {
        var xm = mbi.app.shared.getXhrManager();
        var dfs = [];
        for (var i = 0; i < counts.length; i++) {
          dfs.push(mbi.data.storage.populate(counts[i].name));
        }
        var df = new goog.async.DeferredList(dfs);
        df.addBoth(function() {
          mbi.data.storage.on_storage_ready_df_.callback(
              mbi.data.storage.storage_);
        });
      } else {
        mbi.data.storage.on_storage_ready_df_.callback(
            mbi.data.storage.storage_);
        // check data consistency.
        // here, we are concern that user exit the page while populating the
        // database, storing only partial data.
        // about count are collected by
        // http://localhost/mbinfo-app-script/tools/upload/read-data.html
        goog.Timer.callOnce(function() {
          for (var i = 0; i < counts.length; i++) {
            mbi.data.storage.storage_.count(counts[i].name).addCallback(
                function(cnt) {
                  if (cnt != this.count) {
                    mbi.data.storage.logger.warning('expect to have ' +
                        this.count + ' but found ' + cnt + ' in ' +
                        this.name + ' store');
                  }
                  if (cnt < this.count || this['exact'] && (cnt != this.count)) {
                    mbi.data.storage.populate(this.name);
                  }
                }, counts[i]);
          }
        }, 1);
      }
    });
  }
  return mbi.data.storage.storage_;
};


/**
 * @param {function(this: T, ydn.db.Storage)} cb callback when storage ready.
 * @param {T=} opt_obj this object.
 * @template T
 */
mbi.data.storage.onStorageReady = function(cb, opt_obj) {
  mbi.data.storage.getStorage();
  mbi.data.storage.on_storage_ready_df_.addCallback(function(db) {
    cb.call(opt_obj, db);
  }, opt_obj);
};
