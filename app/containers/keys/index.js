import Keys from './keys';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as keysActions from '../../actions/keys';

function mapStateToProps(state) {
  return {
    mnemonic: state.keys.mnemonic,
    name: state.keys.name,
    passphrase: state.keys.passphrase,
    passphraseConfirm: state.keys.passphraseConfirm,
    keys: state.keys.keys
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(keysActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Keys);
