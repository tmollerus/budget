import { ItemRecord } from "../types";

export const getInsertColumnNames = (fields: Array<string>): string => {
  let result = '';

  fields.forEach((field) => {
    result += `"${field}", `;
  });

  return result.trim().replace(/,$/, '');
};

export const getInsertValues = (values: Array<string | boolean | number>): string => {
  let result = '';

  values.forEach((value, index) => {
    result += `$${index + 1}, `;
  });

  return result.trim().replace(/,$/, '');
};

export const getSetStatementAndParams = (budgetGuid: string, budgetItem: ItemRecord): { setStatement: string, setParameters: Array<string | number | boolean> } => {
  let setStatement = 'SET "dateModified" = NOW()';
  let setParameters: Array<string | number | boolean> = [budgetGuid, budgetItem.guid]
  let paramIndex = 3;
  if (budgetItem.type_id) {
    setStatement += `, type_id = $${paramIndex++}`;
    setParameters.push(budgetItem.type_id);
  }
  if (budgetItem.amount !== undefined) {
    setStatement += `, amount = $${paramIndex++}`;
    setParameters.push(budgetItem.amount);
  }
  if (budgetItem.paid !== undefined) {
    setStatement += `, paid = $${paramIndex++}`;
    setParameters.push(budgetItem.paid);
  }
  if (budgetItem.label) {
    setStatement += `, label = $${paramIndex++}`;
    setParameters.push(budgetItem.label);
  }
  if (budgetItem.settledDate) {
    setStatement += `, "settledDate" = $${paramIndex++}`;
    setParameters.push(budgetItem.settledDate);
  }
  if (budgetItem.category_guid) {
    setStatement += `, category_guid = $${paramIndex++}`;
    setParameters.push(budgetItem.category_guid);
  }
  if (budgetItem.subcategory_guid) {
    setStatement += `, subcategory_guid = $${paramIndex++}`;
    setParameters.push(budgetItem.subcategory_guid);
  }

  return { setStatement, setParameters };
};
