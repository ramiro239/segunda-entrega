const {CustomError} = require('./handleErrrors.js')

exports.validateFields = (fields, requiredFields) => {
  const missingFields = [];
  const correctObject = {};

  for (const field of requiredFields) {
    if (!fields[field]) {
      missingFields.push(field);
    } else {
      correctObject[field] = fields[field];
    }
  }
  if (missingFields.length > 0) {
    throw new CustomError(`ERROR: Debe completar los siguientes campos: ${missingFields.join(', ')}`, 400, 'validateFields');
  }
  return correctObject;
};

