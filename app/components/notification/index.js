import Notification from './notification';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as notificationActions from '../../actions/notifications';

function mapStateToProps(state) {
  return {
    messages: state.notifications.messages
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(notificationActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Notification);
