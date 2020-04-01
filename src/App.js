import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import Authenticator from './components/Authenticator/Authenticator';
import './App.css';

function App() {
  return (
    <Provider className="App" store={store}>
      <Authenticator />
    </Provider>
  );
}

export default App;
