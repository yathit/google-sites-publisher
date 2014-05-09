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
 * @fileoverview Base utilities for fig module.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.fig');


/**
 * Extract meta data from file.
 * @param {File} file
 * @return {Object}
 */
mbi.fig.getMeta = function(file) {
  if (file) {
    var title = file.name.replace(/\.\w+/, ''); // strip file extension
    var year = (new Date()).getFullYear();
    return {'title': title, 'created': year};
  } else {
    return {};
  }
};


/**
 * @param {string} s
 * @return {string}
 */
mbi.fig.normalizeTitle = function(s) {

  s = goog.string.trim(s).toUpperCase();
  if (goog.string.startsWith(s, 'THE ')) {
    s = s.substr('THE '.length);
  }
  if (goog.string.startsWith(s, 'A ')) {
    s = s.substr('A '.length);
  }
  if (goog.string.startsWith(s, 'AN ')) {
    s = s.substr('AN '.length);
  }
  var m = s.match(/^\W+/);
  if (m) {
    s = s.substr(m[0].length);
  }
  return s;

};
