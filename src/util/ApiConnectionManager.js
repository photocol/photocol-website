// this helper class simply makes requests to the API
// higher-level logic and store manipulation is implemented in other classes, e.g. LoginManager
import { env } from "./Environment";

// make requests to the API
class ApiConnectionManager {
  /**
   * Generic request helper
   * @param uri       uri to send a request to
   * @param options   properties to add to/override in options
   */
  request(uri, options) {
    return new Promise((resolve, reject) => {
      fetch(env.serverUrl + uri, {
        credentials: 'include',
        ...options
      }).then(async res => resolve(await res.json())).catch(reject);
    });
  }
}

export default ApiConnectionManager;