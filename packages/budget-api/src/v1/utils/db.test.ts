import { getInsertColumnNames, getInsertValues } from "./db";
import { Seeds } from '../types';

describe('db utility', () => {
  const types: Seeds = { "seeds": [
      ["id","active","label","dateCreated","dateModified"],
      [1,true,"Foo's Place","2012-03-28 11:42:01+00","2012-03-28 11:42:01+00"],
      [2,true,"Bar","2012-03-28 11:42:01+00","2012-03-28 11:42:01+00"],
      [3,true,"Car","2012-03-28 11:42:01+00","2012-03-28 11:42:01+00"]
    ]
  };

  test('getInsertColumnNames', () => {
    const columnNamesString = getInsertColumnNames(types.seeds[0] as Array<string>);
    expect(columnNamesString.split(',').length).toBe(types.seeds[0].length);
    types.seeds[0].forEach((columnName) => {
      expect(columnNamesString.includes(`"${columnName}"`)).toBe(true);
    });
  });

  test('getInsertValues', () => {
    const valuesString = getInsertValues(types.seeds[1]);
    expect(valuesString.split(',').length).toBe(types.seeds[0].length);
  });
});