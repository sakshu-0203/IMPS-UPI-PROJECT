const patterns = {
  organisationId: /^[A-Za-z0-9_-]{3,100}$/,
  employeeId: /^[A-Za-z0-9._-]{3,50}$/,
  branchCode: /^[A-Za-z0-9-]{2,20}$/,
  account: /^(?:\d{9,18}|X{2,}\d{4,18})$/,
  mobile: /^[6-9]\d{9}$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  name: /^[A-Za-z][A-Za-z .'-]{1,99}$/,
  transactionId: /^[A-Za-z0-9_-]{6,50}$/,
  rrn: /^\d{6,20}$/
};

function clean(value) { return String(value ?? '').trim(); }
function required(value) { return clean(value).length > 0; }
function validAmount(value, max = 500000) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= max;
}

module.exports = { patterns, clean, required, validAmount };
