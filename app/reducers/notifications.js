import {
  SHOW_NOTIFICATION,
  HIDE_NOTIFICATION
} from '../actions/notifications';

import {
  GET_KEYS_FAIL
} from '../actions/transactions';


const defaultState = {
  messages: []
};

export default function notifications(state = defaultState, action) {
  switch (action.type) {
    case SHOW_NOTIFICATION:
    case GET_KEYS_FAIL:
      console.log(action.data.content);
      return {...state, messages: [...state.messages, action.data.content]};
    case HIDE_NOTIFICATION:
      state.messages.splice(0,1);
      return {...state, messages: [...state.messages]};
    default:
      return state;
  }
}

