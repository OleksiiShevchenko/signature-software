import {
  HANDLE_INPUT,
  GET_KEYS,
  CLEAR_FORM
} from '../actions/keys';

const defaultState = {
  mnemonic: {
    valid: null,
    value: ''
  },
  name: {
    valid: null,
    value: ''
  },
  passphrase: {
    valid: null,
    value: ''
  },
  passphraseConfirm: {
    valid: null,
    value: ''
  },
  keys: []
};

export default function keys(state = defaultState, action) {
  switch (action.type) {
    case HANDLE_INPUT:
      return {...state, [action.data.field]: { value: action.data.input, valid: action.data.valid }};
    case GET_KEYS:
      return {...state, keys: action.data};
    case CLEAR_FORM:
      return {...state,
        mnemonic: {
          valid: null,
          value: ''
        },
        name: {
          valid: null,
          value: ''
        },
        passphrase: {
          valid: null,
          value: ''
        },
        passphraseConfirm: {
          valid: null,
          value: ''
        }
      };
    default:
      return state;
  }
}

