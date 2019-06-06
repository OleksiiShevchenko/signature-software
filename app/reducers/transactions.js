import {
  LOAD_TRANSACTION,
  HANDLE_INPUT,
  GET_KEYS,
  GET_KEYS_FAIL,
  SIGN_TX
} from '../actions/transactions';

const defaultState = {
  passphrase: '',
  currentKey: '',
  tx: null
};

export default function tx (state = defaultState, action) {
  switch (action.type) {
    case LOAD_TRANSACTION:
      return {...state, tx: action.data};
    case HANDLE_INPUT:
      return {...state, [action.data.field]: action.data.val };
    case GET_KEYS:
      return {...state, keys: action.data};
    case GET_KEYS_FAIL:
      return state;
    case SIGN_TX:
      return {...state, result: action.data, passphrase: '', currentKey: '', tx: null};
    default:
      return state;
  }
}
