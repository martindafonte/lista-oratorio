"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseModel {
    constructor() {
        this._id = null;
    }
    /**
     *
     * @param {Nedb} model
     * @param {Function} callback
     */
    saveOrUpdate(model, callback) {
        if (this._id == null) {
            model.insert(this._getData(), (err, doc) => { this._id = doc._id; callback(err, doc); });
        }
        else {
            model.update({ _id: this._id }, { $set: this._getData() }, { returnUpdatedDocs: true }, (err, numAffected, doc) => callback(err, doc));
        }
    }
    _getData() {
        throw new Error('Method is abstract and must be implemented');
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=base-model.js.map