#!/bin/sh
# Copy site from on bucket to another bucket
#

OLD=test-2.mechanobio.info
BK=www.mechanobio.info

# gsutil mb gs://$BK
gsutil acl set acl.xml gs://$BK
gsutil defacl set default-acl.xml gs://$BK
gsutil cors set cors.xml   gs://$BK
gsutil web set -m index.html -e error404.html gs://$BK

# copy core files
gsutil cp gs://$OLD/index.html gs://$BK/index.html
gsutil cp gs://$OLD/cgi gs://$BK/cgi
gsutil cp gs://$OLD/error404.html gs://$BK/error404.html
gsutil cp gs://$OLD/favicon.ico gs://$BK/favicon.ico
gsutil cp -z png gs://$OLD/image/mbinfo-logo.png gs://$BK/image/mbinfo-logo.png
gsutil setmeta -h "Cache-Control: public, max-age=86400"  gs://$BK/image/mbinfo-logo.png
gsutil cp -z js gs://$OLD/jsc/raphael-min-2.1.0.js gs://$BK/jsc/raphael-min-2.1.0.js
gsutil setmeta -h "Cache-Control: public, max-age=2592000"  gs://$BK/jsc/raphael-min-2.1.0.js
gsutil cp gs://$OLD/gss/*.css gs://$BK/gss/
gsutil setmeta -h "Cache-Control: public, max-age=86400"  gs://$BK/gss/*
gsutil cp -R gs://$OLD/image/* gs://$BK/image/
gsutil setmeta -h "Cache-Control: public, max-age=86400"  gs://$BK/image/*
gsutil setmeta -h "Cache-Control: public, max-age=86400"  gs://$BK/image/home/*
gsutil cp -R gs://$OLD/js/*.js gs://$BK/js/

# copy all html files on root
# this will copy all version if version is enabled $BK
# gsutil cp gs://$OLD/*.html gs://$BK/


# finally turn on versioning
gsutil versioning set on gs://$BK