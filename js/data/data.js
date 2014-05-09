/**
 * @fileoverview Data provider setting.
 */

goog.provide('mbi.data');
goog.provide('mbi.data.bi');
goog.require('mbi.bi.taxon');
goog.require('mbi.utils.storage');


/**
 * @type {goog.async.Deferred}
 * @private
 */
mbi.data.bi.df_protein_names_ = null;


/**
 * List all human protein names hash with uniprot id.
 * @return {goog.async.Deferred}
 */
mbi.data.bi.listProteinNames = function() {
  if (!mbi.data.bi.df_protein_names_) {
    mbi.data.bi.df_protein_names_ = new goog.async.Deferred();
    var list = {};
    var iter = new ydn.db.Iterator('protein');
    mbi.utils.storage.getStorage().open(function(cursor) {
      var val = /** @type {ProteinData} */ (cursor.getValue());
      if (val.name && val.taxonId == mbi.bi.taxon.Taxons.HUMAN && val.uniProtId) {
        list[val.name.toLocaleLowerCase()] = val.uniProtId;
        if (val.family) {
          list[val.family.toLocaleLowerCase()] = val.uniProtId;
        }
      }
    }, iter).addCallback(function() {
      mbi.data.bi.df_protein_names_.callback(list);
    });
  }
  return mbi.data.bi.df_protein_names_;
};

