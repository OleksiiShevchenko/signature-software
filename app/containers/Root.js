
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import Routes from '../Routes';
import Ledger from './../utils/ledger';
import { showNotification, hideNotification } from '../actions/notifications';




export default class Root extends Component {

  componentDidMount () {
    Ledger.init();
    const { store: { dispatch } } = this.props;

    Ledger.on('ledgerConnect', e => {
      dispatch(showNotification('Ledger Connected'));
      setTimeout(() => dispatch(hideNotification()), 3000);
    });

    Ledger.on('ledgerDisconnect', e => {
      dispatch(showNotification('Ledger Disconnected'));
      setTimeout(() => dispatch(hideNotification()), 3000);
    });

  }

  render() {
    const { store, history } = this.props;
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </Provider>
    );
  }
}
