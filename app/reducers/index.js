// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import keys from './keys';
import transactions from './transactions';

const rootReducer = combineReducers({
  counter,
  keys,
  router,
  transactions
});

export default rootReducer;
