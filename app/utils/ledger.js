import LedgerTransport from "@ledgerhq/hw-transport-node-hid";
import LedgerBtc from "@ledgerhq/hw-app-btc";
import LedgerEth from "@ledgerhq/hw-app-eth";

import { map, compose, dropLast, last, length } from 'ramda';
import * as bippath from 'bip32-path';
import * as BIP32 from 'bip32';
import { crypto, HDNode } from 'bitcoinjs-lib';

const bcoin = require('bcoin');


class Ledger {

  constructor() {
    this.connected = false;
  }

  async init() {
    this.transport = await LedgerTransport.create();
    this.btc = new LedgerBtc(this.transport);
    this.eth = new LedgerEth(this.transport);

    try {
      this.listen();
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }

  listen() {
    const self = this;
    LedgerTransport.listen({
      next: async function (e) {
        switch (e.type) {
          case 'add':
            self.connected = true;
            console.log("Ledger device connected", e);
            break;
          case 'remove':
            this.connected = false;
            console.log("Ledger device disconnected", e);
            break;
          default:
            return;
        }
      },
      error: error => new Error(error),
      complete: () => {
      }
    });
  }

  isConnected() {
    return this.connected;
  }


  async getAddress (path) {
    const data = await this.eth.getAddress(path, false, true);
    return data.address;
  }

  async getXPUB (path, coin) {
    let parentPath = this.getParentPath(path);
    let child;
    let parent;

    if (coin === 'ETH') {
      child = await this.eth.getAddress(path, false, true);
      parent = await this.eth.getAddress(parentPath, false, true);
    } else {
      child = await this.btc.getWalletPublicKey(path);
      parent = await this.btc.getWalletPublicKey(parentPath);
    }

    return this.createXPUB(path, child, parent);
  }

  createXPUB (path, child, parent) {
    let pathArray = bippath.fromString(path).toPathArray();
    let pkChild = this.compressPublicKey(Buffer.from(child.publicKey, 'hex'));
    let pkParent = this.compressPublicKey(Buffer.from(parent.publicKey, 'hex'));
    let hdnode = BIP32.fromPublicKey(pkChild, Buffer.from(child.chainCode, 'hex'));
    hdnode.parentFingerprint = this.fingerprint(pkParent);
    hdnode.depth = pathArray.length;
    hdnode.index = last(pathArray);
    return hdnode.toBase58();
  }

  compressPublicKey (publicKey) {
    let prefix = (publicKey[64] & 1) !== 0 ? 0x03 : 0x02;
    let prefixBuffer = Buffer.alloc(1);
    prefixBuffer[0] = prefix;
    return Buffer.concat([prefixBuffer, publicKey.slice(1, 1 + 32)]);
  }

  fingerprint (publickey) {
    let pkh = compose(crypto.ripemd160, crypto.sha256)(publickey);
    return ((pkh[0] << 24) | (pkh[1] << 16) | (pkh[2] << 8) | pkh[3]) >>> 0;
  }

  getParentPath (path) {
    return compose(
      array => bippath.fromPathArray(array).toString(),
      dropLast(1),
      path => bippath.fromString(path).toPathArray()
    )(path);
  }

}


export default new Ledger();
