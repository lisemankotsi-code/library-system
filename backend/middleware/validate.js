// Small helpers to keep route handlers tidy
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const isNonNegInt = (v) => Number.isInteger(Number(v)) && Number(v) >= 0 && v !== '' && v !== null;
const isPosInt = (v) => Number.isInteger(Number(v)) && Number(v) > 0 && v !== '' && v !== null;

module.exports = { asyncHandler, isNonEmpty, isNonNegInt, isPosInt };
