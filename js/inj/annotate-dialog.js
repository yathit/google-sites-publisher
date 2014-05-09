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
 * @fileoverview User setting control.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */


goog.provide('mbi.inj.AnnotateDialog');
goog.require('goog.dom.forms');
goog.require('goog.ui.Dialog');
goog.require('templ.mbi.inj');



/**
 * Show annotate dialog.
 * @param {function({
 *   name: string,
 *   uniprot: string,
 *   go: string
 * }?)} cb callback with dialog values. null on cancel.
 * @constructor
 * @extends {goog.ui.Dialog}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 * @struct
 */
mbi.inj.AnnotateDialog = function(cb) {
  goog.base(this);
  this.setButtonSet(goog.ui.Dialog.ButtonSet.createOkCancel());
  this.setContent(templ.mbi.inj.annotateDialog());
  this.setModal(true);
  this.setTitle('Annotate');
  this.setHasTitleCloseButton(false);
  this.setDisposeOnHide(false); // we will reuse
  /**
   * @type {HTMLFormElement}
   */
  this.root = /** @type {HTMLFormElement} */ (goog.dom.getElementByClass(
      'annotate-dialog', this.getContentElement()));
  goog.events.listen(this, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key == goog.ui.Dialog.DefaultButtonKeys.OK) {
      var values = {
        name: /** @type {string} */ (goog.dom.forms.getValueByName(this.root, 'name')),
        uniprot: /** @type {string} */ (goog.dom.forms.getValueByName(this.root, 'uniprot')),
        go: /** @type {string} */ (goog.dom.forms.getValueByName(this.root, 'go'))
      };
      cb(values);
    } else {
      cb(null);
    }
  }, false, this);

};
goog.inherits(mbi.inj.AnnotateDialog, goog.ui.Dialog);


/**
 * @inheritDoc
 */
mbi.inj.AnnotateDialog.prototype.onShow = function() {
  var children = goog.dom.getElementsByTagNameAndClass(goog.dom.TagName.INPUT,
      null, this.root);
  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    goog.dom.forms.setValue(child, '');
  }
  goog.base(this, 'onShow');
};
