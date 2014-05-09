// The MIT License (MIT)
// Copyright © 2012 Mechanobiology Institute, National University of Singapore.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


/**
 * @fileoverview Read, update and cache meta data of a google storage bucket.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.data.Bucket');
goog.provide('mbi.data.Object');
goog.require('goog.Uri');
goog.require('goog.async.Deferred');
goog.require('goog.log');
goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('mbi.app.base');
goog.require('mbi.utils.xml');



/**
 * Create a google storage bucket.
 * @param {string} name bucket name.
 * @param {string=} opt_prefix key prefix.
 * @param {boolean=} opt_immutable sorted key immutable database.
 * @param {number=} opt_intv check for update interval in minute.
 * @constructor
 * @extends {goog.events.EventTarget}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 * @struct
 */
mbi.data.Bucket = function(name, opt_prefix, opt_immutable, opt_intv) {
  goog.base(this);
  /**
   * @final
   * @type {string}
   */
  this.name = name;
  /**
   * @final
   * @type {string?}
   */
  this.prefix = opt_prefix || null;
  /**
   * @protected
   * @type {goog.Timer}
   */
  this.timer = null;
  if (opt_intv) {
    var interval = 60 * 1000 * opt_intv;
    this.timer = new goog.Timer(interval);
    goog.events.listen(this.timer, goog.Timer.TICK, this.onTick, false, this);
    this.timer.start();
    // setting interval after start, make timer tick immediately.
    // this.timer.setInterval(interval);
  }
  /**
   * Sorted object meta.
   * @type {Array}
   */
  this.items = [];
  /**
   * Store meta data separately, due to bug in PATCH request.
   * @protected
   * @type {boolean}
   */
  this.immutable = !!opt_immutable;
  /**
   * @type {goog.async.Deferred}
   * @private
   */
  this.fetch_df_ = null;
  /**
   * @type {goog.async.Deferred}
   * @private
   */
  this.ready_df_ = null;
};
goog.inherits(mbi.data.Bucket, goog.events.EventTarget);


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.data.Bucket.prototype.logger =
    goog.log.getLogger('mbi.data.Bucket');


/**
 * Change event.
 * @type {string}
 */
mbi.data.Bucket.CHANGED = 'ch';


/**
 * Bucket name.
 * @return {string}
 */
mbi.data.Bucket.prototype.getName = function() {
  return this.name;
};


/**
 * Bucket web domain.
 * @return {string}
 */
mbi.data.Bucket.prototype.getDomain = function() {
  if (/\./.test(this.name)) {
    return this.name;
  } else {
    return this.name + '.storage.googleapis.com';
  }
};


/**
 * Get all items.
 * @return {Array}
 */
mbi.data.Bucket.prototype.list = function() {
  return this.items;
};


/**
 * Get object url.
 * @param {string|!mbi.data.Object} obj_name item or object name.
 * @return {string} url.
 */
mbi.data.Bucket.prototype.url = function(obj_name) {
  var name = goog.isString(obj_name) ? obj_name : obj_name.getName();
  var pt = mbi.data.Object.getProtocol();
  return pt + '//' + this.name + '.storage.googleapis.com/' + name;
};


/**
 * @param {Event} e
 */
mbi.data.Bucket.prototype.onTick = function(e) {
  // this.fetch();
};


/**
 * @return {number}
 */
mbi.data.Bucket.prototype.count = function() {
  return this.isReady() ? this.items.length : NaN;
};


/**
 * @param {number} idx index.
 * @return {mbi.data.Object} meta data. Bucket meta object should be treat as
 * immutable.
 */
mbi.data.Bucket.prototype.get = function(idx) {
  if (!this.isReady()) {
    throw new Error('Bucket not ready');
  }
  return new mbi.data.Object(this.items[idx]);
};


/**
 * Find index of object name.
 * @param {string} name
 * @return {number}
 * @private
 */
mbi.data.Bucket.prototype.indexOf_ = function(name) {
  return goog.array.binarySearch(this.items, {'name': name},
      mbi.data.Bucket.cmp);
};


/**
 * Get meta data of an object by object name. All meta data in the bucket must
 * be already loaded.
 * @param {string} name object name.
 * @return {mbi.data.Object} meta data.
 */
mbi.data.Bucket.prototype.getByName = function(name) {
  if (!this.isReady()) {
    throw new Error(this + ' not ready');
  }
  var idx = this.indexOf_(name);
  if (idx >= 0 && this.items[idx]['name'] == name) {
    return new mbi.data.Object(this.items[idx]);
  }
  return null;
};


/**
 * @return {mbi.data.Object} return last updated item.
 */
mbi.data.Bucket.prototype.getLastUpdated = function() {
  var last = 0;
  var idx = -1;
  for (var i = 0; i < this.items.length; ++i) {
    var d = new Date(this.items[i]['updated']);
    if (d > last) {
      last = d;
      idx = i;
    }
  }
  return idx < 0 ? null : new mbi.data.Object(this.items[idx]);
};


/**
 * @return {Date} return last updated item.
 */
mbi.data.Bucket.prototype.getLastUpdatedDate = function() {
  var last = this.getLastUpdated();
  return last ? last.getUpdated() : null;
};


/**
 * Compare by name.
 * @param a
 * @param b
 * @return {number}
 */
mbi.data.Bucket.cmp = function(a, b) {
  return a['name'] > b['name'] ? 1 :
      a['name'] < b['name'] ? -1 : 0;
};


/**
 * Fetch all meta data or validate if already fetch.
 * @return {!goog.async.Deferred} callback upon updated, indexes from
 * mbi.data.BucketEvent.
 */
mbi.data.Bucket.prototype.fetch = function() {
  if (this.fetch_df_) {
    return this.fetch_df_;
  }
  this.fetch_df_ = new goog.async.Deferred();
  /**
   * @this {mbi.data.Bucket}
   * @param {Array} items
   */
  var callback = function(items) {
    // dispatch for the changes.
    var indexes = null;
    if (this.items.length > 0) {
      indexes = [];
      for (var i = 0; i < items.length; i++) {
        var idx = goog.array.binarySearch(this.items, items[i],
            mbi.data.Bucket.cmp);
        if (idx < 0) {
          indexes.push(i);
          goog.array.insertAt(this.items, items[i], -(idx + 1));
        } else {
          this.items[idx] = items[i];
          // todo: check for meta update
        }
      }
    } else {
      this.items = items;
    }
    if (!this.ready_df_) {
      this.ready_df_ = this.fetch_df_;
    }
    // this.logger.finer(this + ' fetched ' +  this.items.length);
    this.dispatchEvent(new mbi.data.BucketEvent(this, indexes));
    this.fetch_df_.callback(indexes);
    this.fetch_df_ = null;
  };
  if (this.items.length == 0) {
    this.logger.finer(this + ' fetching');
    this.update_(callback, []);
  } else {
    // todo: optimize
    this.logger.finer(this + ' updating');
    this.update_(callback, []);
  }
  return this.fetch_df_;
};


/**
 * @return {boolean}
 */
mbi.data.Bucket.prototype.isReady = function() {
  return !!this.ready_df_;
};


/**
 * Invoke on ready.
 * @return {goog.async.Deferred}
 */
mbi.data.Bucket.prototype.ready = function() {
  if (!this.ready_df_) {
    this.ready_df_ = this.fetch();
  }
  return this.ready_df_;
};


/**
 * Update meta data.
 * @param {function(this: mbi.data.Bucket, Array)} cb
 * @param {Array} items result item.
 * @param {string=} opt_token page token to continue.
 * @private
 */
mbi.data.Bucket.prototype.update_ = function(cb, items, opt_token) {
  var params = {
    'bucket': this.name
  };
  if (opt_token) {
    params['pageToken'] = opt_token;
  }
  if (this.prefix) {
    params['prefix'] = this.prefix;
  }

  var req = gapi.client.rpcRequest('storage.objects.list',
      mbi.app.base.GAPI_STORAGE_VERSION, params);
  var me = this;
  req.execute(function(result, raw) {
    if (result) {
      var new_items = /** @type {Array} */ (result['items']);
      // window.console.log(items);
      if (goog.isArray(new_items)) { // could be undefined.
        items = items.concat(new_items);
      }
      if (result['nextPageToken']) {
        me.update_(cb, items, result['nextPageToken']);
      } else {
        cb.call(me, items);
      }
    } else {
      me.logger.warning(raw);
      cb.call(me, items);
    }
  });
};


/**
 * @const
 * @type {boolean}
 */
mbi.data.Bucket.USE_GAPI_FOR_PATCH = true;


/**
 * Update object header.
 * @param {mbi.data.Object} obj
 * @return {goog.async.Deferred}
 */
mbi.data.Bucket.prototype.patch = function(obj) {
  var df = new goog.async.Deferred();
  // see bug http://stackoverflow.com/questions/18440052
  var name = obj.getName();
  if (obj.getBucketName() != this.name) {
    throw new Error('bucket name must be ' + this.name + ' but ' +
        obj.getBucketName() + ' found.');
  }

  var params = {
    'bucket': this.name,
    'object': name,
    'projection': 'full',
    'resource': {
      'metadata': obj.getMetaData()
    }
  };
  var req = gapi.client.rpcRequest('storage.objects.patch',
      mbi.app.base.GAPI_STORAGE_VERSION, params);
  var me = this;
  var index = this.indexOf_(name);
  req.execute(function(json, raw) {
    // window.console.log(json, raw);
    if (json) {
      if (json['error']) {
        df.errback(json['error']['code'] + ' ' + json['error']['message']);
      } else {
        if (index >= 0) {
          me.dispatchEvent(new mbi.data.BucketEvent(me, [index]));
        }
        df.callback();
      }
    } else {
      df.errback(new Error(raw));
    }
  });

  return df;
};


/**
 * Delete an object in the bucket.
 * @param {mbi.data.Object} obj
 * @return {goog.async.Deferred}
 */
mbi.data.Bucket.prototype.delete = function(obj) {
  var name = obj.getName();
  if (obj.getBucketName() != this.name) {
    throw new Error('bucket name must be ' + this.name + ' but ' +
        obj.getBucketName() + ' found.');
  }
  var params = {
    'bucket': this.name,
    'object': name
  };
  var df = new goog.async.Deferred();
  var req = gapi.client.rpcRequest('storage.objects.delete',
      mbi.app.base.GAPI_STORAGE_VERSION, params);

  var index = this.indexOf_(name);
  var me = this;
  req.execute(function(json, raw) {
    // window.console.log(json, raw);
    if (json && json['error']) {
      df.errback();
    } else {
      obj.setDeleted();
      if (index >= 0) {
        // console.log('delete ' + index)
        me.dispatchEvent(new mbi.data.BucketEvent(me, [index]));
      }
      df.callback();
    }
  });

  return df;
};


/**
 * @inheritDoc
 */
mbi.data.Bucket.prototype.toString = function() {
  return 'GcsBucket:' + this.name;
};



/**
 * Object meta data in the bucket.
 * @param {Object} meta_data
 * @constructor
 * @struct
 */
mbi.data.Object = function(meta_data) {
  /**
   * @final
   * @protected
   * @type {Object}
   */
  this.data = meta_data;
};


/**
 * Object name.
 * @return {string} Object name.
 */
mbi.data.Object.prototype.getName = function() {
  return this.data['name'];
};


/**
 * Object name.
 * @return {string} Object name.
 */
mbi.data.Object.prototype.getGeneration = function() {
  return this.data['generation'];
};


/**
 * Bucket name.
 * @return {string} Bucket name.
 */
mbi.data.Object.prototype.getBucketName = function() {
  return this.data['bucket'];
};


/**
 * Get a suitable protocol.
 * @return {string}
 */
mbi.data.Object.getProtocol = function() {
  return goog.string.startsWith(window.location.protocol, 'http') ?
      window.location.protocol : 'https:';
};


/**
 * Get object url to make a request.
 * @param {boolean=} opt_no_https do not use https, but use http instead.
 * @return {string} url.
 */
mbi.data.Object.prototype.getUrl = function(opt_no_https) {
  var name = this.getName();
  var bucket = this.getBucketName();
  var pt = opt_no_https ? 'http:' : mbi.data.Object.getProtocol();
  return pt + '//' + bucket + '.storage.googleapis.com/' + name;
};


/**
 * Equality check.
 * @param {mbi.data.Object} obj
 * @return {boolean} true if same object.
 */
mbi.data.Object.prototype.equals = function(obj) {
  return this.getBucketName() == obj.getBucketName() &&
      this.getName() == obj.getName();
};


/**
 * Get meta data.
 * @return {!Object}
 */
mbi.data.Object.prototype.getMetaData = function() {
  return goog.object.clone(this.data['metadata']);
};


/**
 * Get updated date.
 * @return {Date}
 */
mbi.data.Object.prototype.getUpdated = function() {
  return new Date(this.data['updated']);
};


/**
 * Set deleted status.
 */
mbi.data.Object.prototype.setDeleted = function() {
  this.data['_deleted'] = true;
};


/**
 * Get deleted status.
 * @return {boolean}
 */
mbi.data.Object.prototype.isDeleted = function() {
  return !!this.data['_deleted'];
};


/**
 * Get meta data value.
 * @param {string} name
 * @return {string|undefined}
 */
mbi.data.Object.prototype.getMeta = function(name) {
  if (this.data['metadata']) {
    return /** @type {string} */ (this.data['metadata'][name]);
  } else {
    return undefined;
  }
};


/**
 * Set meta data.
 * @param {string} name
 * @param {string} value
 * @return {boolean} true if updated.
 */
mbi.data.Object.prototype.setMeta = function(name, value) {
  if (!this.data['metadata']) {
    this.data['metadata'] = {};
  }
  if (this.data['metadata'][name] == value) {
    return false;
  } else {
    this.data['metadata'][name] = value;
    return true;
  }
};


/**
 * Create an object by name.
 * @param {string} bucket
 * @param {string} name
 * @return {!mbi.data.Object}
 */
mbi.data.Object.byName = function(bucket, name) {
  return new mbi.data.Object({
    'bucket': bucket,
    'name': name
  });
};


/**
 * Create an object by url.
 * @param {string} url
 * @return {mbi.data.Object}
 */
mbi.data.Object.byUrl = function(url) {
  var m = url.match(/\/\/(.+?)\.storage\.googleapis\.com\/(.+)/);
  if (m) {
    return mbi.data.Object.byName(m[1], m[2]);
  } else {
    return null;
  }
};


/**
 * @type {ydn.client.Client}
 * @private
 */
mbi.data.Object.xhr_;


/**
 * @return {ydn.client.Client}
 */
mbi.data.Object.getClient = function() {
  if (!mbi.data.Object.xhr_) {
    mbi.data.Object.xhr_ = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT) ||
        ydn.client.getClient(ydn.http.Scopes.DEFAULT);
  }
  return mbi.data.Object.xhr_;
};


/**
 * Set default xhr.
 * @param {ydn.client.Client} xhr
 */
mbi.data.Object.setClient = function(xhr) {
  mbi.data.Object.xhr_ = xhr;
};


/**
 * Get versions meta data of the object.
 * @return {goog.async.Deferred} return history of the object.
 */
mbi.data.Object.prototype.history = function() {
  var df = new goog.async.Deferred();
  var use_gapi = false;
  var name = this.getName();
  if (use_gapi) {
    // GAPI does not return result for versions request.
    var params = {
      'bucket': this.getBucketName(),
      'versions': true,
      'prefix': name
    };
    // console.log(params);
    var req = gapi.client.rpcRequest('storage.buckets.get',
        mbi.app.base.GAPI_STORAGE_VERSION, params);
    req.execute(function(json, row) {
      if (json) {
        df.callback(json);
      } else {
        df.errback();
        throw new Error(row);
      }
    });
  } else {
    var xm = mbi.data.Object.getClient();
    var uri = new goog.Uri(this.getUrl());

    uri.setParameterValue('versions', 'true');
    uri.setParameterValue('max-keys', '25');
    uri.setParameterValue('prefix', name);
    var url = uri.setPath('').toString();
    var rd = new ydn.client.HttpRequestData(url, 'GET');
    var rq = xm.request(rd);
    rq.execute(function(json, e) {
      var xhr = /** @type {ydn.client.HttpRespondData} */ (e);
      if (xhr.isSuccess()) {
        var xml = goog.dom.xml.loadXml(/** @type {string} */ (xhr.getBody()));
        // console.log(xml);
        json = mbi.utils.xml.xml2json(xml);
        var items = json['ListBucketResult']['Version'];
        var versions = goog.isArray(items) ? items : items ? [items] : [];
        versions = versions.filter(function(x) {
          var key = x['Key'];
          key = key['$t'] ? key['$t'] : key;
          return key == name;
        });
        df.callback(versions);
      } else {
        df.errback(xhr.getStatus() + ' ' + xhr.getStatusText());
      }
    }, this);
  }
  return df;
};


/**
 * Parse HTTP headers.
 * @param {string} s
 * @returns {Object}
 */
mbi.data.Bucket.parseHeaders = function(s) {
  var header_lines = s.split('\n');
  var headers = {};
  for (var i = 0; i < header_lines.length; i++) {
    var idx = header_lines[i].indexOf(':');
    if (idx > 0) {
      var name = header_lines[i].substr(0, idx).toLowerCase();
      var value = header_lines[i].substr(idx + 1).trim();
      headers[name] = value;
    }
  }
  return headers;
};


/**
 * @param {File|string|Object} file file, HTML string or json object
 * @param {string=} opt_name object name. Default to file.name.
 * @param {Object=} opt_meta optional meta data.
 * @return {goog.async.Deferred} return name of object.
 */
mbi.data.Bucket.prototype.upload = function(file, opt_name, opt_meta) {
  var me = this;
  // update fields
  // upload to server
  var df = new goog.async.Deferred();
  /**
   * @type {string}
   */
  var name = opt_name || '';
  var type = 'text/html';
  if (opt_meta && goog.isString(opt_meta['content-type'])) {
    type = opt_meta['content-type'];
    delete opt_meta['content-type'];
  }
  if (file instanceof File) {
    if (!name) {
      name = file.name;
    }
    type = file.type;
  } else {
    if (!name) {
      throw new Error('object name required.');
    }
    if (goog.isObject(file)) {
      file = JSON.stringify(file);
      type = 'application/json';
    }
  }
  if (!opt_name && this.immutable) {
    var m = file.name.match(/\.\w{2,4}$/);
    var ext = m ? m[0] : '';
    name = goog.now() + ext;
  }
  var token = gapi.auth.getToken();
  var domain = /\./.test(this.name) ? 'storage.googleapis.com/' + this.name :
      this.name + '.storage.googleapis.com';
  if (this.prefix && !goog.string.startsWith(name, this.prefix)) {
    // add prefix to the key if necessary.
    name = this.prefix + name;
  }
  var url = mbi.data.Object.getProtocol() + '//' +
      domain + '/' + name;
  var use_xhr = true;
  /**
   * @param {number} status
   * @param {Object} headers
   */
  var receive = function(status, headers) {
    // window.console.log(headers);
    if (status == 201 || status == 200) {
      var msg = status + ' uploaded ';
      var idx = me.indexOf_(name);
      // window.console.log(xhr.response);
      var ev;
      if (idx >= 0) {
        ev = new mbi.data.Bucket.ObjectEvent(
            mbi.data.Bucket.EventType.UPDATED, idx, name);
      } else {
        var obj = {
          'bucket': me.name,
          'name': name,
          'metadata': headers
        };
        idx = goog.array.insertAt(me.items, obj, -(idx + 1)) || 0;
        ev = new mbi.data.Bucket.ObjectEvent(
            mbi.data.Bucket.EventType.CREATED, /** @type {number} */ (idx), name);
        msg += ' as new object ';
      }
      if (headers['etag']) {
        me.items[idx]['etag'] = headers['etag'];
      }
      if (headers['x-goog-generation']) {
        me.items[idx]['generation'] = headers['x-goog-generation'];
      }
      if (headers['x-goog-metageneration']) {
        me.items[idx]['metageneration'] = headers['x-goog-metageneration'];
      }
      // me.logger.finest(name + msg);
      df.callback(name);
      me.dispatchEvent(ev);
    } else {
      me.logger.warning('uploading ' + name + ' receive ' + status);
      df.errback(name);
    }
  };
  if (use_xhr) {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', url, true);
    var sig = 'Bearer ' + token.access_token;
    xhr.setRequestHeader('Authorization', sig);
    xhr.setRequestHeader('Content-Type', type);
    if (opt_meta) {
      for (var key in opt_meta) {
        xhr.setRequestHeader('x-goog-meta-' + key, opt_meta[key]);
      }
    }
    xhr.setRequestHeader('x-goog-api-version', '2');
    // console.log(sig);
    xhr.addEventListener('progress', function(e) {
      if (e.lengthComputable) {
        me.logger.fine((e.loaded / e.total) + ' %');
      }
    }, false);
    xhr.addEventListener('load', function(e) {
      receive(xhr.status, mbi.data.Bucket.parseHeaders(xhr.getAllResponseHeaders()));
    }, false);
    xhr.send(file);
  } else {
    var xm = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT); // fixme, we no longer use gapi
    var headers = {
      'Content-Type': type
    };
    if (opt_meta) {
      for (var key in opt_meta) {
        headers['x-goog-meta-' + key] = opt_meta[key];
      }
    }
    var hd = new ydn.client.HttpRequestData(url, 'PUT', null, headers, file);
    var rq = xm.request(hd);
    rq.execute(function(json, e) {
      var xhr = /** @type {ydn.client.HttpRespondData} */ (e);
      if (xhr.isSuccess()) {
        receive(xhr.getStatus(), xhr.getHeaders());
      } else {
        me.logger.warning('publishing to ' + url + ' failed: ' +
            xhr.getStatus() + ' [' + xhr.getStatusText() + ']');
      }
    }, this);
  }
  return df;
};


/**
 * @enum {string}
 */
mbi.data.Bucket.EventType = {
  UPDATED: 'up',
  CREATED: 'cr',
  DELETED: 'dr'
};



/**
 * @param {Object} target Reference target.
 * @param {Array?} indexes null for first read. list of index for update.
 * @constructor
 * @extends {goog.events.Event}
 */
mbi.data.BucketEvent = function(target, indexes) {
  goog.base(this, mbi.data.Bucket.CHANGED, target);
  /**
   * @type {Array?}
   */
  this.indexes = indexes;
};
goog.inherits(mbi.data.BucketEvent, goog.events.Event);



/**
 * Object updated event.
 * @param {mbi.data.Bucket.EventType} type event type.
 * @param {number} idx index position.
 * @param {string} name file name.
 * @constructor
 * @extends {goog.events.Event}
 */
mbi.data.Bucket.ObjectEvent = function(type, idx, name) {
  goog.base(this, type);
  /**
   * @type {number}
   */
  this.index = idx;
  /**
   * @type {string}
   */
  this.name = name;
};
goog.inherits(mbi.data.Bucket.ObjectEvent, goog.events.Event);




