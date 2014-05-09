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
 * @fileoverview Wiki content renderer.
 *
 * For a given Google Site feed entry data, SiteEntry, this class render into
 * 'wiki-content' div element.
 *
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.wiki.ActiveProteinMetaChangedEvent');
goog.provide('mbi.wiki.Renderer');
goog.require('goog.soy');
goog.require('mbi.app.base');
goog.require('mbi.bi.PubMed');
goog.require('mbi.data');
goog.require('mbi.data.Object');
goog.require('mbi.data.bi');
goog.require('mbi.gadget.ProteinInfobox');
goog.require('mbi.ui.FunctionInfoBox');
goog.require('mbi.ui.SubpageInfoBox');
goog.require('mbi.video.PlayerBox');
goog.require('mbi.wiki.Decorator');
goog.require('mbi.wiki.Event');
goog.require('mbi.wiki.utils');
goog.require('templ.mbi.app.adminapp');
goog.require('templ.mbi.web.html');
goog.require('ydn.gdata.site.Page');
goog.require('ydn.gdata.site.utils');



/**
 * Create a new Wiki Page renderer.
 * @param {mbi.gadget.ProteinInfobox=} opt_protein_infobox
 * @param {boolean=} opt_is_admin
 * @constructor
 * @extends {goog.events.EventTarget}
 * @suppress {checkStructDictInheritance} suppress closure-library code.
 * @struct
 */
mbi.wiki.Renderer = function(opt_protein_infobox, opt_is_admin) {
  goog.base(this);
  /**
   * @protected
   * @type {mbi.gadget.ProteinInfobox}
   */
  this.protein_infobox = opt_protein_infobox || new mbi.gadget.ProteinInfobox();
  /**
   * @type {boolean}
   * @private
   */
  this.rendered_ = false;
  /**
   * @type {ydn.gdata.site.Page}
   * @private
   */
  this.page_ = null;
  /**
   * @type {Array.<ydn.gdata.site.Page>}
   * @private
   */
  this.sub_pages_ = [];
  /**
   * @type {Element}
   * @protected
   */
  this.root;

  /**
   * @type {Element}
   * @protected
   */
  this.ele_content;
  /**
   * @protected
   * @type {mbi.ui.FunctionInfoBox}
   */
  this.module_infobox = new mbi.ui.FunctionInfoBox(opt_is_admin);
  /**
   * @protected
   * @type {mbi.ui.SubpageInfoBox}
   */
  this.subpages_infobox = new mbi.ui.SubpageInfoBox();
};
goog.inherits(mbi.wiki.Renderer, goog.events.EventTarget);


/**
 * @type {boolean}
 * @private
 */
mbi.wiki.Renderer.prototype.rendered_;


/**
 * @param {boolean} value
 */
mbi.wiki.Renderer.prototype.setVisible = function(value) {
  goog.style.setElementShown(this.root, value);
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.wiki.Renderer.prototype.logger =
    goog.log.getLogger('mbi.wiki.Renderer');


/**
 * @return {ydn.gdata.site.Page}
 */
mbi.wiki.Renderer.prototype.getPage = function() {
  return this.page_;
};


/**
 * Initialize UI components.
 * @param {Element} root root element.
 */
mbi.wiki.Renderer.prototype.init = function(root) {
  /**
   * @final
   * @type {Element}
   */
  this.root = root;
  /**
   * @final
   * @type {Element}
   */
  this.ele_content = goog.dom.getElementsByTagNameAndClass('div',
      'wiki-content', root)[0];
  if (this.root) {
    goog.events.listen(this.root, 'click', this.handleContentClick,
        false, this);
  }
  this.module_infobox.render(document.getElementById('relevant-panel'));

};


/**
 * Match annotation.
 * @param {string} s
 * @return {{uniprot: string?, family: string?, go: string?}?}
 */
mbi.wiki.Renderer.matchAnnotation = function(s) {
  if (!s) {
    return null;
  } else {
    var family = s.match(/family:([^|]+)/);
    var uniprot = s.match(/uniprot:(\w+)/);
    var go = s.match(/go:(.+)/);
    if (family || uniprot || go) {
      return {
        uniprot: uniprot ? uniprot[1].trim() : null,
        family: family ? family[1].trim() : null,
        go: go ? go[1].trim() : null
      };
    } else {
      return null;
    }
  }
};


/**
 * When user click, protein infobox display relevant protein. This flag
 * indicate whether it should be sniff by annotation or regexp.
 * @type {boolean}
 */
mbi.wiki.Renderer.SNIFF_BY_ANNOTATION = true;


/**
 * Get list of annotated id from the renderred content.
 * @return {goog.async.Deferred}
 */
mbi.wiki.Renderer.prototype.listProteinAnnotation = function() {
  var df = new goog.async.Deferred();
  var spans = document.getElementsByClassName('annotation');
  var arr = [];
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];
    var name = span.getAttribute('name');
    if (!name) {
      continue;
    }
    var m = name.match(/[uniprot|family]:(\w+)/);
    if (m && arr.indexOf(m[1]) == -1) {
      arr.push(m[1]);
    }
  }
  // console.log(arr);
  return df;
};


/**
 * @protected
 */
mbi.wiki.Renderer.prototype.renderTopicDefinitionPanel = function() {
  var page = this.getPage();
  var ele = document.getElementById('topic-definition-panel');
  if (page && ele) {
    var h3 = goog.dom.getElementsByTagNameAndClass('h3', null, ele)[0];
    var p = goog.dom.getElementsByTagNameAndClass('p', null, ele)[0];
    var arr = [];
    mbi.app.shared.site_map.walk(page.getUrl(), arr);
    if (arr[1]) {
      var name = arr[1].name;
      var data = goog.global['metaTopicDefinition'];
      if (data && data[name]) {
        h3.textContent = data[name]['title'];
        p.textContent = data[name]['description'];
        goog.style.setElementShown(ele, true);
      } else {
        this.logger.warning('Topic definition for ' + name + ' not found.');
        h3.textContent = '';
        p.textContent = '';
        goog.style.setElementShown(ele, false);
      }
    } else {
      goog.style.setElementShown(ele, false);
    }
  }
};


/**
 * @type {goog.async.Deferred}
 * @private
 */
mbi.wiki.Renderer.df_name2uniprot_ = null;


/**
 * @return {!goog.async.Deferred}
 * @protected
 */
mbi.wiki.Renderer.prototype.getName2UniProt = function() {
  if (!mbi.wiki.Renderer.df_name2uniprot_) {
    var db = mbi.data.storage.getStorage();
    mbi.wiki.Renderer.df_name2uniprot_ = db.values('proteins');
  }
  return mbi.wiki.Renderer.df_name2uniprot_;
};


/**
 * Sniff for uniprot meta data.
 * @protected
 * @param {Node} span
 * @return {boolean} true if completed.
 */
mbi.wiki.Renderer.prototype.sniff = function(span) {
  if (!span || !(span instanceof HTMLElement)) {
    return true;
  }
  var name = span.getAttribute('name');
  var m = mbi.wiki.Renderer.matchAnnotation(name);
  if (m) {
    this.logger.finest(
        (m.uniprot ? 'uniprot:' + m.uniprot : '') +
        (m.family ? ' family:' + m.family : '') +
        (m.go ? ' go:' + m.go : '') +
        ' found');
    var event = new mbi.wiki.ActiveProteinChangedEvent(
        this, m.uniprot, m.family, m.go);
    this.dispatchEvent(event);
    return true;
  }
  var p = span.parentNode;
  if (p && p.tagName != goog.dom.TagName.ARTICLE) {
    if (this.sniff(p)) {
      return true;
    }
  }
  return false;
};


/**
 * Handle wiki content client event.
 * @param {Event} e
 */
mbi.wiki.Renderer.prototype.handleContentClick = function(e) {
  var ele = e.target;
  if (!ele) {
    return;
  }
  goog.Timer.callOnce(function() {
    this.sniff(/** @type {Node} */ (ele));
  }, 1, this);
};


/**
 * div id for reference section.
 * @type {string}
 * @const
 */
mbi.wiki.Renderer.ID_REFERENCES = 'references';


/**
 * Annotate text content base on protein names.
 * @return {goog.async.Deferred}
 */
mbi.wiki.Renderer.prototype.autoAnnotate = function() {

  var df = new goog.async.Deferred();
  mbi.data.bi.listProteinNames().addCallback(function(proteins) {
    // console.log(proteins);
    // walk all text nodes
    var walker = document.createTreeWalker(document.body,
        NodeFilter.SHOW_TEXT, null, false);

    var first;
    var node;
    while (node = walker.nextNode()) {
      var text = node.nodeValue.toLowerCase();
      var parent = node.parentNode;
      if (!(parent instanceof HTMLElement)) {
        continue;
      }
      if (parent.getAttribute('name')) {
        continue;
      }
      for (var p in proteins) {
        // RegExp will be slow for large scale matching.
        var idx = text.indexOf(p);
        if (idx >= 0) {
          var start = text.substr(idx - 1, 1);
          var end = text.substr(idx + p.length, 1);
          // make sure that we are matching word by looking at the boundary.
          var is_word = /\s/.test(start) && /\s/.test(end);
          // console.log('match ' + text.substr(idx - 2, p.length + 2) + ' ' +
          // is_word + ' ' + start + ':' + end);
          if (is_word) {
            // console.log(proteins[p] + ': ' + text);
            parent.setAttribute('name', 'uniprot:' + proteins[p]);
            if (!first) {
              first = parent;
            }
            break;
          }
        }
      }
    }
    df.callback(first);
  }, this);
  return df;
};


/**
 * @return {goog.async.Deferred}
 * @protected
 */
mbi.wiki.Renderer.prototype.processPostRender = function() {
  this.logger.finer('post rendering');
  this.subpages_infobox.render(document.getElementById('subpages-panel'));
  this.renderVideoBox();
  return new goog.async.DeferredList([
    this.renderFigureBox()]);
};


/**
 * Render youtube video.
 */
mbi.wiki.Renderer.prototype.renderVideoBox = function() {
  var iframes = this.root.querySelectorAll('iframe');
  for (var i = iframes.length - 1; i >= 0; i--) {
    var frame = iframes[i];
    if (goog.dom.classes.has(frame, 'youtube-player')) {
      new mbi.video.PlayerBox().render(frame);
    }
  }
};


/**
 * Render figure images into figure box.
 * @return {goog.async.Deferred}
 */
mbi.wiki.Renderer.prototype.renderFigureBox = function() {
  // query figure images, which is inside an hyperlink
  var images = this.root.querySelectorAll('img');
  var n = images.length;
  if (n == 0) {
    return goog.async.Deferred.succeed(0);
  }
  var df = new goog.async.Deferred();
  var bk = mbi.app.shared.getBucket(mbi.app.base.BUCKET_FIG);
  bk.ready().addCallback(function() {
    var n_done = 0;
    for (var i = 0; i < n; i++) {
      var img = images[i];
      var src = img.src;
      var uri = new goog.Uri(src);
      var name = uri.getPath().replace(/^\//, '');
      if (!goog.string.startsWith(name, mbi.app.base.BUCKET_FIG_PREFIX)) {
        // this fix is require only for older publish content.
        // previously figure bucket are not prefix.
        name = mbi.app.base.BUCKET_FIG_PREFIX + name;
        uri.setPath('/' + name);
        img.src = uri.toString();
      }
      var obj = bk.getByName(name);
      if (obj) {
        var a = img.parentElement;
        if (a.tagName != goog.dom.TagName.A) {
          a = document.createElement(goog.dom.TagName.A);
          img.parentElement.replaceChild(a, img);
          a.appendChild(img);
        }
        var src_href = '/' + name + '.html';
        a.href = src_href;
        var div = a.parentElement;
        // parent element must be DIV and must hold only A element.
        if (div.tagName != goog.dom.TagName.DIV || div.childElementCount != 1) {
          div = document.createElement(goog.dom.TagName.DIV);
          a.parentElement.replaceChild(div, a);
          div.style.display = img.style.display;
          div.style['float'] = img.style['float'];

          img.style.display = '';
          img.style['float'] = '';
          img.style.margin = '';
          img.style.padding = '';
          div.appendChild(a);
        }
        img.className = 'figure-img';
        if (div.style.display == 'inline') {
          div.className = 'figure-box';
          if (!div.style['float']) {
            div.style['float'] = 'left';
          }

          // standarize image size
          img.removeAttribute('height');
          if (img.width >= 400) {
            img.width = '400';
          } else if (img.width >= 320) {
            img.width = '320';
          } else {
            img.width = '200';
          }
        }
        if (div.style['float'] == 'left') {
          div.style['margin-right'] = '16px';
        } else if (div.style['float'] == 'right') {
          div.style['margin-left'] = '8px';
        }
        if (div.style['float']) {
          div.style['clear'] = div.style['float'];
        }
        var label = document.createElement('span');
        label.style.display = 'block';
        if (img.width) {
          goog.style.setWidth(label, img.width);
        }
        var title = document.createElement('span');
        title.textContent = 'Figure ' + (n_done + 1) +
            '. ' + (obj.getMeta('title') || '');
        title.className = 'figure-title';
        label.appendChild(title);
        var des_tx = obj.getMeta('description');
        if (des_tx) {
          var des = mbi.ui.renderDescription(des_tx);
          label.appendChild(des);
        }
        div.appendChild(label);
        n_done++;
      } else {
        this.logger.warning('figure "' + name + '" not found in ' + bk + ' for ' + src);
        if (uri.getDomain() == window.location.hostname) {
          // replace relative url
          img.src = mbi.app.base.TOPIC_SITE_URL + uri.getPath();
        }
      }
    }
    this.logger.finest(n_done + ' figures processed.');
    df.callback(n);
  }, this);
  return df;
};


/**
 * Process protein meta data.
 * @param {Element} ele
 */
mbi.wiki.Renderer.prototype.processProteinMeta = function(ele) {
  var spans = goog.dom.getElementsByTagNameAndClass('span', null, ele);
  var n_uniprot = 0;
  var n_family = 0;
  var n_go = 0;
  var up_ids = [];

  for (var i = 0, n = spans.length; i < n; i++) {
    var span = spans[i];
    var meta = span.getAttribute('name');
    if (meta) {
      if (/uniprot:/.test(meta)) {
        var uid = meta.match(/uniprot:(\w+)/);
        if (uid && up_ids.indexOf(uid[1]) == -1) {
          up_ids.push(uid[1]);
        }
        goog.dom.classes.add(span, mbi.wiki.Decorator.CSS_CLASS_UNIPROT);
        goog.dom.classes.add(span, mbi.wiki.Decorator.CSS_CLASS_ANNOTATION);
        n_uniprot++;
      } else if (/family:/.test(meta)) {
        var fid = meta.match(/family:(\w+)/);
        if (fid && up_ids.indexOf(fid[1]) == -1) {
          up_ids.push(fid[1]);
        }
        goog.dom.classes.add(span, mbi.wiki.Decorator.CSS_CLASS_FAMILY);
        goog.dom.classes.add(span, mbi.wiki.Decorator.CSS_CLASS_ANNOTATION);
        n_family++;
      } else if (/go:/.test(meta)) {
        goog.dom.classes.add(span, mbi.wiki.Decorator.CSS_CLASS_GO);
        goog.dom.classes.add(span, mbi.wiki.Decorator.CSS_CLASS_ANNOTATION);

        n_go++;
      }
    }
  }
  var total = n_uniprot + n_family + n_go;
  if (this.protein_infobox) {
    this.logger.finer('setting ' + up_ids.length + ' proteins');
    this.protein_infobox.setProteinList(up_ids);
  }
  if (total == 0) {
    var ele_pf = document.getElementById('protein-infobox');
    if (ele_pf) {
      goog.dom.classes.add(ele_pf, 'empty');
    }
  }
  this.logger.finer(n_uniprot + ' uniprot ' +
      n_family + ' family ' +
      n_go + ' GO ' +
      ' meta data processed.');
};


/**
 * Process meta tag.
 * @param {function(this:T)=} opt_cb callback on complete.
 * @param {T=} opt_scope scope.
 * @template T
 * @return {goog.async.Deferred}
 */
mbi.wiki.Renderer.prototype.processMeta = function(opt_cb, opt_scope) {
  this.logger.finer('processing meta data');
  this.processProteinMeta(this.root);
  var df = this.processCitation();
  df.addBoth(function() {
    // console.log('meta done')
    if (opt_cb) {
      opt_cb.call(opt_scope);
      opt_cb = undefined;
    }
  }, this);
  return df;
};


/**
 * Process meta tag.
 * @return {goog.async.Deferred}
 */
mbi.wiki.Renderer.prototype.processCitation = function() {
  var df = new goog.async.Deferred();
  this.decodeMeta(this.root);
  var cites = goog.dom.getElementsByTagNameAndClass('a', null,
      this.ele_content);
  var pmids = [];
  var n_spans = cites.length;
  var cited_index = [];
  for (var i = 0; i < n_spans; i++) {
    var a = cites[i];
    var meta = a.getAttribute('name');
    if (!meta) {
      // check out on href
      meta = a.href.match(/#PMID(\d+)/);
      if (meta) {
        meta = 'PMID:' + meta[1];
      } else {
        continue;
      }
    }
    // meta = meta.replace(/\s/g, ''); // better not smart for consistency.
    if (goog.string.startsWith(meta, 'PMID:')) {
      var id = meta.substr('PMID:'.length);
      id = goog.string.trim(id);
      if (!parseInt(id, 10)) {
        this.logger.warning('Invalid citation "' + meta + '" ignored.');
        continue;
      }
      var idx = pmids.indexOf(id);
      if (idx == -1) {
        pmids.push(id);
        idx = pmids.length;
      } else {
        idx++; // 1 base
      }
      // console.log(a.textContent, a.href, meta);
      a.textContent = idx;
      a.href = '#PMID' + id;
      goog.dom.classes.add(a, 'citation');
      cited_index.push(i);
    }
  }
  this.logger.finest(pmids.length + ' PMID found.');
  return mbi.bi.PubMed.load(pmids).addCallback(function(pms) {
    var ref = document.createElement('div');
    ref.id = mbi.wiki.Renderer.ID_REFERENCES;
    var h3 = document.createElement('h3');
    h3.textContent = 'References';
    ref.appendChild(h3);
    var ul = document.createElement('ol');
    ref.appendChild(ul);
    for (var i = 0; i < pms.length; i++) {
      var pm = /** @type {mbi.bi.PubMed} */ (pms[i]);
      if (pm) {
        var li = document.createElement('li');
        li.appendChild(pm.renderReference());
        ul.appendChild(li);
      }
    }
    this.ele_content.appendChild(ref);

    for (var j = 0, n = cited_index.length; j < n; j++) {
      var cite = cites[cited_index[j]];
      var idx = parseInt(cite.textContent, 10);
      if (idx >= 0) {
        var pm = /** @type {mbi.bi.PubMed} */ (pms[idx - 1]);
        if (pm) {
          cite.title = pm.getLabel();
        }
      }
    }
  }, this);
};


/**
 * Get inner HTML of reference.
 * @return {string}
 */
mbi.wiki.Renderer.prototype.getReferenceHtml = function() {
  var div = document.getElementById(mbi.wiki.Renderer.ID_REFERENCES);
  return div ? div.outerHTML : '';
};


/**
 * Process wiki class.
 * @param {Element} root element to start with.
 */
mbi.wiki.Renderer.encodeMeta = function(root) {
  var es = goog.dom.getElementsByClass('wikic', root);
  for (var n = es.length, i = 0; i < n; i++) {
    var ele = es[i];
    var tags = [];
    var classes = ele.className.split(/\s+/);
    for (var j = 0; j < classes.length; j++) {
      if (classes[j] == 'wikic') {
        // ignore
      } else if (classes[j] == 'wikir') {
        ele.parentElement.removeChild(ele);
      } else {
        tags.push('class:' + classes[j]);
      }
    }
    var name = ele.getAttribute('name');
    if (name) {
      tags.push('name:' + name);
    }
    ele.setAttribute('name', tags.join('|'));
    ele.className = null;
  }
};


/**
 * Process wiki class.
 * @param {Element} ele element to start with.
 * @protected
 */
mbi.wiki.Renderer.prototype.decodeMeta = function(ele) {
  if (ele) {
    var att = ele.getAttribute('name');
    // console.log(ele.tagName);
    if (att) {
      var tags = att.split('|');
      for (var i = 0; i < tags.length; i++) {
        var meta = tags[i].split(':');
        if (meta.length == 2 && !!meta[1]) {
          var name = meta[0];
          var value = meta[1];
          if (name == 'wikic') {
            goog.dom.classes.add(ele, value);
          } else if (name == 'name') {
            ele.setAttribute('name', value);
          }
        }
      }
    }
    // walk all elements
    this.decodeMeta(ele.nextElementSibling || ele.firstElementChild);
  }
};


/**
 * Normalize wiki content.
 *  1. Fix default protocol url with https.
 *  2. Remove temp path.
 *  3. Replace Google Sites url with relative to host name.
 *  4. Clean blank page.
 * @param {string} html
 * @return {string}
 */
mbi.wiki.Renderer.prototype.normalize = function(html) {
  if (goog.isString(html)) {
    if (html == '<div xmlns="http://www.w3.org/1999/xhtml" dir="ltr"><div><div><br /></div></div></div>') {
      // blank page. clean html, so that it won't show up wired empty line.
      return '';
    }
    var google_site_url = new RegExp(
        'https:\/\/sites.google.com\/a\/' + mbi.app.base.TOPIC_DOMAIN_NAME + '\/' +
        mbi.app.base.TOPIC_SITE_NAME + '\/', 'g');
    return html
        .replace(/src="\/\//g, 'src="' + mbi.app.base.protocol + '//') // fix protocol
        .replace(google_site_url, '/')
        .replace(/\/_\/rsrc\/\d+\//g, '/'); // fix temp path
  } else {
    return html;
  }
};


/**
 * Show protein box.
 */
mbi.wiki.Renderer.prototype.showProteinInfobox = function() {
  var firstPNode = this.ele_content.querySelector('span[name]');
  if (!firstPNode) {
    firstPNode = this.ele_content.querySelector('p[name]');
  }
  if (!firstPNode) {
    firstPNode = this.ele_content.querySelector('div[name]');
  }
  this.sniff(firstPNode);
};


/**
 * @param {ydn.gdata.site.Page} page
 * @param {Array.<ydn.gdata.site.Page>=} opt_children sub pages.
 * @return {goog.async.Deferred}
 */
mbi.wiki.Renderer.prototype.render = function(page, opt_children) {
  var df = new goog.async.Deferred();
  this.page_ = page;
  this.sub_pages_ = opt_children || [];
  var content = page.getWikiContent();
  content = this.normalize(content);
  var parts = ydn.gdata.site.utils.parseUrl(page.getUrl());
  var view_url = 'http://' + mbi.app.base.SITE_DOMAIN + parts.path;
  document.getElementById('toolbar-view').href = view_url;
  var name = parts.path.replace(/^\//, ''); // strip starting '/'
  var sub_contents = [];
  var subpages_edit_urls = [];
  for (var i = 0; i < this.sub_pages_.length; i++) {
    if (this.sub_pages_[i]) {
      var subparts = ydn.gdata.site.utils.parseUrl(this.sub_pages_[i].getUrl());
      sub_contents[i] = {
        content: this.normalize(this.sub_pages_[i].getWikiContent()),
        edit_url: this.sub_pages_[i].getUrl(),
        title: this.sub_pages_[i].getTitle(),
        path: subparts.path,
        name: this.sub_pages_[i].getName()
      };
    }
  }
  var is_empty_content = content.length < 97;
  var data = {
    name: name,
    title: page.getTitle(),
    edit_url: is_empty_content ? '' : page.getUrl(),
    content: content,
    sub_pages: sub_contents
  };
  goog.soy.renderElement(this.ele_content, templ.mbi.app.content,
      data);
  this.rendered_ = true;
  this.renderTopicDefinitionPanel();
  // do decorate processing to wiki content in separate thread.
  goog.Timer.callOnce(function() {
    this.decodeMeta(this.ele_content);
    this.processPostRender().addBoth(function() {
      var df2 = this.processMeta();
      df2.addCallbacks(function() {
        // console.log('done')
        this.showProteinInfobox();
        df.callback();
      }, function(e) {
        df.errback();
      }, this);
    }, this);
    this.module_infobox.setModel(page);
    this.subpages_infobox.setModel(page);

    var ev = new mbi.wiki.Event(mbi.wiki.Event.EventType.RENDERED, this);
    this.dispatchEvent(ev);
  }, 1, this);
  return df;
};


/**
 * Get Html content from the DOM.
 * @return {string}
 */
mbi.wiki.Renderer.prototype.getHtmlContent = function() {
  return this.ele_content.firstElementChild.children[1].outerHTML; // div
};


/**
 * @inheritDoc
 */
mbi.wiki.Renderer.prototype.toString = function() {
  var lbl = this.page_ ? ':' + this.page_.getId() : '';
  return 'Renderer' + lbl;
};



/**
 * Event for change in active protein.
 * @param {Object} target Reference target.
 * @param {string?} uniprot_id selected uniprot id.
 * @param {string?} family_name selected uniprot id.
 * @param {string?} go GO annotations.
 * @constructor
 * @extends {mbi.wiki.Event}
 */
mbi.wiki.ActiveProteinChangedEvent = function(target, uniprot_id,
                                              family_name, go) {
  goog.base(this, mbi.wiki.Event.EventType.ACTIVE_PROTEIN, target);
  /**
   * @final
   * @type {string?}
   */
  this.uniprot_id = uniprot_id;
  /**
   * @final
   * @type {string?}
   */
  this.family_name = family_name || null;
  /**
   * @final
   * @type {string?}
   */
  this.go = go || null;
};
goog.inherits(mbi.wiki.ActiveProteinChangedEvent, mbi.wiki.Event);


/**
 * Events dispatched by dialogs.
 * @enum {string}
 */
mbi.wiki.Event.EventType = {
  ACTIVE_PROTEIN: 'active-protein',
  RENDERED: 'rendered',
  UPDATED: 'updated'
};

