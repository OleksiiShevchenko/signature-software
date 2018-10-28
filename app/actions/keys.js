export const HANDLE_INPUT = 'HANDLE_INPUT';
import { saveKeyToFile, getKeysList, deleteKey } from '../utils/utils';


export function handleInput(input, field, valid) {
  return {
    type: HANDLE_INPUT,
    data: {
      input,
      field,
      valid
    }
  };
}


export function saveKey(data) {
  saveKeyToFile(data);
  return dispatch => {
    dispatch(getKeys());
    dispatch(clearForm());
  };
}


export const GET_KEYS = 'GET_KEYS';

export function getKeys() {
  return {
    type: GET_KEYS,
    data: getKeysList()
  };
}


export const CLEAR_FORM = 'CLEAR_FORM';

export function clearForm() {
  return {
    type: CLEAR_FORM
  };
}


export function deleteKeyFile(name) {
  deleteKey(name);
  return dispatch => {
    dispatch(getKeys());
  };
}
