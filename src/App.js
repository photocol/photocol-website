import React from 'react';
import { Provider } from 'react-redux';
import store from './util/Store';
import Authenticator from './components/Authenticator/Authenticator';
import LoginManager from './util/LoginManager';
import TopBar from './components/TopBar/TopBar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Profile from './components/Profile/Profile';
import Collection from './components/Collection/Collection';
import Collections from './components/Collections/Collections';
import Photo from './components/Photo/Photo';
import Photos from './components/Photos/Photos';
import PageNotFound from './components/PageNotFound/PageNotFound';
import './App.css';

// check if user is already logged in
new LoginManager().checkIsLoggedIn();

// top-level component
class App extends React.Component {
  render() {
    return (
      <Provider className="App" store={store}>
        <Router>
          <TopBar />
          <Switch>
            <Route exact path='/'>
              <Home />
            </Route>
            <Route exact path='/profile'>
              <Profile />
            </Route>
            <Route path='/profile/:username'>
              <Profile />
            </Route>
            <Route exact path='/collections'>
              <Collections />
            </Route>
            <Route path='/collection/:username/:collectionuri'>
              <Collection />
            </Route>
            <Route exact path='/photos'>
              <Photos />
            </Route>
            <Route path='/photo/:photouri'>
              <Photo />
            </Route>
            <Route path='/authenticate'>
              <Authenticator />
            </Route>
            <Route>
              <PageNotFound />
            </Route>
          </Switch>
        </Router>
      </Provider>
    );
  }
}

export default App;
