function validateRequired(fields, body) {
  const missing = fields.filter((f) => !body[f] && body[f] !== 0);
  return missing;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateAge(age) {
  const n = Number(age);
  return Number.isInteger(n) && n >= 1 && n <= 120;
}

function validatePrice(price) {
  const n = Number(price);
  return !isNaN(n) && n >= 0;
}

function validateStringLength(str, min, max) {
  return typeof str === 'string' && str.trim().length >= min && str.trim().length <= max;
}

module.exports = {
  validateRequired,
  validateEmail,
  validateAge,
  validatePrice,
  validateStringLength
};