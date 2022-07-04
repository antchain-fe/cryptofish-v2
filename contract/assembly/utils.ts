import { Collection } from './types';

/**
 * Parse hex string to u32 int
 * @param hexWithCase {string}
 * @returns u32
 */
export function parseHex2Int(hexWithCase: string): u32 {
  // AssemblyScript currently, the switch conditions (case values) are implicitly
  // converted to u32, i.e. switching over strings or similar is not yet supported.
  const hex = hexWithCase.toUpperCase();
  if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(hex)) {
    return <u32>parseInt(hex, 10);
  } else if (hex == 'A') {
    return 10;
  } else if (hex == 'B') {
    return 11;
  } else if (hex == 'C') {
    return 12;
  } else if (hex == 'D') {
    return 13;
  } else if (hex == 'E') {
    return 14;
  } else if (hex == 'F') {
    return 15;
  }
  throw new Error('[cryptofish] invilid hex string');
}

/**
 * Parse hex string to u32 int
 * @param theInt {u32}
 * @returns string
 */
export function parseInt2Hex(theInt: u32): string {
  // AssemblyScript currently, the switch conditions (case values) are implicitly
  // converted to u32, i.e. switching over strings or similar is not yet supported.
  if (theInt < 10 && theInt >= 0) {
    return theInt.toString();
  } else if (theInt == 10) {
    return 'a';
  } else if (theInt == 11) {
    return 'b';
  } else if (theInt == 12) {
    return 'c';
  } else if (theInt == 13) {
    return 'd';
  } else if (theInt == 14) {
    return 'e';
  } else if (theInt == 15) {
    return 'f';
  }
  throw new Error('[cryptofish] invilid hex string');
}

/**
 * Stringify collection to json string
 * @param collection
 * @returns {string}
 */
export const stringifyCollection = (collection: Collection): string => {
  const index = collection.get('index');
  if (!index) {
    return '';
  }
  const creator = collection.get('creator');
  const attribute = collection.get('attribute');
  const score = collection.get('score');
  return `{"index":${index},"creator":"${creator}","attribute":"${attribute}","score":${score}}`;
};

/**
 * Stringify collections to json string
 * @param collections
 * @returns {string}
 */
export const stringifyCollections = (collections: Collection[]): string => {
  let result = '[';
  for (let index = 0; index < collections.length; index += 1) {
    const collection = collections[index];
    const str = stringifyCollection(collection);
    if (str.length > 0) {
      result = `${result}${index === 0 ? '' : ','}${str}`;
    }
  }
  return `${result}]`;
};
