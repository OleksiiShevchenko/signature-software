// @flow
import React, { Component } from 'react';
import styles from './container.scss';
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


export default class Container extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className={styles.container}>
        {this.props.children}
      </div>
    );
  }
}
