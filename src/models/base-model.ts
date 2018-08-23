import Nedb = require('nedb');

export class BaseModel {

  _id: string;

  constructor() {
    this._id = null;
  }
  /**
   *
   * @param {Nedb} model
   * @param {Function} callback
   */
  saveOrUpdate(model: Nedb, callback: Function) {
    if (this._id == null) {
      model.insert(this._getData(), (err, doc) =>
      // @ts-ignore
      { this._id = doc._id; callback(err, doc); });
    }
    else {
      model.update({ _id: this._id }, { $set: this._getData() }, { returnUpdatedDocs: true }, (err, numAffected, doc) => callback(err, doc));
    }
  }
  _getData() {
    throw new Error('Method is abstract and must be implemented');
  }
}