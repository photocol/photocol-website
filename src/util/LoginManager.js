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
    const res = (await this.acm.request('/user/details')).response;

    if(res===null)
      return;

    store.dispatch({type: 'login', username: res});
    return true;
  }
  
  // login; update store on success
  logIn(username, password) {
    return new Promise((resolve, reject) => {
      this.acm.request('/user/login', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          password: password
        })
      }).then(res => {
        // update store
        store.dispatch({type: 'login', username: username});
        resolve(res);
      }).catch(err => reject(err));
    });
  }

  // sign up
  signUp(username, password, email) {
    return new Promise((resolve, reject) => {
      this.acm.request('/user/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          password: password,
          email: email
        })
      }).then(res => {
        store.dispatch({type: 'login', username: username});
        resolve(res);
      }).catch(err => reject(err));
    });
  }

  // logout; update store on success
  logOut() {
    return new Promise((resolve, reject) => {
      this.acm.request('/user/logout')
        .then(res => {
          // update store
          store.dispatch({type: 'logout'});
          resolve(res);
        }).catch(err => reject(err));
    });
  }
}

export default LoginManager;