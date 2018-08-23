import { ApiCallResult as Result } from './api-call-result';

export class BoardManagerUtils {
  /**
   * Generates a new resume comment from the given parameters
   * @param {*} check_items 
   * @param {string} date 
   * @param {string} comment 
   * @returns {string} formatted comment
   */
  static processComment(check_items: any, date: string, comment: string): string {
    let completed_items = check_items.filter(x => x.state == 'complete');
    let total = check_items.length;
    let cantidad = completed_items.length;
    let detalle = completed_items.map(x => x.name).join(', ').trim();
    return `${date}: ${comment}\nCantidad: ${cantidad}/${total}\nDetalle: ${detalle}`
  }

  /**
   * Returns an unified Promise that resolves to Result
   * @param {Array.<Promise>} promise_array 
   * @returns {Promise<Result>}
   */
  static async resultFromPromiseArray(promise_array: Array<Promise<any>>): Promise<Result> {
    promise_array = promise_array.filter(x => x != null && x != undefined);
    return Promise.all(promise_array).then(results => {
      let error = results.find(x => x != null && typeof x.logIfError == "function" && x.logIfError());
      return error || new Result(null);
    })
      .catch(err => new Result(err));
  }

  /**
   * Returns the array of names of the cards of the list, except the header card
   * @param {*} list 
   * @param {*} header_card 
   */
  static getCardNameList(list: any, header_card: any) {
    return list.filter(x => x.id !== header_card.id).map(x => x.name).sort();
  }

  static findCardByName(name, cards) {
    name = name.toLowerCase();
    let header_card = cards.find(x => x.name.toLowerCase() === name);
    return header_card;
  }

  static filterList(list_array) {
    //TODO filtrar en base a los parámetros que se definan
    return list_array.filter(() => true);
  }

  static findDifferences(original_array, new_array) {
    return {
      //Remove all items not found on the new array
      remove: original_array.filter(x => !new_array.find(y => y == x)),
      //Add all items not existing on the new array
      add: new_array.filter(x => !original_array.find(y => y == x))
    };
  }
}