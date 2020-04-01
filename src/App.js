import React from 'react';
import { Provider } from 'react-redux';
import Store from './services/Store';
import Authenticator from './components/Authenticator/Authenticator';
import TopBar from './components/TopBar/TopBar';
import './App.css';

const App = () => (
  <Provider className="App" store={Store}>
    <TopBar />
    <Authenticator />
  </Provider>
);
export default App;
