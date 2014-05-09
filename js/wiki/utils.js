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
 * @fileoverview Wiki utilities.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.wiki.utils');


/**
 * Remove formatting element and attributes, such as font tag and
 * style attributes.
 * @param {Element} el
 * @return {boolean} true if doc has changed.
 */
mbi.wiki.utils.removeFormatting = function(el) {
  var fonts = el.getElementsByTagName('font');
  var has_changed = fonts.length > 0;
  for (var i = fonts.length - 1; i >= 0; i--) {
    var font = fonts[i];
    mbi.wiki.utils.spanify_(font);
  }

  // recursive test all of this node's children
  var child = el.firstElementChild;
  while (child) {
    if (!has_changed) {
      var s = child.getAttribute('style');
      if (s) {
        child.removeAttribute('style');
        has_changed = true;
        // window.console.log('style ' + s + ' + in ' + child.tagName +
        //    child.textContent + ' removed.');
      }
    } else {
      child.removeAttribute('style');
    }
    has_changed |= mbi.wiki.utils.removeFormatting(child);
    child = child.nextElementSibling;
  }
  return has_changed;
};


/**
 * Change tag to span tag if given tag has children.
 * Some tag like b, i, em, h2, h4, etc should not have children.
 * @param {Element} root
 * @return {boolean} true if doc has changed.
 */
mbi.wiki.utils.ensureSingleTag = function(root) {
  var has_change = false;
  /**
   * @param {Element} el
   */
  var ensure = function(el) {
    if (el.childElementCount > 0) {
      mbi.wiki.utils.spanify_(el);
      has_change = true;
    }
  };
  var single_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'b', 'i', 'em'];
  for (var i = 0; i < single_tags.length; i++) {
    var tags = root.getElementsByTagName(single_tags[i]);
    for (var j = tags.length - 1; j >= 0; j--) {
      ensure(tags[j]);
    }
  }
  return has_change;
};


/**
 * Change tag to span tag.
 * @param {Element} el
 * @private
 */
mbi.wiki.utils.spanify_ = function(el) {
  var span = document.createElement('span');
  el.parentNode.replaceChild(span, el);
  // and move the children
  while (el.hasChildNodes()) {
    span.appendChild(el.firstChild);
  }
};


/**
 * Tidy up HTML.
 * @param {Element} el
 * @return {boolean} true if doc has changed.
 */
mbi.wiki.utils.cleanHTML = function(el) {
  var has_change = mbi.wiki.utils.removeFormatting(el);
  has_change |= mbi.wiki.utils.ensureSingleTag(el);
  return has_change;
};


/**
 * Render given html content into a new window.
 * @param {string} html
 * @param {string=} opt_title
 */
mbi.wiki.utils.renderInWindow = function(html, opt_title) {
  var w = window.open();
  var head = html.substring(html.indexOf('<head>') + 6,
      html.indexOf('</head>'));
  var body = html.substring(html.indexOf('<body>') + 6,
      html.indexOf('</body>'));
  body = body.replace(/src="\/\//g, 'src="http://');
  w.document.head.innerHTML = head;
  w.document.body.innerHTML = body;
  w.document.title = opt_title || '';
};


/**
 * Migrate to new citation format.
 * Previously citation are annotated as <span name="PMID:dddddd">citation</span>
 * new format is <a name="PMID:dddddd">citation</a>.
 * @param {Element} el
 * @return {boolean} true if doc has changed.
 */
mbi.wiki.utils.migrateCitationAFormat = function(el) {
  /*
  var as = el.querySelectorAll('span > a');
  var has_change = false;
  for (var i = 0, n = as.length; i < n; i++) {
    var span = as[i].parentElement;
    if (i > 0 && span == as[i - 1].parentElement) {
      continue;
    }
    var name = span.getAttribute('name');
    if (name && goog.string.startsWith(name, 'PMID:')) {
      var ids = name.substr('PMID:'.length).split(',');
      ids = ids.map(function(x) {
        return parseInt(x.trim(), 10);
      });
      span.innerHTML = '[';
      for (var j = 0; j < ids.length; j++) {
        if (ids[j]) {
          var new_a = document.createElement('a');
          new_a.setAttribute('name', 'PMID:' + ids[j]);
          new_a.textContent = ids[j];
          new_a.href = '#PMID' + ids[j];
          if (j > 0) {
            span.appendChild(document.createTextNode(', '));
          }
          span.appendChild(new_a);
        }
      }
      span.setAttribute('name', '');
      span.appendChild(document.createTextNode(']'));
      has_change = true;
    }
  }
  */
  var has_change = false;
  var spans_name = el.querySelectorAll('span[name]');
  for (var i = 0, n = spans_name.length; i < n; i++) {
    var span = spans_name[i];
    var child = span.firstElementChild;
    if (child && child.tagName == 'A' && goog.string.startsWith(
        child.getAttribute('name'), 'PMID:')) {
      // harhaps have done already
      continue;
    }
    var name = span.getAttribute('name');
    if (name && goog.string.startsWith(name, 'PMID:')) {
      var ids = name.substr('PMID:'.length).split(',');
      ids = ids.map(function(x) {
        return parseInt(x.trim(), 10);
      });
      span.innerHTML = '[';
      for (var j = 0; j < ids.length; j++) {
        if (ids[j]) {
          var new_a = document.createElement('a');
          new_a.setAttribute('name', 'PMID:' + ids[j]);
          new_a.textContent = ids[j];
          new_a.href = '#PMID' + ids[j];
          if (j > 0) {
            span.appendChild(document.createTextNode(', '));
          }
          span.appendChild(new_a);
        }
      }
      span.setAttribute('name', '');
      span.appendChild(document.createTextNode(']'));
      has_change = true;
    }
  }
  return has_change;
};

