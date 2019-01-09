import React, { Component } from 'react';
import {
  Card,
  H5
} from "@blueprintjs/core";
import styles from './btcData.scss';

export default class dataBTC extends Component {

  renderInputs () {
    const { tx } = this.props;
    if (!tx) return;
    return tx.inputs.map(input => {
      return (
        <li key={input.address}>
          <div><b>Address: </b>{input.address}</div>
          <div><b>Amount: </b>{input.value}</div>
        </li>
      );
    });
  }

  renderOutputs () {
    const { tx } = this.props;
    if (!tx) return;
    return (
      <div>
        <div><b>Address: </b>{tx.address}</div>
        <div><b>Amount: </b>{tx.amount}</div>
      </div>
    );
  }

  render() {
    return (
      <div className={styles.cols}>
        <Card elevation={1} interactive={false}>
          <H5>Inputs</H5>
          <ul>
            {this.renderInputs()}
          </ul>
        </Card>
        <Card elevation={1} interactive={false}>
          <H5>Outputs</H5>
          <ul>
            {this.renderOutputs()}
          </ul>
        </Card>
      </div>
    );
  }
}
