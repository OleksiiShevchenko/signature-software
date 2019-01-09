import React, { Component } from 'react';
import {
  Card,
  H5
} from "@blueprintjs/core";
import styles from './ethData.scss';


export default class extends Component {

  render() {
    const { tx } = this.props;

    return (
      <div>
        <div className={styles.cols}>
          <Card elevation={1} interactive={false}>
            <H5>Tx Info:</H5>
            <div>Currency: {tx.currency}</div>
            <div>Nonce: {tx.nonce}</div>
            <div>Amount: {tx.amount}</div>
            <div>Destination: {tx.address}</div>
          </Card>
        </div>
      </div>
    );
  }
}
