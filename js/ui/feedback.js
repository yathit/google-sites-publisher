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
 * @fileoverview  DOM Feedback Tool.
 *
 * Inspire by:
 * https://github.com/jankuca/dom-feedback
 * @author mbikt@nus.edu.sg (Kyaw Tun)
 */

/**
 * @preserve
 * DOM Feedback Tool.
 *
 * @author Jan Kuca <jan@jankuca.com>, http://jankuca.com
 * @license Creative Commons 3.0 Attribution/Share-alike Licence.
 *
 */


goog.provide('mbi.ui.fb');
goog.provide('mbi.ui.fb.DOMFeedback');



/**
 * @interface
 * @param {Object=} params Parameters.
 */
mbi.ui.fb.IDomFeedback = function(params) {
};


/**
 * Initializes the tool
 *
 * @param {function()} callback Callback function to be called after
 * the initialization.
 */
mbi.ui.fb.IDomFeedback.prototype.init = function(callback) {
};


/**
 * Activates the given tool
 *
 * @param {mbi.web.DomFeedback.Tools} tool ID of the tool to activate.
 */
mbi.ui.fb.IDomFeedback.prototype.setTool = function(tool) {
};


/**
 * @interface
 * @param {number} width Layer width.
 * @param {number} height Layer height.
 */
mbi.ui.fb.ICanvasLayer = function(width, height) {
};
mbi.ui.fb.ICanvasLayer.prototype.fill = function(color) {
};
mbi.ui.fb.ICanvasLayer.prototype.highlight = function(x, y, width, height) {
};
mbi.ui.fb.ICanvasLayer.prototype.blacken = function(x, y, width, height) {
};


/**
 * @interface
 * @param {number} width Layer width.
 * @param {number} height Layer height.
 */
mbi.ui.fb.Imbi.ui.fb.BroadcastLayer = function(width, height) {
};
mbi.ui.fb.Imbi.ui.fb.BroadcastLayer.prototype.load = function(path) {
};
mbi.ui.fb.Imbi.ui.fb.BroadcastLayer.prototype.onmessage = function(data) {
};


/**
 * @interface
 * @param {Object} window The window of which to take snapshots.
 */
function Imbi.ui.fb.DOMSnapshot(window) {
}

/**
 * Returns a list of class names of the root <html> element
 *
 * @return {Array} A list of class names.
 */
Imbi.ui.fb.DOMSnapshot.prototype.getRootClassNames = function() {
};

/**
 * Returns an unsafe snapshot
 *
 * @param {boolean=} include_root Should the output HTML include the <html> tag.
 * @return {string} Output HTML.
 */
Imbi.ui.fb.DOMSnapshot.prototype.getUnsafe = function(include_root) {
};

/**
 * Returns an unsafe snapshot
 *
 * @param {boolean=} include_root Should the output HTML include the <html> tag.
 * @return {string} Output HTML.
 */
Imbi.ui.fb.DOMSnapshot.prototype.getSafe = function(include_root) {
};


/**
 * The feedback tool
 *
 * @constructor
 * @implements {mbi.ui.fb.IDomFeedback}
 * @param {Object=} params Parameters.
 * @throws Error
 */
mbi.web.DomFeedback = function(params) {
  if (!params['broadcast']) {
    throw new Error('Broadcast path is required');
  }

  this.params = {
    broadcast: params['broadcast'],
    mask: params.mask || [0, 0, 0]
  };
  this.tool = mbi.web.DomFeedback.Tools.HIGHLIGHTER;
};

/**
 * Tools
 *
 * @enum {number}
 */
mbi.web.DomFeedback.Tools = {
  HIGHLIGHTER: 1,
  BLACKENER: 2
};

mbi.web.DomFeedback.prototype['init'] = function(callback) {
  var width = document.documentElement.scrollWidth;
  var height = Math.max(
      global.innerHeight,
      document.documentElement.scrollHeight
  );

  var snap = this.takeSnapshot();

  this.mask = new mbi.ui.fb.MaskLayer(width, height, this.params.mask);

  this.broadcast = new mbi.ui.fb.BroadcastLayer(width, height);
  this.broadcast.load(this.params.broadcast, snap[0], snap[1], callback);
  this.listenToBroadcast();

  this.tool = mbi.web.DomFeedback.Tools.HIGHLIGHTER;
};

mbi.web.DomFeedback.prototype['setTool'] = function(tool) {
  this.tool = tool;
};

/**
 * Sets up a listener for messages from the broadcast
 *
 * @protected
 */
mbi.web.DomFeedback.prototype.listenToBroadcast = function() {
  var that = this;

  var onclick = function(data) {
    var area = [
      data.offsetX - 5, data.offsetY - 5,
      data.width + 10, data.height + 10
    ];
    var mask = that.mask;
    if (that.tool === mbi.web.DomFeedback.Tools.HIGHLIGHTER) {
      mask.highlight.apply(mask, area);
    } else if (that.tool === mbi.web.DomFeedback.Tools.BLACKENER) {
      mask.blacken.apply(mask, area);
    }
  };
  var onmouseover = function(data) {
    var area = [
      data.offsetX - 5, data.offsetY - 5,
      data.width + 10, data.height + 10,
      (that.tool === mbi.web.DomFeedback.Tools.BLACKENER)
    ];
    if (that.tool === mbi.web.DomFeedback.Tools.HIGHLIGHTER
        || that.tool === mbi.web.DomFeedback.Tools.BLACKENER) {
      that.mask.restore();
      that.mask.focus.apply(that.mask, area);
    }
  };

  this.broadcast.onmessage = function(data) {
    switch (data.type) {
      case 'click':
        if (data.tagName !== 'BODY' && data.tagName !== 'HTML') {
          onclick(data);
        }
        break;
      case 'mouseover':
        if (data.tagName !== 'BODY' && data.tagName !== 'HTML') {
          onmouseover(data);
        }
        break;
      case 'mouseout':
        that.mask.restore();
        break;
    }
  };
};

/**
 * Requests a snapshot
 *
 * @protected
 * @return {Array.<string, Array>} The snapshot.
 */
mbi.web.DomFeedback.prototype.takeSnapshot = function() {
  var snapshot = new mbi.ui.fb.DOMSnapshot(goog.global);
  return [
    snapshot.getSafe(),
    snapshot.getRootClassNames()
  ];
};


/**
 * Mask layer based on HTML5 Canvas
 *
 * @constructor
 * @implements {mbi.ui.fb.ICanvasLayer}
 * @param {number} width Width of the layer.
 * @param {number} height Height of the layer.
 */
mbi.ui.fb.MaskLayer = function(width, height, color) {
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  document.body.appendChild(canvas);

  this.color = color;
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
  this.areas = [];

  this.fill();
};

/**
 * Restores the original filling and all highlights and blackenings
 */
mbi.ui.fb.MaskLayer.prototype.restore = function() {
  this.clear();
  this.fill();

  var areas = this.areas;
  var area;
  for (var i = 0, ii = areas.length; i < ii; ++i) {
    area = areas[i];
    if (!area[4]) {
      this.highlight.call(this, area[0], area[1],
          area[2], area[3], true);
    } else {
      this.blacken.call(this, area[0], area[1],
          area[2], area[3], true);
    }
  }
};

/**
 * Cuts a fully transparent rectangle
 *
 * @param {number} x Top-left corner position (x coordinate).
 * @param {number} y Top-left corner position (y coordinate).
 * @param {number} width Width of the rectangle.
 * @param {number} height Height of the rectangle.
 * @param {boolean=} restore Called during restoration.
 */
mbi.ui.fb.MaskLayer.prototype.highlight = function(x, y, width, height, restore) {
  this.ctx.globalCompositeOperation = 'destination-out';
  this.ctx.fillStyle = '#000000';
  this.rectangle(x, y, width, height);

  if (!restore) {
    this.areas.push([x, y, width, height, false]);
  }
};

/**
 * Draws a fully opaque black rectangle
 *
 * @param {number} x Top-left corner position (x coordinate).
 * @param {number} y Top-left corner position (y coordinate).
 * @param {number} width Width of the rectangle.
 * @param {number} height Height of the rectangle.
 * @param {boolean=} restore Called during restoration.
 */
mbi.ui.fb.MaskLayer.prototype.blacken = function(x, y, width, height, restore) {
  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.fillStyle = '#000000';
  this.rectangle(x, y, width, height);

  if (!restore) {
    this.areas.push([x, y, width, height, true]);
  }
};

/**
 * Temporarily cuts a semi-transparent rectangle
 *
 * @param {number} x Top-left corner position (x coordinate).
 * @param {number} y Top-left corner position (y coordinate).
 * @param {number} width Width of the rectangle.
 * @param {number} height Height of the rectangle.
 * @param {boolean=} blacken Black rather than white.
 */
mbi.ui.fb.MaskLayer.prototype.focus = function(x, y, width, height, blacken) {
  this.ctx.globalCompositeOperation = blacken ? 'source-over' : 'destination-out';
  this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  this.rectangle(x, y, width, height);
};

/**
 * Draws a rounded rectangle
 *
 * @param {number} x Top-left corner position (x coordinate).
 * @param {number} y Top-left corner position (y coordinate).
 * @param {number} width Width of the rectangle.
 * @param {number} height Height of the rectangle.
 */
mbi.ui.fb.MaskLayer.prototype.rectangle = function(x, y, width, height) {
  var ctx = this.ctx;
  ctx.beginPath();
  ctx.moveTo(x + 5, y);
  ctx.lineTo(x + width - 5, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + 5);
  ctx.lineTo(x + width, y + height - 5);
  ctx.quadraticCurveTo(x + width, y + height, x + width - 5, y + height);
  ctx.lineTo(x + 5, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - 5);
  ctx.lineTo(x, y + 5);
  ctx.quadraticCurveTo(x, y, x + 5, y);
  ctx.fill();
};

/**
 * Removes all contents from the canvas
 */
mbi.ui.fb.MaskLayer.prototype.clear = function() {
  this.ctx.globalCompositeOperation = 'destination-out';
  this.ctx.fillStyle = '#000000';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * Fills the whole canvas
 */
mbi.ui.fb.MaskLayer.prototype.fill = function() {
  var hex2rgb = function(hex) {
    hex = parseInt(hex, 16);
    return [
      (hex & 0xFF0000) >> 16,
      (hex & 0x00FF00) >> 8,
      (hex & 0x0000FF)
    ];
  };

  var color = this.color;
  if (color instanceof Array === false) {
    color = hex2rgb(color);
  }

  this.ctx.globalCompositeOperation = 'source-over';
  this.ctx.fillStyle = 'rgba(' + color.join(', ') + ', 0.5)';
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};


/**
 * Broadcasting layer
 *
 * @constructor
 * @implements {mbi.ui.fb.Imbi.ui.fb.BroadcastLayer}
 * @param {number} width Width of the layer.
 * @param {number} height Height of the layer.
 */
mbi.ui.fb.BroadcastLayer = function(width, height) {
  var iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = width + 'px';
  iframe.style.height = height + 'px';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  this.iframe = iframe;
};

mbi.ui.fb.BroadcastLayer.prototype.onmessage = function(data) {
};

/**
 * Loads a file of the given path into the layer
 *
 * @param {string} path A path.
 * @param {string} html HTML input.
 * @param {Array} class_names A list of class names of the root <html> element.
 * @param {function()} callback Callback function to be called after the load.
 */
mbi.ui.fb.BroadcastLayer.prototype.load = function(path, html, class_names, callback) {
  var self = this;
  var iframe = this.iframe;

  var onmessage = function(e) {
    var data = e.data;
    self.onmessage.call(self, data);
  };

  iframe.src = path;
  iframe.onload = function() {
    var root = iframe.contentWindow.document.documentElement;
    root.className = class_names.join(' ');
    root.innerHTML = html;
    global.addEventListener('message', onmessage, false);
    if (typeof callback === 'function') {
      callback();
    }
  };
};


/**
 * DOM Snapshot
 *
 * @constructor
 * @implements {Imbi.ui.fb.DOMSnapshot}
 * @param {Object} window The window of which to take snapshots.
 */
mbi.ui.fb.DOMSnapshot = function(window) {
  this.window = window;
};

/**
 * Returns a list of class names of the root <html> element
 *
 * @return {Array} A list of class names.
 */
mbi.ui.fb.DOMSnapshot.prototype.getRootClassNames = function() {
  var root = this.window.document.documentElement;
  if (root.classList) {
    return Array.prototype.slice.call(root.classList);
  }
  if (root.className) {
    var list = root.className.split(/\s+/);
    var out = [];
    for (var i = list, ii = list.length; i < ii; ++i) {
      if (list[i]) {
        out.push(list[i]);
      }
    }
    return out;
  }
  return [];
};

/**
 * Makes an unsafe snapshot
 * Returns the complete HTML structure
 *
 * @param {boolean=} include_root Should the output HTML include the <html> tag.
 * @return {string} Output HTML.
 */
mbi.ui.fb.DOMSnapshot.prototype.getUnsafe = function(include_root) {
  var snapshot;
  if (include_root) {
    snapshot = this.window.document.documentElement.outerHTML;
  } else {
    snapshot = this.window.document.documentElement.innerHTML;
  }
  return snapshot;
};

/**
 * Makes a safe snapshot
 * Removes any <script> tags and makes all paths absolute
 *
 * @param {boolean=} include_root Should the output HTML include the <html> tag.
 * @return {string} Output HTML.
 */
mbi.ui.fb.DOMSnapshot.prototype.getSafe = function(include_root) {
  var snapshot = this.getUnsafe(include_root);
  snapshot = this._removeScripts(snapshot);
  snapshot = this._absolutize(snapshot);
  return snapshot;
};

/**
 * Removes any <script> tags
 *
 * @param {string} snapshot Input HTML.
 * @return {string} Output HTML.
 */
mbi.ui.fb.DOMSnapshot.prototype._removeScripts = function(snapshot) {
  return snapshot.replace(/<script[^>]*?>[\s\S]*<\/script>/gi, '');
};

/**
 * Makes all paths absolute
 *
 * @param {string} snapshot Input HTML.
 * @return {string} Output HTML.
 */
mbi.ui.fb.DOMSnapshot.prototype._absolutize = function(snapshot) {
  var origin = global.location.protocol + '//' + global.location.host;
  var dirs = global.location.pathname.split(/\//g).slice(1, -1);

  var global_rx = /\s(type|href|src)="?(\.\.?|\/)[^\s">]*/gi;
  var single_rx = /(\s)(type|href|src)(="?)((?:\.\.?|\/)[^\s">]*)/i;

  snapshot = snapshot.replace(global_rx, function(match) {
    if (match.search('://') !== -1) {
      return match;
    }

    match = match.match(single_rx);
    var prefix = match[1] + match[2] + match[3];
    var link = match[4];

    if (link[0] === '/') {
      return prefix + origin + link;
    }

    link = link.split(/\//g);
    for (var i = 0; link[i] === '..' && i < link.length; ++i) {
    }
    return prefix + origin + (i !== dirs.length ? '/' : '') +
        dirs.slice(0, dirs.length - i).join('/') + '/' +
        link.slice(i, link.length).join('/');
  });
  return snapshot;
};

