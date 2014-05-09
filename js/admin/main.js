/**
 * @fileoverview Execution code for raw mode.
 */

mbi.web.base.log();
var booter = new mbi.admin.Bootstrip();
app = mbi.app.AdminApp.runApp();
booter.init();
