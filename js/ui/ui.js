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
 * @fileoverview Utilities UI component.
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.ui');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.ScrollFloater');


/**
 * Show a modeled message box.
 * @param {string} title
 * @param {string} message
 */
mbi.ui.showMessageBox = function(title, message) {
  var dialog = new goog.ui.Dialog();
  dialog.setButtonSet(goog.ui.Dialog.ButtonSet.createOk());
  dialog.setTitle(title);
  dialog.setContent(message);
  dialog.setEscapeToCancel(true);
  dialog.setHasTitleCloseButton(false);
  dialog.setModal(true);
  dialog.setDisposeOnHide(true);
  dialog.setVisible(true);
};


/**
 * Render figure or video description text into span element.
 * @param {string} des_tx description text.
 * @return {Element}
 */
mbi.ui.renderDescription = function(des_tx) {
  // replace pmid text, [1234567] with anchor nodes
  var des = document.createElement('span');
  var des_fg = document.createDocumentFragment();
  des_fg.appendChild(document.createTextNode(': '));
  var prev = 0;
  var m;
  var re_pmid = /\[([\d{6,12},\s]+)\]/g;
  while ((m = re_pmid.exec(des_tx)) !== null)
  {
    var pmids = m[1].split(',').map(function(s) {
      return s.trim();
    });
    des_fg.appendChild(document.createTextNode(des_tx.substring(prev,
        m.index) + '['));
    for (var j = 0; j < pmids.length; j++) {
      if (j > 0) {
        des_fg.appendChild(document.createTextNode(', '));
      }
      var a_pmid = document.createElement('a');
      a_pmid.href = 'http://www.ncbi.nlm.nih.gov/pubmed?term=' +
          pmids[j];
      a_pmid.textContent = pmids[j];
      a_pmid.setAttribute('name', 'PMID:' + pmids[j]);

      des_fg.appendChild(a_pmid);
    }
    des_fg.appendChild(document.createTextNode(']'));
    prev = re_pmid.lastIndex;
  }
  des_fg.appendChild(document.createTextNode(des_tx.substring(prev, des_tx.length)));
  des.appendChild(des_fg);
  des.className = 'description';
  return des;
};


/**
 * Install scroll floater to the right bar info box.
 */
mbi.ui.installScrollFloater = function() {
  var right_bar = goog.dom.getElement('rightbar');
  var scroller = goog.dom.getElementByClass('infobox-scroller');
  if (right_bar) {
    var floater = new goog.ui.ScrollFloater();
    floater.decorate(right_bar);
    var function_box_height = 241;
    var size = goog.dom.getViewportSize();
    scroller.style.maxHeight = (size.height - function_box_height - 24) + 'px';
    /*
    goog.events.listen(floater, [goog.ui.ScrollFloater.EventType.DOCK,
      goog.ui.ScrollFloater.EventType.PIN,
      goog.ui.ScrollFloater.EventType.FLOAT], function(e) {

    });
    */
  }
};

