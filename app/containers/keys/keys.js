import React, { Component } from 'react';
import styles from './keys.scss';
import {
  Card,
  Classes,
  H5,
  Button,
  TextArea,
  Intent,
  Alert,
  InputGroup,
  Callout
} from "@blueprintjs/core";
import validation from './validation';



export default class Keys extends Component {

  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.addKey = this.addKey.bind(this);
    this.isValid = this.isValid.bind(this);
    this.deleteKey = this.deleteKey.bind(this);
  }

  componentWillMount () {
    const { getKeys } = this.props;
    getKeys();
  }

  handleChange (e) {
    const { value, dataset } = e.target;
    const { handleInput, mnemonic, name, passphrase, passphraseConfirm } = this.props;
    const values = {
      mnemonic,
      name,
      passphrase,
      passphraseConfirm
    };
    handleInput(value, dataset.field, validation(dataset.field, value, values));
  }

  addKey () {
    const { mnemonic, name, passphrase, passphraseConfirm, saveKey, keys } = this.props;
    if (!mnemonic.valid || !name.valid || !passphrase.valid || !passphraseConfirm.valid) return;
    //if (keys.indexOf(`${name}.json`)) return alert('Key with such name already exists');

    saveKey({
      mnemonic: mnemonic.value,
      name: name.value,
      passphrase: passphrase.value
    });
  }

  deleteKey (e) {
    const { deleteKeyFile } = this.props;
    const key = e.currentTarget.dataset.keyname;
    if (!window.confirm('Are you sure?')) return;
    deleteKeyFile(key);
  }

  renderKeysList () {
    const { keys } = this.props;
    return keys.map((item, i) => {
      return (
        <li key={item} className={styles.keyListItem}>
          <Callout>
            <div><b>{item}</b></div>
            <div className={styles.delete}>
              <Button icon="trash"
                      onClick={this.deleteKey}
                      data-keyname={item}/>
            </div>
          </Callout>
        </li>
      );
    })
  }

  isValid(name) {
    const data = this.props[name];
    if (data.valid === true) return Intent.SUCCESS;
    if (data.valid === false) return Intent.DANGER;
    return null;
  }

  render() {
    const { mnemonic, name, passphrase, passphraseConfirm } = this.props;

    return (
      <div className={styles.keys}>
        <div className={styles.container}>

          <div className={styles.keysCols}>

            <Card elevation={1} interactive={false} >
              <div className={styles.container}>
                <H5>Add key</H5>

                <div className={styles.inputContainer}>
                  <TextArea fill={true}
                            rows="8"
                            intent={this.isValid('mnemonic')}
                            placeholder="Paste mnemonic phrase"
                            data-field="mnemonic"
                            onChange={this.handleChange}
                            value={mnemonic.value || ''}/>
                </div>

                <div className={styles.inputContainer}>
                  <InputGroup
                    onChange={this.handleChange}
                    placeholder="Key name"
                    data-field="name"
                    intent={this.isValid('name')}
                    value={name.value || ''}
                  />
                </div>

                <div className={styles.inputContainer}>
                  <InputGroup
                    onChange={this.handleChange}
                    placeholder="Passphrase"
                    data-field="passphrase"
                    type="password"
                    intent={this.isValid('passphrase')}
                    value={passphrase.value || ''}
                  />
                </div>

                <div className={styles.inputContainer}>
                  <InputGroup
                    onChange={this.handleChange}
                    placeholder="Confirm Passphrase"
                    data-field="passphraseConfirm"
                    type="password"
                    intent={this.isValid('passphraseConfirm')}
                    value={passphraseConfirm.value || ''}
                  />
                </div>

                <Button onClick={this.addKey}
                        icon="import"
                        disabled={(!mnemonic.valid || !name.valid || !passphrase.valid || !passphraseConfirm.valid)}
                        text="Add key"/>
              </div>
            </Card>

            <Card>
              <div className={styles.container}>
                <H5>Keys:</H5>
                <ul className={styles.listContainer}>
                  {this.renderKeysList()}
                </ul>
              </div>
            </Card>

          </div>
        </div>
      </div>
    );
  }
}
