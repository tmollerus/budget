export const getInsertColumnNames = (fields: Array<string>): string => {
  let result = '';

  fields.forEach((field) => {
    result += `"${field}", `;
  });

  return result.trim().replace(/,$/, '');
};

export const getInsertValues = (values: Array<string | boolean | number>): string => {
  let result = '';

  values.forEach((value) => {
    if (['boolean', 'number'].includes(typeof value)) {
      result += `${value}, `;
    } else {
      result += `'${(value as string).replace("'", "\'")}', `;
    }
  });

  return result.trim().replace(/,$/, '');
};