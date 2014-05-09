// The MIT License (MIT)
// Copyright © 2013 Mechanobiology Institute, National University of Singapore.
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
 * @fileoverview Recent page.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui.FunctionInfoBox');
goog.require('mbi.data.SiteMap');
goog.require('mbi.data.storage');
goog.require('ydn.gdata.site.Page');



/**
 * Recent page.
 * @param {boolean=} opt_is_admin
 * @constructor
 * @struct
 */
mbi.ui.FunctionInfoBox = function(opt_is_admin) {
  /**
   * @protected
   * @type {boolean}
   */
  this.is_admin_app = !!opt_is_admin;
  /**
   * @type {Element}
   */
  this.root = null;
  /**
   * @type {string}
   */
  this.page_name = '';
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.ui.FunctionInfoBox.prototype.logger =
    goog.log.getLogger('mbi.ui.FunctionInfoBox');


/**
 * @define {boolean} debug flag.
 */
mbi.ui.FunctionInfoBox.DEBUG = false;


/**
 * @param {Array.<Array.<Object>>} data
 * @return {!Array.<Object>}
 */
mbi.ui.FunctionInfoBox.prototype.convertMatrix2Records = function(data) {
  var cols = data[0];
  // console.log(cols);
  var records = [];
  for (var i = 3; i < data.length; i++) {
    var row = data[i];
    // console.log(row);
    if (!row || !row[0]) {
      continue;
    }
    var record = {
      'name': row[0]
    };
    for (var j = 3; j < row.length; j++) {
      if (cols[j]) {
        record[cols[j]] = row[j];
      }
    }
    records.push(record);
  }
  if (mbi.ui.FunctionInfoBox.DEBUG) {
    window.console.log(records);
  }
  // transport matrix
  var tr_records = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var name = record['name'];
    for (var key in record) {
      if (key) {

        if (key == 'name') {
          // ok
        } else {
          if (!tr_records[key]) {
            tr_records[key] = {};
            tr_records[key]['name'] = key;
          }
          tr_records[key][name] = record[key];
        }
      }
    }
  }
  for (var key in tr_records) {
    var rec = tr_records[key];
    if (rec['name'] && Object.keys(rec).length > 1) {
      rec['_module'] = true;
      records.push(rec);
    }
  }
  if (mbi.ui.FunctionInfoBox.DEBUG) {
    window.console.log(tr_records);
    window.console.log(records.map(function(x) {return x.name;}));
  }
  return records;
};


/**
 * @param {Event} e
 * @return {boolean}
 */
mbi.ui.FunctionInfoBox.prototype.update = function(e) {
  e.preventDefault();
  var title = 'Module update';
  mbi.app.shared.setStatus(title, 'retrieving data from spreadsheet...');
  this.retrieveData(function(data) {
    if (mbi.ui.FunctionInfoBox.DEBUG) {
      window.console.log(data);
    }
    if (!goog.isArray(data) || !goog.isArray(data[1])) {
      mbi.app.shared.setStatus(title, 'Invalid data');
      return;
    }
    var cols = data[1];
    // console.log(cols);
    var msg = data.length + ' rows ' + cols.length + ' columns read, uploading...';
    mbi.app.shared.setStatus(title, msg);
    var records = this.convertMatrix2Records(/** @type {Array.<Array.<Object>>} */ (data));
    var db = mbi.data.storage.getStorage();
    db.put(mbi.app.base.STORE_NAME_MODULES, records).addCallback(function(keys) {
      var headers = {
        'content-type': 'application/json'
      };
      var body = JSON.stringify(records);
      var hrd = new ydn.client.HttpRequestData(mbi.ui.FunctionInfoBox.URL_DATA, 'PUT', null, headers, body);
      var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
      client.request(hrd).execute(function(d, raw) {
        var msg = ' failed.';
        if (raw.isSuccess()) {
          msg = '.';
        }
        mbi.app.shared.setStatus(title, data.length + ' rows ' + cols.length +
            ' columns read and ' + keys.length + ' recrods uploaded' + msg);
      }, this);
    }, this);
  });

  return true;
};


/**
 * @const
 * @type {string}
 */
mbi.ui.FunctionInfoBox.URL_DATA = 'https://mbi-data.storage.googleapis.com/all/' +
    mbi.app.base.STORE_NAME_MODULES;


/**
 * File name: Definitions
 * @const
 * @type {string}
 */
mbi.ui.FunctionInfoBox.KEY_DOC = '0Al008S3kosepdDZkZlByVGpvLUFWZ3hVZHlzZDVPTnc';


/**
 * @param {string=} opt_projection full or basic (default)
 * @return {string}
 */
mbi.ui.FunctionInfoBox.prototype.getBaseUri = function(opt_projection) {
  var projection = opt_projection || 'basic';
  return 'https://spreadsheets.google.com/feeds/worksheets/' + mbi.ui.FunctionInfoBox.KEY_DOC +
      '/private/' + projection;
};


/**
 * Update definition reading from source spreadsheet.
 * @param {function(this: mbi.ui.FunctionInfoBox, Object)} cb
 */
mbi.ui.FunctionInfoBox.prototype.retrieveData = function(cb) {
  // https://developers.google.com/google-apps/spreadsheets/#working_with_cell-based_feeds
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
  var params = {
    'alt': 'json'
  };

  var me = this;
  var readCells = function(uri) {
    if (!uri) {
      throw new Error('no url');
    }
    var data = new ydn.client.HttpRequestData(uri, 'GET', params);
    client.request(data).execute(function(json, raw) {
      if (mbi.ui.FunctionInfoBox.DEBUG) {
        window.console.log(json);
      }
      var entries = /** @type {Array.<GDataEntry>} */ (json.feed.entry);
      var matrix = [];
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var cell = entry['gs$cell'];
        var i_row = parseInt(cell['row'], 10);
        var i_col = parseInt(cell['col'], 10);
        if (i_row >= 0 && i_col >= 0) {
          if (!matrix[i_row]) {
            matrix[i_row] = [];
          }
          matrix[i_row][i_col] = cell['$t'];
        }
      }
      cb.call(me, matrix);
    }, this);
  };

  var ss = new mbi.data.doc.SpreadSheet(mbi.ui.FunctionInfoBox.KEY_DOC);
  // console.log(ss.getClient());
  ss.fetchSheets().addCallbacks(function() {
    var s0 = ss.getSheet(0);
    s0.fetchCells().addCallback(function() {
      var data = s0.getCells();
      cb.call(this, data);
    }, this);
  }, function(e) {
    throw e;
  }, this);


};


/**
 * Update definition reading from source spreadsheet.
 * @param {function(this: mbi.ui.FunctionInfoBox, Object)} cb
 */
mbi.ui.FunctionInfoBox.prototype.retrieveDataByRows = function(cb) {
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
  var params = {
    'alt': 'json'
  };
  var data = new ydn.client.HttpRequestData(this.getBaseUri('full'), 'GET', params);
  var rows = {};
  var me = this;
  var getRows = function(uri) {
    var data = new ydn.client.HttpRequestData(uri, 'GET', params);
    client.request(data).execute(function(json, raw) {
      if (mbi.ui.FunctionInfoBox.DEBUG) {
        window.console.log(json);
      }
      var entries = /** @type {Array.<GDataEntry>} */ (json.feed.entry);
      for (var i = 2; i < entries.length; i++) {
        var entry = entries[i];
        var col = {};
        var name = entry['gsx$name'];
        goog.asserts.assert(name, 'name column missing');
        name = name['$t'].replace(/"/g, '').trim();
        if (!name) {
          continue;
        }
        for (var key in entry) {
          if (goog.string.startsWith(key, 'gsx$')) {
            var val = entry[key];
            key = key.substr('gsx$'.length).trim();
            if (!key) {
              continue;
            }
            col[key] = val['$t'];
          }
        }
        rows[name] = col;
      }
      var links = /** @type {Array.<AtomLink>} */ (json.feed.link);
      for (var i = 0; i < links.length; i++) {
        if (links[i].rel == ydn.atom.Link.Rel.NEXT) {
          getRows(links[i].href);
          return;
        }
      }
      cb.call(me, rows);
    }, this);
  };

  client.request(data).execute(function(json, raw) {
    if (mbi.ui.FunctionInfoBox.DEBUG) {
      window.console.log(json);
    }
    var entry = new ydn.gdata.Entry(/** @type {!GDataEntry} */ (json.feed.entry[0]));
    var link = entry.getLink(ydn.atom.Link.Rel.LIST_FEED);
    getRows(link.href);
  }, this);
};


/**
 * Render.
 * @param {Element} root
 */
mbi.ui.FunctionInfoBox.prototype.render = function(root) {
  this.root = root;
  if (!this.is_admin_app) {
    return;
  }
  var div = document.createElement('div');
  div.className = 'relevant-pages-panel infobox';
  var h2 = document.createElement('h2');
  var span = document.createElement('span');
  span.textContent = 'Functional Modules';
  /*
  var a = document.createElement('a');
  a.textContent = 'update';
  a.className = 'admin-tool';
  a.href = '#update-modules';
  a.onclick = this.update.bind(this);
  a.setAttribute('title', 'Update from MF spreadsheet data to server');
  */
  h2.appendChild(span);
  // h2.appendChild(a); // update from sitepage page instead.
  div.appendChild(h2);
  div.appendChild(document.createElement('ul'));
  this.root.appendChild(div);

};


/**
 * @param {ydn.gdata.site.Page} page
 */
mbi.ui.FunctionInfoBox.prototype.setModel = function(page) {
  this.page_name = page.getName();
  var db = mbi.data.storage.getStorage();
  var ul = goog.dom.getElementsByTagNameAndClass('ul', null, this.root)[0];
  var panel = this.root.querySelector('.infobox');
  ul.innerHTML = '';

  var appendLink = function(page_name) {
    var kr = ydn.db.KeyRange.only(page_name);
    db.values(mbi.app.base.TOPIC_SITE_NAME, 'sites$pageName.$t', kr).addCallback(function(data) {
      var entry = data[0];
      var li = document.createElement('li');
      if (entry) {
        var page = new ydn.gdata.site.Page(entry);
        var relative_url = page.getUrl().replace(/https?:\/\/[^\/]+\/a\/[^\/]+\/[^\/]+/, '');
        var a = document.createElement('a');
        a.href = relative_url;
        a.textContent = page.getTitle();
        li.appendChild(a);
      } else {
        li.textContent = page_name;
      }
      ul.appendChild(li);
    });
  };
  mbi.app.shared.getModuleSiteMap().addCallback(function(sitemap) {
    db.get(mbi.app.base.STORE_NAME_MODULES, this.page_name).addCallback(function(entry) {
      if (mbi.ui.FunctionInfoBox.DEBUG) {
        window.console.log(this.page_name, entry);
      }
      if (!entry) {
        goog.dom.classes.add(panel, 'empty');
        return;
      }
      var title = entry['_module'] ? 'Functional Modules' : 'Topics';
      var h2 = this.root.querySelector('h2 > span');
      h2.textContent = title;
      var has = false;
      for (var name in entry) {
        if (name && entry[name] == 'Y') {
          has = true;
          appendLink(name);
        }
      }
      if (has) {
        goog.dom.classes.remove(panel, 'empty');
      } else {
        goog.dom.classes.add(panel, 'empty');
      }
    }, this);
  }, this);


};
