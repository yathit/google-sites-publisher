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
 * @fileoverview SVG controller.
 *
 * Inspire by:
 * https://code.google.com/p/svgpan/
 * https://github.com/mbostock/d3/blob/master/src/behavior/zoom.js
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

goog.provide('mbi.ui.SvgControl');
goog.require('goog.events.MouseWheelHandler');
goog.require('goog.net.XhrIo');
goog.require('goog.userAgent');



/**
 * SVG controller.
 * @param {Element} parent
 * @constructor
 */
mbi.ui.SvgControl = function(parent) {
  this.parent = parent;
};


/**
 * @protected
 * @type {goog.debug.Logger}
 */
mbi.ui.SvgControl.prototype.logger =
    goog.log.getLogger('mbi.ui.SvgControl');


/**
 * Load svg image.
 * @param {string} url
 */
mbi.ui.SvgControl.prototype.load = function(url) {
  var me = this;
  goog.net.XhrIo.send(url, function(e) {
    var xhr = /** @type {goog.net.XhrIo} */ (e.target);
    var svg = xhr.getResponseText();
    me.init(svg);
  });
};


/**
 * Initialize controls.
 * @param {string} svg
 */
mbi.ui.SvgControl.prototype.init = function(svg) {
  this.parent.innerHTML = svg;
  this.svgRoot = /** @type {SVGElement} */ (this.parent.firstElementChild);
  this.root =  /** @type {SVGElement} */ (this.svgRoot.firstElementChild);
  var mouse_wheel_handler = new goog.events.MouseWheelHandler(this.root);
  goog.events.listen(mouse_wheel_handler,
      goog.events.MouseWheelHandler.EventType.MOUSEWHEEL,
      this.handleMouseWheel, true, this);
  //goog.events.listen(this.parent, goog.events.EventType.MOUSEMOVE,
  //    this.handleMouseMove, false, this);
  //goog.events.listen(this.parent, goog.events.EventType.MOUSEDOWN,
  //    this.handleMouseDown, false, this);
  //goog.events.listen(this.parent, goog.events.EventType.MOUSEUP,
  //    this.handleMouseUp, false, this);
};


/**
 * 1 or 0: enable or disable panning (default enabled)
 * @type {number}
 */
mbi.ui.SvgControl.prototype.enablePan = 1;


/**
 * 1 or 0: enable or disable zooming (default enabled)
 * @type {number}
 */
mbi.ui.SvgControl.prototype.enableZoom = 1;


/**
 * 1 or 0: enable or disable dragging (default disabled)
 * @type {number}
 */
mbi.ui.SvgControl.prototype.enableDrag = 0;


/**
 * Zoom sensitivity
 * @type {number}
 */
mbi.ui.SvgControl.prototype.sensitivity = 0.1;


/**
 * @type {SVGElement}
 */
mbi.ui.SvgControl.prototype.root;


/**
 * @type {string}
 */
mbi.ui.SvgControl.prototype.state = 'none';


/**
 * @type {Element}
 */
mbi.ui.SvgControl.prototype.svgRoot = null;


/**
 * Sets the current transform matrix of an element.
 * @param {Element} element
 * @param {SVGMatrix} matrix
 */
mbi.ui.SvgControl.setCTM = function(element, matrix) {
  var s = 'matrix(' + matrix.a + ',' + matrix.b + ',' + matrix.c + ',' +
      matrix.d + ',' + matrix.e + ',' + matrix.f + ')';

  element.setAttribute('transform', s);
};


/**
 * Handle mouse wheel event.
 * @param {goog.events.MouseWheelEvent} evt
 */
mbi.ui.SvgControl.prototype.handleMouseWheel = function(evt) {
  if (!this.enableZoom) {
    return;
  }

  evt.preventDefault();

  evt.returnValue = false;

  var root = this.root;

  var delta = evt.detail / -90;

  var z = Math.pow(1 + this.sensitivity, delta);

  this.scale(z, evt.clientX, evt.clientY);

  // console.log([evt.detail, delta, z])
  // this.stateTf = this.stateTf.multiply(k.inverse());
};


/**
 * @return {!goog.math.Coordinate}
 */
mbi.ui.SvgControl.prototype.getPageOffset = function() {
  if (!this.page_offset_) {
    this.page_offset_ = goog.style.getPageOffset(this.svgRoot);
  }
  return this.page_offset_;
};


/**
 * Scale image.
 * @param {number} z zoom factor.
 * @param {number=} opt_center_x
 * @param {number=} opt_center_y
 */
mbi.ui.SvgControl.prototype.scale = function(z, opt_center_x, opt_center_y) {

  if (!goog.isDef(opt_center_x)) {
    var size = goog.dom.getViewportSize();
    opt_center_x = size.width / 2;
    opt_center_y = size.height / 2;
  }
  var offset = this.getPageOffset();

  var p = this.svgRoot.createSVGPoint();
  p.x = (opt_center_x || 0) - offset.x;
  p.y = (opt_center_y || 0) - offset.y;
  p = p.matrixTransform(this.root.getCTM().inverse());

  // Compute new scale matrix in current mouse position
  var k = this.svgRoot.createSVGMatrix()
      .translate(p.x, p.y)
      .scale(z)
      .translate(-p.x, -p.y);

  var ctm = this.root.getCTM().multiply(k);
  mbi.ui.SvgControl.setCTM(this.root, ctm);
};

