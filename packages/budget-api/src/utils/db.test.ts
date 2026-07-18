import { getInsertColumnNames, getInsertValues, logQueryEfficiency } from "./db";
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

  test('logQueryEfficiency', () => {
    const queryResponse = {
      Count: 50,
      ScannedCount: 42,
      ConsumedCapacity: {
        CapacityUnits: 2
      },
      $metadata: {
        httpStatusCode: 200,
        requestId: '1234567890',
      },
    };
    const logMessage = logQueryEfficiency('Foo', queryResponse);
    expect(logMessage).toContain(`Query efficiency: ${queryResponse.Count} items returned / ${queryResponse.ScannedCount} items scanned = ${(queryResponse.Count || 0) / (queryResponse.ScannedCount || 1) * 100}%`);
    expect(logMessage).toContain(`Foo`);
  });
});