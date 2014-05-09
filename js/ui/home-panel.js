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
 * @fileoverview Image base navigation.
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */



goog.provide('mbi.ui.HomePanel');
goog.require('goog.style');
goog.require('mbi.ui.IVisible');



/**
 * @param {mbi.admin.Updater} updater
 * @constructor
 * @implements {mbi.ui.IVisible}
 */
mbi.ui.HomePanel = function(updater) {
  /**
   * @protected
   * @type {Element}
   */
  this.root = null;
  /**
   * @protected
   * @type {mbi.admin.Updater}
   */
  this.updater = updater;
};


/**
 * @param {Element} ele
 */
mbi.ui.HomePanel.prototype.init = function(ele) {
  this.root = ele;
  goog.soy.renderElement(ele, templ.mbi.app.adminapp.gdrivePanel);
  var details = ele.querySelector('details');
  goog.events.listen(details, 'click', this.prepare, false, this);
  goog.events.listen(ele, 'click', this.publish, false, this);
};


/**
 * MBInfo website Google Drive root folder it.
 * @type {string}
 * @const
 */
mbi.ui.HomePanel.FOLDER_ID = '0BzkEGxM0lYcRMzR4aTI2cVBtYTQ';


/**
 * @return {string}
 */
mbi.ui.HomePanel.prototype.getBaseUri = function() {
  return 'https://www.googleapis.com/drive/v2/files/' + mbi.ui.HomePanel.FOLDER_ID +
      '/';
};


/**
 * @param {Event} e
 */
mbi.ui.HomePanel.prototype.prepare = function(e) {
  if (this.root.querySelector('ul').childElementCount > 0) {
    return;
  }
  var uri = 'https://www.googleapis.com/drive/v2/files';
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
  var params = {
    'q': "'" + mbi.ui.HomePanel.FOLDER_ID + "'" + ' in parents and trashed = false',
    'fields': 'items(id,kind,lastModifyingUserName,modifiedDate,title,downloadUrl)'
  };
  var rh = new ydn.client.HttpRequestData(uri, 'GET', params);
  client.request(rh).execute(function(json) {
    // window.console.log(json);
    var fg = document.createDocumentFragment();
    for (var i = 0; i < json.items.length; i++) {
      var item = json.items[i];
      var title = item['title'];
      if (!/\.html$/.test(title)) {
        continue;
      }
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.setAttribute('title', 'Last modified by ' + item['lastModifyingUserName'] +
          ' on ' + new Date(item['modifiedDate']).toLocaleString());
      a.textContent = title;
      a.setAttribute('target', 'googledrive');
      a.href = 'https://googledrive.com/host/0BzkEGxM0lYcRMzR4aTI2cVBtYTQ/' + item.title;
      var link = item['downloadUrl'];
      li.appendChild(a);
      if (link) {
        var btn = document.createElement('button');
        btn.setAttribute('filename', title);
        btn.setAttribute('data-link', link);
        btn.textContent = 'Publish';
        li.appendChild(btn);
      }
      fg.appendChild(li);
    }
    var ul = this.root.querySelector('ul');
    ul.innerHTML = '';
    ul.appendChild(fg);
  }, this);
};


/**
 * @param {Event} e
 * @return {boolean}
 */
mbi.ui.HomePanel.prototype.publish = function(e) {

  var btn = e.target;
  if (btn.tagName != 'BUTTON') {
    return false;
  }
  var name = btn.getAttribute('filename');
  var uri = btn.getAttribute('data-link');
  if (!uri || !name) {
    return false;
  }
  btn.setAttribute('disabled', '1');
  var client = ydn.client.getClient(ydn.http.Scopes.GOOGLE_CLIENT);
  var rh = new ydn.client.HttpRequestData(uri, 'GET');
  client.request(rh).execute(function(json, raw) {
    if (goog.isString(json) && json.length > 100) {
      var bk = this.updater.getBucketSite();
      bk.upload(json, name).addCallbacks(function(fn) {
        var url = 'http://' + bk.getDomain() + '/' + fn;
        var p = btn.parentElement;
        var a = p.querySelector('a[name=view]');
        if (!a) {
          a = document.createElement('a');
          a.setAttribute('name', 'view');
          a.setAttribute('target', 'www.mechanobio.info');
          p.appendChild(a);
          a.textContent = 'view';
        }
        a.href = url;
        btn.removeAttribute('disabled');
      }, function(e) {
        btn.removeAttribute('disabled');
      }, this);
    }

  }, this);
  return true;
};


/**
 * @param {boolean} value
 */
mbi.ui.HomePanel.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);

};


/**
 * @inheritDoc
 */
mbi.ui.HomePanel.prototype.toString = function() {
  return 'HomePanel';
};
