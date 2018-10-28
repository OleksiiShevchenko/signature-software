import React, { Component } from 'react';
import styles from './signature.scss';
import Dropzone from 'react-dropzone';
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
import Transaction from './components/transaction';


export default class Signature extends Component {

  constructor(props) {
    super(props);
    this.openDropzone = this.openDropzone.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.state = {
      path: null
    }
  }

  onDrop(files) {
    const { loadSign } = this.props;
    this.setState({
      path: files[0].path
    });

    const reader = new FileReader();
    reader.readAsText(files[0], 'UTF-8');
    reader.onload = e => {
      loadSign(JSON.parse(e.target.result));
    };
  }

  openDropzone () {
    this.refs.dropzone.open();
  }

  render() {
    return (
      <div className={styles.signature}>
        <Dropzone
          ref="dropzone"
          disableClick
          style={{
           height: '728px'
          }}
          multiple={false}
          accept="application/json"
          onDrop={this.onDrop}>
          <div className={styles.container}>
            <Button onClick={this.openDropzone}>
              Open Transaction
            </Button>
          </div>
          <div className={styles.container}>
            <Transaction {...this.props} path={this.state.path}/>
          </div>
        </Dropzone>
      </div>
    );
  }
}
