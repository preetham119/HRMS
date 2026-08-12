/**
 * Appraisal requests are served in-browser by localBackend.  Kept as a
 * harmless compatibility export for any legacy import that has not moved to
 * the named service adapters yet.
 */
const unavailableRequest = () =>
  Promise.reject(new Error('Use the named appraisal service adapters instead of api.'));

const api = {
  get: unavailableRequest,
  post: unavailableRequest,
  put: unavailableRequest,
  patch: unavailableRequest,
  delete: unavailableRequest,
};

export default api;
