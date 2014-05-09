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
 * @fileoverview Main Content script to inject Google site wiki editor.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.inj.Main');
goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.events.KeyHandler');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuBarRenderer');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Prompt');
goog.require('goog.ui.Separator');
goog.require('goog.ui.decorate');
goog.require('goog.ui.menuBar');
goog.require('goog.ui.menuBarDecorator');
goog.require('mbi.app.base');
goog.require('mbi.bi.PubMed');
goog.require('mbi.fig.Select');
goog.require('mbi.inj');
goog.require('mbi.inj.AnnotateDialog');
goog.require('mbi.ui');
goog.require('mbi.wiki.utils');
goog.require('templ.mbi.inj');



/**
 * Main app.
 * @constructor
 */
mbi.inj.Main = function() {
  /**
   * @private
   * @type {mbi.inj.AnnotateDialog}
   */
  this.annotate_dialog_ = null;
  this.auto_save = false;
};


/**
 * @type {boolean}
 * @private
 */
mbi.inj.Main.prototype.init_ = false;


/**
 * @type {mbi.fig.Select}
 * @private
 */
mbi.inj.Main.prototype.select_ = null;


/**
 * @type {Range}
 * @private
 */
mbi.inj.Main.prototype.range_ = null;


/**
 * Insert a figure.
 */
mbi.inj.Main.prototype.insertFigure = function() {
  var range = this.getSelectedRange();
  if (!range) {
    mbi.inj.status('Insert cursor to place the figure.');
    return;
  }
  if (!this.select_) {
    mbi.inj.status('loading figure dialog');
    this.select_ = new mbi.fig.Select();
  }
  mbi.inj.status('preparing figure dialog');
  this.select_.show(function(src) {
    if (src) {
      var uri = new goog.Uri(src);
      uri.setScheme('');
      src = uri.toString(); // remove protocol in src
      // build copyrighted figure page url.
      // the page url is relative to site domain.
      uri.setDomain('');
      var path = uri.getPath();

      // append with html for copyrighted figure page.
      if (goog.string.startsWith(path, '/figure')) {
        // a fix old content
        uri.setPath('/figure' + path + '.html');
      } else {
        uri.setPath(path + '.html');
      }

      var url = uri.toString();
      // window.console.log('url ' + url, ' p ' + path, ' s ' + src);
      // that should redirect or show a proper page.
      var ele = goog.soy.renderAsElement(templ.mbi.inj.insertFigure,
          {src: src, url: url});
      range.insertNode(ele);
    }
  }, this);
};


/**
 * Annotate selected range as protein.
 */
mbi.inj.Main.prototype.cite = function() {
  var range = this.getSelectedRange();
  if (!range) {
    mbi.inj.status('No selection to place citation.');
    return;
  }
  var text = goog.string.trim(range.toString());
  if (text.length == 0) {
    mbi.inj.status('Citation selection text is empty.' +
        ' Select a valid citation, e.g., [16420696], before menu command');
    return;
  }
  // window.console.log(text);
  if (text.charAt(0) != '[') {
    mbi.inj.status('Citation text must starts with "[", but "' +
        text + '" found.');
    return;
  }
  if (text.charAt(text.length - 1) != ']') {
    mbi.inj.status('Citation text must ends with "]", but "' +
        text + '" found.');
    return;
  }
  text = text.substring(1, text.length - 1);
  var pmids = text.split(',').map(function(x) {
    return x.trim();
  });
  for (var i = 0; i < pmids.length; i++) {
    var id = parseInt(pmids[i], 10);
    if (!id || id < 100000) {
      mbi.inj.status('PMID "' +
          pmids[i] + '" is invalid.');
      return;
    }
  }
  mbi.bi.PubMed.load(pmids).addCallback(function(pms) {
    var span = document.createElement('span');
    span.appendChild(document.createTextNode('['));
    for (var i = 0; i < pms.length; i++) {
      var pm = /** @type {mbi.bi.PubMed} */ (pms[i]);
      if (pm) {
        if (i > 0) {
          span.appendChild(document.createTextNode(', '));
        }
        var cite = pm.renderCitation();
        // window.console.log(cite);
        span.appendChild(cite);
      } else {
        mbi.inj.status('PMID: ' + pmids[i] + ' not found.');
        return;
      }
    }
    span.appendChild(document.createTextNode(']'));
    range.deleteContents();
    range.insertNode(span);
    mbi.inj.status(pmids.length + ' citation updated');
  }, this);
};


/**
 * Tidy up HTML.
 */
mbi.inj.Main.prototype.cleanHtml = function() {
  var root = document.getElementById('sites-canvas-main-content');
  var content = goog.dom.getElementByClass('sites-editable-content',
      root.children[0]);
  var has_changed = mbi.wiki.utils.removeFormatting(content);
  if (has_changed) {
    mbi.inj.status('cleaned.');
  } else {
    mbi.inj.status('cleaned, but no change.');
  }
};


/**
 * Annotate selected range as protein.
 */
mbi.inj.Main.prototype.annotate = function() {
  var range = this.getSelectedRange();
  if (!range) {
    mbi.inj.status('No selection to annotate.');
    return;
  }
  var len = range.endOffset - range.startOffset;
  if (len > 0) {
    var text = goog.string.escapeString(range.toString());
    /**
     * @param {{
     *   name: string,
     *   uniprot: string,
     *   go: string
     * }?} values
     */
    var promptHandler = function(values) {
      if (values) {
        var name = values.name.trim();
        var uniprot = values.uniprot.trim();
        var go = values.go.trim();
        var annotations = [];
        if (name) {
          // protein family annotation
          annotations.push('family:' + name);
        }
        if (uniprot) {
          if (/\s/.test(uniprot) || uniprot.length < 6 || uniprot.length > 10 ||
              goog.string.isNumeric(uniprot)) {
            mbi.ui.showMessageBox('Annotate',
                'Uniprot ID: "' + uniprot + '" is invalid.');
            return;
          }
          annotations.push('uniprot:' + uniprot);
        }
        if (go) {
          var gos = go.split(',');
          for (var i = 0; i < gos.length; i++) {
            var id = parseInt(gos[i].match(/\d+/), 10);
            if (!id) {
              mbi.ui.showMessageBox('Annotate',
                  'GO annotation : "' + gos[i] + '" in "' + go +
                      '" is invalid.');
              return;
            }
            gos[i] = String(id);
          }
          if (gos.length > 0) {
            annotations.push('go:' + gos.join(','));
          }
        }
        var content = range.extractContents();
        var span = document.createElement('span');
        span.appendChild(content);
        var annotation = annotations.join('|');
        span.setAttribute('name', annotation);
        range.insertNode(span);
        mbi.inj.status('Annotated "' + annotation + '" to ' + text);
      }
    };
    if (!this.annotate_dialog_) {
      this.annotate_dialog_ = new mbi.inj.AnnotateDialog(promptHandler);
    }
    this.annotate_dialog_.setVisible(true);
  } else {
    mbi.inj.status('no text selection range');
  }
};


/**
 * Annotate selected range as protein.
 */
mbi.inj.Main.prototype.annotateProtein = function() {
  var range = this.getSelectedRange();
  if (!range) {
    mbi.inj.status('No selection to annotate.');
    return;
  }
  var len = range.endOffset - range.startOffset;
  if (len > 0) {
    var text = goog.string.escapeString(range.toString());
    /**
     * @param {string?} s
     */
    var promptHandler = function(s) {
      if (s) {
        s = s.trim();
        if (/\s/.test(s) || s.length < 6 || s.length > 10 ||
            goog.string.isNumeric(s)) {
          mbi.ui.showMessageBox('Annotate as protein',
              'Uniprot ID: "' + s + '" is invalid.');
          return;
        }
        var content = range.extractContents();
        var span = document.createElement('span');
        span.appendChild(content);
        span.setAttribute('name', 'uniprot:' + s);
        range.insertNode(span);
        mbi.inj.status('Annotated unitprot:"' + s + '" to ' + text);
      }
    };
    var prompt = new goog.ui.Prompt(
        'Annotate as protein',
        'Enter UniProt ID for "' + text + '"',
        promptHandler);
    // this.uniprot_prompt_.setDefaultValue('');
    prompt.setDisposeOnHide(true);
    prompt.setVisible(true);
  } else {
    mbi.inj.status('no text selection range');
  }
};


/**
 * @return {Range}
 */
mbi.inj.Main.prototype.getSelectedRange = function() {
  return this.range_ || null;
};


/**
 * Initialize menu.
 */
mbi.inj.Main.prototype.initMenu = function() {
  if (mbi.inj.init_) {
    mbi.inj.status('ready');
    return;
  }
  // edit menu
  var ele_insert = goog.dom.getElementByClass('sites-editor-toolbar-menurow');
  if (!ele_insert) {
    // we have to wait while main app load editor module asynchronously.
    // since we don't know when it finished, we arbitrarily wait for 1 sec.
    goog.Timer.callOnce(function() {
      mbi.inj.status('initializing menu');
      this.initMenu();
    }, 1000, this);
    return;
  }
  mbi.inj.init_ = true;
  var ele = goog.soy.renderAsElement(templ.mbi.inj.menubar);
  ele_insert.appendChild(ele);
  var menubar = goog.ui.decorate(ele);
  mbi.inj.status('Menu initialized.');
  goog.events.listen(ele, goog.events.EventType.MOUSEOVER, function(e) {
    var sel = window.getSelection();
    // HACK: when menu is clicked, select disappear, so we have to capture
    // selection range during mouse over.
    if (sel && sel.rangeCount > 0) {
      this.range_ = sel.getRangeAt(0);
    }
  }, false, this);
  var insert_figure_menu = document.getElementById('place-figure');
  goog.events.listen(insert_figure_menu, 'click', function(e) {
    this.insertFigure();
  }, false, this);
  var protein_menu = document.getElementById('annotate-protein');
  goog.events.listen(protein_menu, 'click', function(e) {
    this.annotateProtein();
  }, false, this);
  var annotate_menu = document.getElementById('annotate');
  goog.events.listen(annotate_menu, 'click', function(e) {
    this.annotate();
  }, false, this);
  var citation = document.getElementById('citation');
  goog.events.listen(citation, 'click', function(e) {
    this.cite();
  }, false, this);
  var clean = document.getElementById('clean');
  goog.events.listen(clean, 'click', function(e) {
    this.cleanHtml();
  }, false, this);
};


/**
 * Initialize save.
 * @param {number} trial number of trial
 */
mbi.inj.Main.prototype.initSave = function(trial) {
  // save button
  var btn_save = document.getElementById('sites-editor-button-sites-save');
  if (btn_save) {
    // btn element are disposed occupationally.
    if (btn_save.getAttribute('data-publish') == '1') {
      return;
    }
    btn_save.setAttribute('data-publish', '1');
    goog.events.listen(btn_save, 'click', function(e) {
      if (!this.auto_save) {
        return;
      }
      mbi.inj.status('preparing to publish...');
      mbi.inj.ch_site.send(mbi.app.base.Req.PUBLISH);
    }, false, this);
  } else if (trial < 10) {
    trial++;
    goog.Timer.callOnce(function() {
      this.initSave(trial);
    }, 1000, this);
  }
};


/**
 * Initialize.
 */
mbi.inj.Main.prototype.init = function() {
  var btn_edit = document.getElementById('edit-start-btn');
  if (btn_edit) {
    goog.events.listen(btn_edit, 'click', function(e) {
      mbi.inj.status('preparing menu...');
      this.initMenu();
      this.initSave(0);
    }, false, this);
  }
  var key_hd = new goog.events.KeyHandler(document);
  var kid = goog.events.listen(key_hd, goog.events.KeyHandler.EventType.KEY,
      function(e) {
        if (mbi.inj.init_) {
          goog.events.unlistenByKey(kid);
          return;
        }
        var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
        if (keyEvent.keyCode == goog.events.KeyCodes.E) {
          this.initMenu();
          this.initSave(0);
          goog.events.unlistenByKey(kid);
        }
      }, false, this);
  mbi.inj.status('mbi.app ' + mbi.app.base.VERSION + '.' +
      mbi.inj.version + ' loaded.');
};


/**
 * Run app.
 * @return {mbi.inj.Main}
 */
mbi.inj.Main.runApp = function() {
  if (goog.DEBUG) {
    mbi.inj.log();
  }
  var app = new mbi.inj.Main();
  app.init();
  mbi.inj.testService();
  return app;
};


goog.exportSymbol('runApp', mbi.inj.Main.runApp);

