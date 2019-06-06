

export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION';
export function showNotification(content) {
  return {
    type: SHOW_NOTIFICATION,
    data: {
      content
    }
  };
}


export const HIDE_NOTIFICATION = 'HIDE_NOTIFICATION';
export function hideNotification() {
  return {
    type: HIDE_NOTIFICATION
  };
}

