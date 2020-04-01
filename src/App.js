import React from 'react';
import { Provider } from 'react-redux';
import store from './util/Store';
import Authenticator from './components/Authenticator/Authenticator';
import TopBar from './components/TopBar/TopBar';
import './App.css';

class App extends React.Component {
  render() {
    return (
      <Provider className="App" store={store}>
        <TopBar />
        <Authenticator />
      </Provider>
    );
  }
}

export default App;
