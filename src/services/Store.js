// redux store
import { createStore, combineReducers } from 'redux';

// reducers
const userReducer = (state=0, action) => {
  switch(action.type) {
    case 'signin':
      return { username: 'signed in' };
    case 'signout':
      return { username: 'not signed in' };
    default:
      return state;
  }
};
const rootReducer = combineReducers({
  user: userReducer
});

// initial state
const initialState = {
  user: {
    username: 'not signed in'
  }
};

// global store
const Store = createStore(rootReducer, initialState);
export default Store;