import Store from './Store';

// make this into an environment variable later
const BASEURL = 'http://localhost:4567';

// make requests to the API
class ApiConnectionManager {
  /**
   * Generic request helper
   * @param uri       uri to send a request to
   * @param options   properties to add to/override in options
   */
  request(uri, options) {
    return new Promise((resolve, reject) => {
      fetch(BASEURL + uri, {
        method: 'POST',
        credentials: 'include',
        ...options
      }).then(async res => resolve(await res.json())).catch(reject);
    });
  }
   
  signIn(username, password) {
    this.request('/login', {
      body: JSON.stringify({
        username: username,
        passwordHash: password
      })
    }).then(res => {
      if(res.status === 'STATUS_OK') {
        Store.dispatch({type: 'signin'});
      }
    }).catch(err => {
      console.error(err);
    });
  }
  
  signOut() {
    this.request('/logout', {
      method: 'GET'
    }).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }
  
}

export default new ApiConnectionManager();