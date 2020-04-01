// redux store
import { createStore, combineReducers } from 'redux';

// reducers
const userReducer = (state=null, action) => {
  switch(action.type) {
    case 'login':
      return { username: action.username };
    case 'logout':
      return { username: 'not logged in' };
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
    username: 'not logged in'
  }
};

// global store
const store = createStore(rootReducer, initialState);
export default store;