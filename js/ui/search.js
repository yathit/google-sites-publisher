/**
 * @fileoverview About this file
 */


goog.provide('mbi.ui.Search');



/**
 * Search
 * @constructor
 */
mbi.ui.Search = function() {

};


/**
 * @define {boolean} debug flag.
 */
mbi.ui.Search.DEBUG = false;


/**
 * Init UI.
 */
mbi.ui.Search.prototype.enterDocument = function() {

  var btn_search = document.getElementById('search-input');
  var content = document.getElementById('section-content');

  if (btn_search && content) {
    goog.events.listen(btn_search, 'change', function(e) {
      this.handleSearch_(btn_search.value);
      return true;
    }, false, this);

    goog.events.listen(btn_search, 'keypress', function(e) {
      if (e.keyCode == 13) {
        this.handleSearch_(btn_search.value);
        return true;
      }
    }, false, this);
  }

};


/**
 * @param {string} q
 * @private
 */
mbi.ui.Search.prototype.handleSearch_ = function(q) {
  if (q.length < 2) {
    return;
  }
  var result_panel = document.getElementById('search-result-panel');
  if (result_panel) {
    this.search(q);
  } else {
    window.location.href = '/cgi?q=' + q;
  }
};


/**
 * @param {string} q
 */
mbi.ui.Search.prototype.search = function(q) {
  var result_panel = document.getElementById('search-result-panel');
  var search_title = document.getElementById('search-title');
  if (!result_panel) {
    var content = document.getElementById('section-content');
    result_panel = document.createElement('div');
    result_panel.id = 'search-result-panel';
    var rightbar = goog.dom.getElement('rightbar');
    if (rightbar) {
      goog.style.setElementShown(rightbar, false);
    }
    content.innerHTML = '';
    search_title = document.createElement('div');
    search_title.id = 'search-title';
    content.appendChild(search_title);
    content.appendChild(result_panel);
  }
  var title = 'Searching "' + q + '"';
  search_title.textContent = title;
  var cx = '001845207996356538189:ifsoc8ngmuq';
  var key = 'AIzaSyA-ld7NSMON2D611Y3j7oLPsCajizXKQwQ';
  var xhr = new XMLHttpRequest();
  var params = ['key=' + key, 'q=' + q, 'cx=' + cx];
  xhr.open('GET', 'https://www.googleapis.com/customsearch/v1?' + params.join('&'), true);
  xhr.onload = function(e) {
    // console.log(xhr.response);
    var resp = JSON.parse(/** @type {string} */ (xhr.response));
    if (mbi.ui.Search.DEBUG) {
      goog.global.console.log(q, resp);
    }
    var n = resp.items ? resp.items.length : 0;
    title += ' found ' + resp['searchInformation']['totalResults'] + ' results and took ' +
        resp['searchInformation']['searchTime'] + ' seconds.';
    search_title.textContent = title;
    if (n > 0) {
      var ul = document.createElement('ul');
      for (var i = 0; i < resp['items'].length; i++) {
        var item = resp['items'][i];
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = item['link'];
        a.textContent = item['title'];
        var div = document.createElement('div');
        div.textContent = item['snippet'];
        li.appendChild(a);
        li.appendChild(div);
        ul.appendChild(li);
      }
      result_panel.innerHTML = '';
      result_panel.appendChild(ul);
    }
  };
  xhr.send();
};

