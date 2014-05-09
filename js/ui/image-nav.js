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



goog.provide('mbi.ui.ImageNav');
goog.require('goog.events');
goog.require('goog.fx.dom.ResizeWidth');
goog.require('goog.fx.easing');
goog.require('goog.soy');
goog.require('mbi.templ.ui');



/**
 * Image base navigation.
 * @constructor
 */
mbi.ui.ImageNav = function() {
  /**
   * @type {Element}
   * @protected
   */
  this.root = null;
};


/**
 * @define {boolean} debug flag.
 */
mbi.ui.ImageNav.DEBUG = false;


/**
 * @final
 * @type {string}
 */
mbi.ui.ImageNav.prototype.basePath = 'https://mbinfo.storage.googleapis.com/';


mbi.ui.ImageNav.prototype.queryNavSiteMap = function() {

};


/**
 * Get nav sitemap by predefined value.
 * @return {{panel_base: Array, panel_q1: Array, panel_q2: Array, panel_q3: Array, panel_q4: Array}}
 */
mbi.ui.ImageNav.prototype.getNavSiteMap = function() {
  var panel_base = [{
    title: 'Cytoskeleton Dynamics',
    links: [{
      url: '/topics/cytoskeleton-dynamics/go-0032059',
      title: 'Bleb'
    }, {
      url: '/topics/cytoskeleton-dynamics/go-0043292',
      title: 'Contractile Fiber'
    }, {
      url: '/topics/cytoskeleton-dynamics/go-0030175',
      title: 'Filopodium'
    }, {
      url: '/topics/cytoskeleton-dynamics/go-0071437',
      title: 'Invadopodium'
    }, {
      url: '/topics/cytoskeleton-dynamics/go-0030027',
      title: 'Lamellipodium'
    }]
  }, {
    title: 'Cellular Organization',
    links: [{
      url: '/topics/cellular-organization/go-0072583',
      title: 'Clathrin-mediated endocytosis'
    }, {
      url: '/topics/cellular-organization/go-0005882',
      title: 'Intermediate filament'
    }, {
      url: '/topics/cellular-organization/go-0005874',
      title: 'Microtubule'
    }]
  }, {
    title: 'Synthesis',
    links: [{
      url: '/topics/synthesis',
      title: 'Synthesis'
    }]
  }, {
    title: 'Signaling',
    links: [{
      url: '/topics/signaling/cell-matrix-adhesion',
      title: 'Cell-Matrix Adhesion'
    }, {
      url: '/topics/signaling/cell-matrix-adhesion',
      title: 'Cell-cell signaling'
    }]
  }];
  var panel_q1 = [{
    links: [{
      url: '/topics/signaling/cell-matrix-adhesion',
      title: 'Cell-Matrix Adhesion'
    }, {
      url: '/topics/signaling/cell-matrix-adhesion',
      title: 'Cell-cell signaling'
    }]
  }];
  var panel_q2 = [{
    links: [{
      url: '/topics/cellular-organization/intermediate-filament',
      title: 'Intermediate filament'
    }, {
      url: '/topics/cellular-organization/microtubule',
      title: 'Microtubule'
    }, {
      url: '/topics/cellular-organization/receptor-mediated-endocytosis',
      title: 'receptor-mediated endocytosis'
    }]
  }];
  var panel_q3 = [{
    links: [{
      url: '/topics/synthesis',
      title: 'Synthesis'
    }]
  }];
  var panel_q4 = [{
    links: [{
      url: '/topics/cytoskeleton-dynamics/bleb',
      title: 'Bleb'
    }, {
      url: '/topics/cytoskeleton-dynamics/contractile-fiber',
      title: 'Contractile Fiber'
    }, {
      url: '/topics/cytoskeleton-dynamics/filopodium',
      title: 'Filopodium'
    }, {
      url: '/topics/cytoskeleton-dynamics/invadopodium',
      title: 'Invadopodium'
    }, {
      url: '/topics/cytoskeleton-dynamics/lamellipodium',
      title: 'Lamellipodium'
    }, {
      url: '/topics/cytoskeleton-dynamics/podosome',
      title: 'Podosome'
    }, {
      url: '/topics/cytoskeleton-dynamics/stress-fiber',
      title: 'Stress Fiber'
    }]
  }];
  return {
    panel_base: panel_base,
    panel_q1: panel_q1,
    panel_q2: panel_q2,
    panel_q3: panel_q3,
    panel_q4: panel_q4
  };
};


/**
 * Initialize UI.
 * @param {Element} ele
 */
mbi.ui.ImageNav.prototype.init = function(ele) {
  var nav_site_map = this.getNavSiteMap();
  var url_base = window.location.protocol == 'chrome-extension:' ? '#page' : '';
  var opt = {
    url_base: url_base,
    imgUrl: this.basePath + 'image/img-nav/base.png',
    panels: nav_site_map.panel_base
  };
  goog.soy.renderElement(ele, mbi.templ.ui.imgNav, opt);
  var ele_panels = goog.dom.getElementByClass('imgnav-panels', ele);
  this.root = goog.dom.getElementByClass('imgnav-base', this.root);
  var first_cell = goog.dom.getElementByClass('first', this.root);
  var first_img = first_cell.children[0];
  var ini_width = 187; // goog.style.getSize(first_cell).width;
  var final_width = ini_width * 5;
  // console.log(ini_width, final_width);
  var d = 1000;
  var protruded = false;
  var fixed = false;
  var protrude = new goog.fx.dom.ResizeWidth(this.root, ini_width, final_width,
      d, goog.fx.easing.easeOut);
  goog.events.listen(protrude, goog.fx.Transition.EventType.BEGIN, function() {
    goog.dom.classes.add(this.root, 'imgnav-base-active');
  }, false, this);
  goog.events.listen(protrude, goog.fx.Transition.EventType.END, function() {
    protruded = true;
  }, false, this);
  var retract = new goog.fx.dom.ResizeWidth(this.root, final_width, ini_width,
      d, goog.fx.easing.easeOut);
  goog.events.listen(retract, goog.fx.Transition.EventType.END, function() {
    goog.dom.classes.remove(this.root, 'imgnav-base-active');
    protruded = false;
  }, false, this);
  goog.events.listen(this.root, goog.events.EventType.MOUSEOUT, function(e) {
    var in_base = goog.dom.classes.has(e.target, 'imgnav-base');
    if (mbi.ui.ImageNav.DEBUG) {
      window.console.log('root MOUSEOUT', protruded, in_base);
    }
    if (protruded && in_base) {
      // console.log(e.target, e.currentTarget)
      protrude.stop();
      retract.play();
    }
  }, false, this);
  /*
  goog.events.listen(this.root, goog.events.EventType.MOUSEMOVE, function(e) {
    if (mbi.ui.ImageNav.DEBUG) {
      window.console.log('root MOUSEMOVE', fixed, protruded);
    }
    if (!fixed && protruded && retract.isPlaying()) {
      // console.log(e.target, e.currentTarget)
      retract.stop();
      protrude.play();
    }
  }, false, this);
  */
  goog.events.listen(first_cell, 'click', function(e) {

    showMenu.call(this, e);
    if (protruded) {
      protrude.stop();
      retract.play();
      protruded = false;
      fixed = false;
    } else {
      retract.stop();
      protrude.play();
      protruded = true;
      fixed = true;
    }
    if (mbi.ui.ImageNav.DEBUG) {
      window.console.log('first_cell click', fixed, protruded);
    }
  }, true, this);
  // hover effect
  var cutoff;

  var showMenu = function(e) {
    if (!cutoff) {
      var size = goog.style.getSize(first_img);
      cutoff = size.width / 2;
    }
    var core = 30;
    var core1 = cutoff - core;
    var core2 = cutoff + core;
    if (e.offsetX > core1 && e.offsetX < core2 &&
        e.offsetY > core1 && e.offsetY < core2) {
      first_img.src = this.basePath + 'image/img-nav/base.png';
      goog.soy.renderElement(ele_panels, mbi.templ.ui.imgPanel, {
        url_base: url_base,
        panels: nav_site_map.panel_base
      });
    } else if (e.offsetX < cutoff) {
      if (e.offsetY < cutoff) {
        first_img.src = this.basePath + 'image/img-nav/q4.png';
        goog.soy.renderElement(ele_panels, mbi.templ.ui.imgPanel, {
          url_base: url_base,
          panels: nav_site_map.panel_q4
        });
      } else {
        first_img.src = this.basePath + 'image/img-nav/q3.png';
        goog.soy.renderElement(ele_panels, mbi.templ.ui.imgPanel, {
          url_base: url_base,
          panels: nav_site_map.panel_q3
        });
      }
    } else {
      if (e.offsetY < cutoff) {
        first_img.src = this.basePath + 'image/img-nav/q1.png';
        goog.soy.renderElement(ele_panels, mbi.templ.ui.imgPanel, {
          url_base: url_base,
          panels: nav_site_map.panel_q1
        });
      } else {
        first_img.src = this.basePath + 'image/img-nav/q2.png';
        goog.soy.renderElement(ele_panels, mbi.templ.ui.imgPanel, {
          url_base: url_base,
          panels: nav_site_map.panel_q2
        });
      }
    }
  };

  goog.events.listen(first_cell, goog.events.EventType.MOUSEMOVE, function(e) {
    if (mbi.ui.ImageNav.DEBUG) {
      window.console.log('first_cell MOUSEMOVE', fixed);
    }
    if (fixed) {
      return;
    }
    showMenu.call(this, e);
  }, false, this);
  goog.events.listen(first_cell, goog.events.EventType.MOUSEOUT, function(e) {
    if (mbi.ui.ImageNav.DEBUG) {
      window.console.log('first_cell MOUSEOUT', fixed);
    }
    first_img.src = this.basePath + 'image/img-nav/base.png';
  }, false, this);
};

