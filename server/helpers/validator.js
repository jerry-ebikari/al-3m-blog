function validateInput(inputObj, requiredFields) {
  const missingFields = [];
  
  requiredFields.forEach(field => {
      if (!inputObj.hasOwnProperty(field)) {
          missingFields.push(field);
      }
  });
  
  if (missingFields.length > 0) {
      return `Missing fields - ${missingFields.join(', ')}`;
  } else {
      return null; // No missing fields
  }
}

module.exports = validateInput