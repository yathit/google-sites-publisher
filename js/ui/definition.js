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
 * @fileoverview Definition panel.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui.Definition');
goog.require('goog.events.KeyHandler');
goog.require('ydn.client');
goog.require('ydn.gdata.Entry');



/**
 * Definition panel.
 * @param {boolean=} opt_is_admin
 * @constructor
 */
mbi.ui.Definition = function(opt_is_admin) {
  /**
   * @protected
   * @type {boolean}
   */
  this.is_admin_app = !!opt_is_admin;
  /**
   * @type {Element}
   * @private
   */
  this.ele_ = null;
  /**
   * Update status. Null indicate no started.
   * @type {boolean?}
   * @private
   */
  this.updated_ = null;
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.ui.Definition.prototype.logger =
    goog.log.getLogger('mbi.ui.Definition');


/**
 * @define {boolean} debug flag
 */
mbi.ui.Definition.DEBUG = goog.DEBUG;


/**
 * Render ui.
 * @param {Element} ele
 */
mbi.ui.Definition.prototype.decorate = function(ele) {
  this.ele_ = ele;
  goog.style.setElementShown(ele, true);
  var input = goog.dom.getElementsByTagNameAndClass('input', null, this.ele_)[0];
  goog.events.listen(input, [goog.events.EventType.CLICK, goog.events.EventType.FOCUS,
    goog.events.EventType.KEYDOWN], this.handleInputChange_, false, this);
  var kh = new goog.events.KeyHandler(input);
  goog.events.listen(kh, goog.events.KeyHandler.EventType.KEY, function(e) {
    var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
    if (keyEvent.keyCode == goog.events.KeyCodes.ENTER) {
      this.showDefinition(e);
    }
  }, true, this);
  goog.events.listen(input, goog.events.EventType.CHANGE, this.showDefinition, false, this);
  var show_update = this.ele_.querySelector('a[name=show-update]');
  goog.events.listen(show_update, 'click', function(e) {
    var panel = this.ele_.querySelector('div[name=upload-panel]');
    goog.style.setElementShown(panel, !goog.style.isElementShown(panel));
  }, true, this);
  var btn_upload = this.ele_.querySelector('button');
  goog.events.listen(btn_upload, 'click', function(e) {
    this.upload();
  }, true, this);
  var db = mbi.data.storage.getStorage();
  db.keys(mbi.app.base.STORE_NAME_DEFINITION, null, 100).addCallback(function(keys) {
    var fg = document.createDocumentFragment();
    for (var i = 0; i < keys.length; ++i) {
      var opt = document.createElement('option');
      opt.value = keys[i];
      fg.appendChild(opt);
    }
    var ele_hint = document.getElementById('definition-search-hint');
    ele_hint.innerHTML = '';
    ele_hint.appendChild(fg);
  }, this);

};


/**
 * @param {Event} e
 * @private
 */
mbi.ui.Definition.prototype.handleInputChange_ = function(e) {
  this.update();
};


/**
 * File name: Definitions
 * @const
 * @type {string}
 */
mbi.ui.Definition.KEY_DOC = '0AgmoH1Ln0gK1dFA5Ym5LNWVqNWE3SU9VdnQ0Mnd6SEE';


/**
 * @param {string=} opt_projection full or basic (default)
 * @return {string}
 */
mbi.ui.Definition.prototype.getBaseUri = function(opt_projection) {
  var projection = opt_projection || 'basic';
  return 'https://spreadsheets.google.com/feeds/worksheets/' + mbi.ui.Definition.KEY_DOC +
      '/private/' + projection;
};


/**
 * @protected
 * @param e
 */
mbi.ui.Definition.prototype.showDefinition = function(e) {
  var ele_input = this.ele_.querySelector('input');
  var name = ele_input.value.trim();
  var ele_def = this.ele_.querySelector('div.definition');
  goog.style.setElementShown(ele_def, false);
  if (name) {
    var db = mbi.data.storage.getStorage();
    var kr = ydn.db.KeyRange.starts(name);
    db.values(mbi.app.base.STORE_NAME_DEFINITION, kr, 1).addCallback(function(arr) {
      if (arr[0]) {
        ele_def.textContent = arr[0]['definition'];
        ele_input.value = arr[0]['name'];
        goog.style.setElementShown(ele_def, true);
      }
    }, this);
  }
};


/**
 * @const
 * @type {string}
 */
mbi.ui.Definition.URL_DATA = 'https://mbi-data.storage.googleapis.com/all/' +
    mbi.app.base.STORE_NAME_DEFINITION;


/**
 * Upload data
 */
mbi.ui.Definition.prototype.upload = function() {
  if (this.updated_ !== true) {
    return;
  }

  var db = mbi.data.storage.getStorage();
  db.values(mbi.app.base.STORE_NAME_DEFINITION, null, 1000).addCallback(function(entries) {
    var headers = {
      'content-type': 'application/json'
    };
    var body = JSON.stringify(entries);
    var hrd = new ydn.client.HttpRequestData(mbi.ui.Definition.URL_DATA, 'PUT', null, headers, body);
    var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
    client.request(hrd).execute(function(d, raw) {
      this.logger.finer('Uploaded ' + raw.getStatus());
    }, this);
    var counts = goog.global['metaWikiCounts'];
    goog.asserts.assertArray(counts);
    for (var i = 0; i < counts.length; i++) {
      if (counts[i]['name'] == 'definition') {
        if (counts[i]['count'] != entries.length) {
          counts[i]['count'] = entries.length;
          mbi.data.updateMetaDataValue('metaWikiCounts', counts);
        } else {
          this.logger.finer('No definition count updated require.');
        }
      }
    }
  }, this);
};


/**
 * Update definition reading from source spreadsheet.
 */
mbi.ui.Definition.prototype.update = function() {
  if (!this.is_admin_app || !goog.isNull(this.updated_)) {
    return;
  }
  this.logger.finer('Updating');
  this.updated_ = false;
  var admin_ele = this.ele_.querySelector('div[name=admin]');
  goog.style.setElementShown(admin_ele, true);
  var db = mbi.data.storage.getStorage();
  db.count(mbi.app.base.STORE_NAME_DEFINITION).addCallback(function(cnt) {
    var ele = this.ele_.querySelector('span[name=db-count]');
    ele.textContent = cnt;
    this.retrieveData(function(json) {
      var arr = [];
      for (var name in json) {
        arr.push({
          'name': name,
          'definition': json[name]
        });
      }
      var ele = this.ele_.querySelector('span[name=source-count]');
      ele.textContent = arr.length;
      db.clear(mbi.app.base.STORE_NAME_DEFINITION).addCallback(function() {
        db.put(mbi.app.base.STORE_NAME_DEFINITION, arr).addCallback(function() {
          this.updated_ = true;
          var show_update = this.ele_.querySelector('a[name=show-update]');
          goog.style.setElementShown(show_update, true);
        }, this);
      }, this);
    });
  }, this);

};


/**
 * Update definition reading from source spreadsheet.
 * @param {function(this: mbi.ui.Definition, Object)} cb
 */
mbi.ui.Definition.prototype.retrieveData = function(cb) {
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
      var entries = /** @type {Array.<GDataEntry>} */ (json.feed.entry);
      for (var i = 1; i < entries.length; i++) {
        var entry = entries[i];
        var def = entry['gsx$definition'];
        var name = entry['gsx$name'];
        if (i == 1) {
          goog.asserts.assert(name, 'name column missing');
          goog.asserts.assert(name, 'definition column missing');
        }
        name = name['$t'].toLowerCase().trim().replace(/"/g, '').trim();
        def = def['$t'].trim().replace(/"/g, '').trim();
        rows[name] = def;
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
    window.console.log(json);
    var entry = new ydn.gdata.Entry(/** @type {!GDataEntry} */ (json.feed.entry[0]));
    var link = entry.getLink(ydn.atom.Link.Rel.LIST_FEED);
      getRows(link.href);
  }, this);
};



