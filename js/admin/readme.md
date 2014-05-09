WebApp
======

Webapp fetch Google site wiki content, analyze its meta data and collect
additional data from primary source, such as PubMed, NCBI, UniProt and finally
publish to static HTML site.


Life cycle of an app
--------------------


1. *Instantiation:* Create all objects to use an app.

2. *Auth:* Start authenticate process.

3. *Init:* Create DOM for UI. Invoke when DOM is ready. Invoke to all
components *init*.

4. *Run:* Run the application. At this time, authentication is finished. Invoke to all
components *run*.


Life cycle of an UI component
-----------------------------


1. *Instantiation:* Create all objects in the component except DOM.

2. *Init:* Create DOM for UI.

3. *Run:* Perform require process.


Configuration
-------------

For performance and ease of update, some of application data (should be part of application
binary) are keep separated into meta-data.js. See the file in root directory for
details about updating it. The file must be loaded first before running the application.
