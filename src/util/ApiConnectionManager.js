// this helper class simply makes requests to the API
// higher-level logic and store manipulation is implemented in other classes, e.g. LoginManager
class ApiConnectionManager {
  /**
   * Generic request helper. 400+ status codes are sent to reject. Response (and error)
   * objects are forwarded, with the body attribute set to the response body.
   * @param uri       uri to send a request to
   * @param options   properties to add to/override in options
   */
  request(uri, options) {
    return new Promise((resolve, reject) => {
      fetch(process.env.REACT_APP_SERVER_URL + uri, {
        credentials: 'include',
        ...options
      }).then(async res => {
        res.response = await res.json();
        (res.ok ? resolve : reject)(res);
      }).catch(reject);
    });
  }
}

export default ApiConnectionManager;