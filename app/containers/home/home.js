import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import { Classes } from "@blueprintjs/core";
import cx from 'classnames';
import styles from './home.scss';

import Navigation from '../../components/navigation';
import Keys from '../keys';
import Signature from '../signature';
import Container from '../../components/container';
import routes from '../../constants/routes.json';
import Notification from '../../components/notification';


export default class Home extends Component {

  render() {
    return (
      <div className={cx(styles.home, Classes.DARK)}>
        <Navigation/>
        <Container>
          <Route path={routes.KEYS} component={Keys} />
          <Route path={routes.SIGN} component={Signature} />
        </Container>
        <Notification/>
      </div>
    );
  }
}
