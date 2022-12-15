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