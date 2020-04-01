// redux store
import { createStore, combineReducers } from 'redux';

// reducers
const userReducer = (state=0, action) => {
  if(action.type === 'signin') {
    return { username: 'signed in' };
  }
  return state;
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
const store = createStore(rootReducer, initialState);
export default store;