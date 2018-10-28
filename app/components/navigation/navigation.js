// @flow
import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './navigation.scss';
import cx from 'classnames';
import {
  Classes,
  Button,
  Navbar,
  NavbarGroup,
  NavbarHeading,
  NavbarDivider,
  Alignment,
  Icon
} from "@blueprintjs/core";


export default class Navigation extends Component<Props> {
  props: Props;

  render() {

    return (
      <Navbar className={cx(Classes.DARK, styles.navigation)}>
        <NavbarGroup align={Alignment.LEFT}>
          <NavbarHeading>Signature Software</NavbarHeading>
          <NavbarDivider />
          <NavLink to="/keys"
                   className={cx(Classes.MINIMAL, Classes.BUTTON, styles.navButton)}
                   role="button" >
            <Icon icon="key" className={styles.navIcon}/>Key Management
          </NavLink>
          <NavLink to="/sign"
                   className={cx(Classes.MINIMAL, Classes.BUTTON, styles.navButton)}
                   role="button" >
            <Icon icon="exchange" className={styles.navIcon}/>Sign Transaction
          </NavLink>
        </NavbarGroup>
      </Navbar>
    );
  }
}
