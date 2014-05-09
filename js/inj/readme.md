Chrome Content Script for Google Site wiki editing
==================================================

This is module for [content script](http://developer.chrome.com/extensions/content_scripts.html)
injected into Google Site wiki editor UI. This module provide additional
functionality for importing wiki figure and annotation throw a menu.

This script is connected to the running instance of chrome app, which require
authenticated as MBInfo reviewer. Data are read and write to the chrome app.

Content script has to be compiled by `ant inj`, or  `ant inj-debug`, or  `ant inj-raw`.


Use of undocumented feature of Google Sites
-------------------------------------------

To inject UI component to the wiki editor, we need to select Element on the
Google Site DOM. The following undocumented class and id are used for the job.
These may change over time, and need to check if not working.

    class: sites-editor-toolbar-menurow, sites-ccc-nav
    id: sites-editor-button-sites-save, edit-start-btn

