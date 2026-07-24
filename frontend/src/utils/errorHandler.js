/**
 * Helper to safely extract error message string from Axios/DRF API responses.
 * Prevents React child rendering errors when API returns objects/arrays.
 */
export const getErrorMessage = (err, fallback = 'An unexpected error occurred.') => {
  if (!err) return fallback;
  if (typeof err === 'string') return err;

  const data = err.response?.data;
  if (!data) {
    return err.message || fallback;
  }

  let detail = data.detail !== undefined ? data.detail : data;

  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(' ');
  }

  if (typeof detail === 'object' && detail !== null) {
    if (typeof detail.detail === 'string') {
      return detail.detail;
    }
    const values = Object.values(detail).flat();
    const strings = values.map((val) => (typeof val === 'string' ? val : JSON.stringify(val)));
    if (strings.length > 0) {
      return strings.join(' ');
    }
  }

  return fallback;
};
