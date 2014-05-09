/**
 * @fileoverview Base variables.
 */

goog.provide('mbi.app.base');


/**
 * @const
 * @type {string}
 */
mbi.app.base.LOCAL_STORE_PREFIX = 'app';


/**
 * @enum {string}
 */
mbi.app.base.SessionKey = {
  LAST_URL: 'lu',
  USER_SETTING: 'st'
};


/**
 * @define {string} version major.
 */
mbi.app.base.VERSION_MAJOR = '';


/**
 * @define {string} version minor.
 */
mbi.app.base.VERSION_MINOR = '';


/**
 * @define {string} version patch.
 */
mbi.app.base.VERSION_PATCH = '';


/**
 * @const
 * @type {string}
 */
mbi.app.base.VERSION = mbi.app.base.VERSION_MAJOR + '.' +
    mbi.app.base.VERSION_MINOR + '.' +
    mbi.app.base.VERSION_PATCH;


/**
 * @const
 * @type {string}
 */
mbi.app.base.PREVIOUS_STABLE = '1.5.2';


/**
 * @const
 * @type {string}
 */
mbi.app.base.VERSION_STABLE = '1.5.9';


/**
 * @const
 * @type {string}
 */
mbi.app.base.VERSION_BETA = '1.5.12';


/**
 * @const
 * @type {string}
 */
mbi.app.base.VERSION_RC = mbi.app.base.VERSION_STABLE;


/**
 * Static HTML output bucket name.
 * @type {string}
 * @const
 */
mbi.app.base.BUCKET_SITE = !COMPILED ?
    'mbinfo-wiki-3' : 'www.mechanobio.info';


/**
 * Static HTML output bucket name.
 * @type {string}
 * @const
 */
mbi.app.base.SITE_DOMAIN = !COMPILED ?
    'test-3.mechanobio.info' : 'www.mechanobio.info';


/**
 * @const
 * @type {string}
 */
mbi.app.base.TOPICS_PAGE_ID = COMPILED ? '4692947566055243267' :
    '4692947566055243267';


/**
 * @const
 * @type {string}
 */
mbi.app.base.MODULE_PAGE_ID = COMPILED ? '4708536903788348319' :
    '4708536903788348319';


/**
 * @const
 * @type {string}
 */
mbi.app.base.HELP_PAGE_ID = '5042300758476241393';


/**
 * Figure bucket name.
 * @type {string}
 * @const
 */
mbi.app.base.BUCKET_FIG = 'mbi-figure';


/**
 * Key prefix for figures.
 * @type {string}
 * @const
 */
mbi.app.base.BUCKET_FIG_PREFIX = 'figure/';


/**
 * @enum {string}
 */
mbi.app.base.Theme = {
  DESKTOP: 'featured',
  SIMPLICITY: 'simplicity',
  MOBILE: 'mobile',
  TABLET: 'tablet'
};


/**
 * @const
 * @type {string}
 */
mbi.app.base.THEME_DEFAULT = mbi.app.base.Theme.DESKTOP;


/**
 * @define {string} assess server domain.
 */
mbi.app.base.DOMAIN_ASSESS = 'mbinfo.storage.googleapis.com';


/**
 * Production track.
 * @enum {string}
 */
mbi.app.base.Track = {
  PREVIOUS: 'previous',
  STABLE: 'stable',
  BETA: 'beta',
  EDGE: 'edge'
};


/**
 * Channel name.
 * @type {string}
 */
mbi.app.base.SERVICE_NAME = 'service';


/**
 * Background service request names.
 * @enum {string}
 */
mbi.app.base.Req = {
  ECHO: 'ec',
  LIST_OF_FIGURES: 'lof',
  PUBLISH: 'pb'
};


/**
 * Get value from session cache.
 * @param {mbi.app.base.SessionKey} key
 * @return {Object}
 */
mbi.app.base.getCache = function(key) {
  if (goog.global.localStorage) {
    var value = goog.global.localStorage.getItem(
        mbi.app.base.LOCAL_STORE_PREFIX + '-' + key);
    if (value) {
      return /** @type {Object} */ (JSON.parse(value));
    }
  }
  return null;
};


/**
 * Get value from session cache.
 * @param {mbi.app.base.SessionKey} key
 * @param {Object} value
 */
mbi.app.base.setCache = function(key, value) {
  var app_key = mbi.app.base.LOCAL_STORE_PREFIX + '-' + key;
  if (goog.isObject(value)) {
    for (var k in value) {
      if (!goog.isDefAndNotNull(value[k])) {
        delete value[k]; // undefined and null value are not stringify.
      }
    }
    goog.global.localStorage.setItem(app_key, JSON.stringify(value));
  } else {
    goog.global.localStorage.removeItem(app_key);
  }
};


/**
 * v1beta1, v1beta2
 * @const
 * @type {string}
 */
mbi.app.base.GAPI_STORAGE_VERSION = 'v1beta2';


/**
 * @const
 * @type {string}
 */
mbi.app.base.GAPI_KEY = 'AIzaSyD_z-CCAyGYPilyXIc8vczRAWpNpGt1KJs';


/**
 * @const
 * @type {string}
 */
mbi.app.base.GAE_HOSTNAME = 'mbi-bk.appspot.com';


/**
 * @const
 * @type {string}
 */
mbi.app.base.LOGIN_ORIGIN = 'https://' + mbi.app.base.GAE_HOSTNAME;


/**
 * @const
 * @type {string}
 */
mbi.app.base.OPTION_PAGE = !COMPILED ? 'mbi-app/app-dev.html' : 'app-dev.html';


/**
 * Site name for topic page. This is also store name.
 * @const
 * @type {string}
 */
mbi.app.base.TOPIC_SITE_NAME = COMPILED ? 'mbinfo_go_2013' : 'mbinfo_go_2013-test-12';


/**
 * Domain name for topic page.
 * @const
 * @type {string}
 */
mbi.app.base.TOPIC_DOMAIN_NAME = 'mechanobio.info';


/**
 * Site base url.
 * @const
 * @type {string}
 */
mbi.app.base.TOPIC_SITE_URL = 'https://sites.google.com/a/' + mbi.app.base.TOPIC_DOMAIN_NAME + '/' +
    mbi.app.base.TOPIC_SITE_NAME;


/**
 * Suitable protocol.
 * @type {string}
 * @final
 */
mbi.app.base.protocol = goog.string.startsWith(window.location.protocol,
    'http') ? window.location.protocol : 'https:';


/**
 * @final
 * @type {boolean}
 */
mbi.app.base.isChromeExtension = !!goog.global.chrome && !!goog.global.chrome.extension;


/**
 * @const
 * @type {string}
 */
mbi.app.base.SITE_DB_NAME = COMPILED ? 'mbinfo-wiki' : 'mbinfo-wiki-dev';


/**
 * Bioinformatic data bucket name.
 * @const
 * @type {string}
 */
mbi.app.base.DATA_BUCKET = 'mbi-data';


/**
 * Bioinformatic data origin.
 * @const
 * @type {string}
 */
mbi.app.base.ORIGIN_DATA_BASE = 'https://mbi-data.storage.googleapis.com';


/**
 * Bioinformatic data origin.
 * @const
 * @type {string}
 */
mbi.app.base.URL_DATA_BASE = mbi.app.base.ORIGIN_DATA_BASE + '/' + mbi.app.base.TOPIC_SITE_NAME + '/';


/**
 * @const
 * @type {string}
 */
mbi.app.base.URL_IMAGE_BASE = 'https://mbinfo.storage.googleapis.com/image/';


/**
 * @const
 * @type {string}
 */
mbi.app.base.STORE_NAME_DEFINITION = 'definition';


/**
 * @const
 * @type {string}
 */
mbi.app.base.STORE_NAME_MODULES = 'modules';


/**
 * @const
 * @type {string} general data
 */
mbi.app.base.STORE_NAME_DATA = 'data';


/**
 * @param {string} name
 * @return {string}
 */
mbi.app.base.buildSitemapCacheUrl = function(name) {
  return mbi.app.base.ORIGIN_DATA_BASE + '/' +
      mbi.app.base.TOPIC_SITE_NAME + '/' + name + '.json';
};


/**
 * @const
 * @type {string} Url for topic sitemap JSON data.
 */
mbi.app.base.SITEMAP_TOPIC_URL =
    mbi.app.base.buildSitemapCacheUrl(mbi.app.base.TOPICS_PAGE_ID);


/**
 * @const
 * @type {string} Url for topic sitemap JSON data.
 */
mbi.app.base.SITEMAP_MODULE_URL =
    mbi.app.base.buildSitemapCacheUrl(mbi.app.base.MODULE_PAGE_ID);


/**
 * @const
 * @type {string} Url for topic sitemap JSON data.
 */
mbi.app.base.SITEMAP_HELP_URL =
    mbi.app.base.buildSitemapCacheUrl(mbi.app.base.HELP_PAGE_ID);


/**
 * @const
 * @type {string} Url for topic sitemap JSON data.
 */
mbi.app.base.SITEMAP_HOME_URL =
    mbi.app.base.buildSitemapCacheUrl('home');
