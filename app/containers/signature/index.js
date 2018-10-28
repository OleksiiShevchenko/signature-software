import Signature from './signature';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as txActions from '../../actions/transactions';

function mapStateToProps(state) {
  return {
    tx: state.transactions.tx,
    passphrase: state.transactions.passphrase,
    currentKey: state.transactions.currentKey,
    keys: state.transactions.keys
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(txActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Signature);
