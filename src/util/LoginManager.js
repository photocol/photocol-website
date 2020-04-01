// an abstraction upon ApiConnectionManager that manages reusable user-based endpoint logic
// and manages the user store
import ApiConnectionManager from './ApiConnectionManager'; 
import store from './Store';

class LoginManager {
  constructor() {
    this.acm = new ApiConnectionManager();

    this.checkIsLoggedIn = this.checkIsLoggedIn.bind(this);
    this.logIn = this.logIn.bind(this);
    this.logOut = this.logOut.bind(this);
  }
  
  // check if logged in
  async checkIsLoggedIn() {
    const res = await this.acm.request('/userdetails');
    if(res.status!=='STATUS_OK' || !res.payload) {
      return false;
    }
    store.dispatch({type: 'login', username: 'logged in'});
    return true;
  }
  
  // login; update store on success
  logIn(username, password) {
    return new Promise((resolve, reject) => {
      this.acm.request('/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          passwordHash: password
        })
      }).then(res => {
        if(res.status !== 'STATUS_OK') {
          return reject(res);
        }

        // update store
        store.dispatch({type: 'login', username: username});
        resolve(res);
      }).catch(reject);
    });
  }

  // logout; update store on success
  logOut() {
    return new Promise((resolve, reject) => {
      this.acm.request('/logout')
        .then(res => {
          if(res.status !== 'STATUS_OK') {
            return reject(res);
          }
          
          // update store
          store.dispatch({type: 'logout'});
          resolve(res);
        }).catch(reject);
    });
  }
}

export default LoginManager;