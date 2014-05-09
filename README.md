# MBInfo Chrome Extension and web app

Configuration
-------------

Hardcoded application setting, like bucket name, site name are defined in
`js/admin/base.js`, `meta-data.js` and `js/data/data.js` files. Change them as necessary. Detail information about them are explained in the file itself.

Compiling bioinformatic data
----------------------------

Precompiled data for Gene ontology, Protein information, UniGene, etc are required. They are compiled in `mbinfo-app-script` module.

Debug process
-------------

See available tasks by `ant -p`. Mostly we want to build the main app `ant comp-ex-app`.

For day-to-day job, building is simply typing `ant build push` on this folder. This will upload edge version. If satisfy with it, progress stage to to dev and RC tracks.


Build process
-------------

Update build version `mbi-app-ver-patch` (and `major`, `minor`) in `build.xml`
file.

Build by `ant build`.


Deployment process for wiki web app
-----------------------------------

Run build process without error before deployment.

Update build version `mbi-app-ver-patch` (and `major`, `minor`) in `build.xml`
file.

Update app version `mbi.app.base.VERSION_STABLE` and `mbi.app.base.VERSION_BETA`
as necessary in js/admin/base.js file.

Deploy script upload html,css,js and image files from local to Google cloud storage.
To reduce bandwidth, some files must be cached very long while others need regular
check for update.

As rule of thumb, js and css files never change, except bootstrip js files. Images files
can be change, but infrequent. Depending on these require, cache-control max-age
header are set. All files are public cache.

`push-bootstrip` to upload bootstrip files.

`push-js` to upload latest build of js and bootstrip files.

`push-css` to upload latest build of css files.

All above three targets can be run by `push` ant target.

Note that, it doesn't push html files because there is only one html file to push,
called index.html. But this file generally does change and hence not push. All other
content html files are publish by the web app itself.


Deployment process for extension
--------------------------------

Above wiki web app deployment process also deploy js file for extension. However
updating for html or content js file are necessary, extension deployment must
be performed.

Run `ant crx` to package crx file. This will update `publish.dir` with necessary
contents in extension folder and zip as `extensions.zip`. Submit `extension.zip` in `publish.dir`
to [chrome web store](https://chrome.google.com/webstore/developer/dashboard).

[The app](https://chrome.google.com/webstore/detail/mbinfo-wiki-editor/fcojbcccmkgamiifkdkkcplcjniiemmj) can be installed from Chrome store. It is available to anyone, but not browsable.


Google cloud storage setup
--------------------------

Static web site is, currently, run on GCS backend. Creating bucket and configuration
can be found in `js/wiki/bucket/readme.md`.

See more in [Google cloud portal](https://cloud.google.com).


AWS CloudFront setup
--------------------

Optionally, to improve static content load performance, a CDN may setup. We are using
AWS CloudFront for HTML, CSS, FONT contents.

See more on [AWS console](https://console.aws.amazon.com).


Security
--------

Security is control by [browser origin policy](http://www.w3.org/Security/wiki/Same_Origin_Policy),
[secure content policy](http://developer.chrome.com/extensions/contentSecurityPolicy.html), token base
authorization, [access control list](https://developers.google.com/storage/docs/accesscontrol) and
 **exclusive** use of SSL transport for any web upload.

There are two javascript application, one for static web site and one for MBInfo reviewer. Static
web site web app are granted only read access, whereas MBInfo reviewer are full access to the buckets.
Note that MBInfo reviewer is different from MBInfo editor, which edit Google Site.
*MBInfo reviewer* are `mechanobio.info` account users who review the content and publish them.
*MBInfo editor* are self registered Google user to edit Google Site.

Bucket policy are defined in `acl.xml`, `cors.xml`, `default-acl.xml` files
in 'js/tools/upload`, `js/wiki/bucket` and `js/fig/gcs` folders,
for data, static web site and figure image respectively.

By default, a chrome web app cannot read or write to any domain. White list domains are
described in app manifest.

