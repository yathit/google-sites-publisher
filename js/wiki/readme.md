Google Sites wiki components
============================

UI components to render wiki HTML content and manipulate them.


Rendering process
-----------------

Google site wiki HTML content are read by [Google Site Data feed API]
(https://developers.google.com/google-apps/sites/docs/1.0/developers_guide_protocol#SitesFeed).
Its HTML content are simply attached to DOM DIV node. After attached, meta data
are analyzed and render directly on the DOM.

Source: `renderer.js`

### Reference rendering process

PMID citation are annotated as `name` attribute of a DOM node, with `'PMID:'` as
marker, follow by [PubMedID](http://www.ncbi.nlm.nih.gov/books/NBK3827/).


Updating process
----------------

Web app can manipulate some Google Site content. If there is such update, the
updated content are put back to Google Site data using the API.

Google Site does not allow `class` attribute on DOM Element. `name` attribute
are used to store meta data including class name by annotating with `wikic`
marker.

Source: `processor.js`


Publishing process
------------------

One primary purpose of this web app is to publish static HTML content from the
Google site wiki content.

Publishing process reuse rendering pipeline with DOM in iFrame.

See `bucket` sub-folder for backend storage and content delivery.

Source: `processor.js`
