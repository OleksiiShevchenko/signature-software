import {getSignKeysList} from '../utils/utils';
import { signBTC, signETH } from '../utils/sign';
import { hideNotification } from '../actions/notifications';

export function loadSign(tx) {
  return dispatch => {
    dispatch(getKeys(tx));
    dispatch(loadTransaction(tx));
  };
}

export const LOAD_TRANSACTION = 'LOAD_TRANSACTION';

export function loadTransaction(tx) {
  return {
    type: LOAD_TRANSACTION,
    data: tx
  };
}

export const HANDLE_INPUT = 'HANDLE_INPUT';

export function handleInput(val, field) {
  return {
    type: HANDLE_INPUT,
    data: {
      val,
      field
    }
  };
}

export const GET_KEYS = 'GET_KEYS';
export const GET_KEYS_FAIL = 'GET_KEYS_FAIL';

export function getKeys(tx) {
  return async (dispatch) => {
    try {
      const keys = await getSignKeysList(tx);
      dispatch({
        type: GET_KEYS,
        data: keys
      });
    } catch (e) {
      console.log('test');
      dispatch({
        type: GET_KEYS_FAIL,
        data: {
          content:'Make sure you are running BTC app on your ledger'
        }
      });
      setTimeout(() => dispatch(hideNotification()), 3000);
    }
  };
}


export const SIGN_TX = 'SIGN_TX';

export function signTx(keys, tx, path) {
  return {
    type: SIGN_TX,
    data: tx.currency === 'ETH' ? signETH(keys, tx, path) : signBTC(keys, tx, path)
  };
}
