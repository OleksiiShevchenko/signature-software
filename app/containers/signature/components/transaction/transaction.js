import React, { Component } from 'react';
import styles from './transaction.scss';
import {
  Card,
  Classes,
  H5,
  H4,
  Button,
  TextArea,
  Intent,
  Alert,
  InputGroup,
  Callout,
  HTMLSelect
} from "@blueprintjs/core";

export default class Transaction extends Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.sign = this.sign.bind(this);
  }

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

  handleChange (e) {
    const { handleInput } = this.props;
    const { value, dataset } = e.target;
    handleInput(value, dataset.field);
  }

  sign () {
    const { signTx, tx, currentKey, passphrase, path } = this.props;
    signTx({currentKey, passphrase}, tx, path);
  }

  renderKeys () {
    const { keys } = this.props;
    if (!keys) return;
    return keys.map(key => {
      return (<option key={key.hash} value={key.name}>{key.name}</option>);
    });
  }

  render() {
    const { tx, passphrase, currentKey } = this.props;
    if (!tx) return null;

    return (
      <div className={styles.transaction}>
        <H4>Transaction data:</H4>
        <div>
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
          <div className={styles.container}>

            <div className={styles.inputContainer}>
              <HTMLSelect
                value={currentKey}
                fill
                onChange={this.handleChange}
                data-field="currentKey">
                <option key={'default'}>Choose an item...</option>
                {this.renderKeys()}
              </HTMLSelect>
            </div>

            <div className={styles.inputContainer}>
              <InputGroup
                onChange={this.handleChange}
                placeholder="Passphrase"
                data-field="passphrase"
                type="password"
                value={passphrase}
              />
            </div>

            <div className={styles.inputContainer}>
              <Button onClick={this.sign}
                      icon="tick"
                      disabled={!passphrase || !currentKey}
                      text="Sign Transaction"/>
            </div>

          </div>

        </div>
      </div>
    );
  }
}
