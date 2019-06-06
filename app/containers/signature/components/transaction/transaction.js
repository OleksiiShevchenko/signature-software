import React, { Component } from 'react';
import DataBTC from '../btcData';
import DataETH from '../ethData';
import styles from './transaction.scss';
import {
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
import Ledger from '../../../../utils/ledger';


export default class Transaction extends Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.sign = this.sign.bind(this);
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

    if (!keys || !Array.isArray(keys)) return;
    return keys.map(key => {
      return (<option key={key.name} value={key.name}>{key.name}</option>);
    });
  }

  render() {
    const { tx, passphrase, currentKey } = this.props;
    if (!tx) return null;


    return (
      <div className={styles.transaction}>
        <H4>Transaction data:</H4>
        <div>
          {(tx.currency === 'BTC') ? <DataBTC tx={tx}/> : <DataETH tx={tx} />}
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

            {currentKey !== 'ledger'
              ?
              <div className={styles.inputContainer}>
                <InputGroup
                  onChange={this.handleChange}
                  placeholder="Passphrase"
                  data-field="passphrase"
                  type="password"
                  value={passphrase}/>
              </div>
              : ''
            }

            <div className={styles.inputContainer}>
              <Button onClick={this.sign}
                      icon="tick"
                      disabled={ (currentKey !== 'ledger' && !passphrase) || !currentKey}
                      text="Sign Transaction"/>
            </div>

          </div>

        </div>
      </div>
    );
  }
}
