import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import bcoin from 'bcoin';

const PrivateKey = bcoin.hd.PrivateKey;

const { getGlobal } = require('electron').remote;
const appData = getGlobal('shared').appData;

//TODO env variable with network
const NETWORK = 'main';


export const saveKeyToFile = (data) => {
  const keyHash = keyEncrypt(data.mnemonic, data.passphrase);
  const keyData = {};
  keyData.name = data.name;
  keyData.hash = keyHash;

  const pr = PrivateKey.fromPhrase(data.mnemonic, NETWORK);
  const pubBTC = pr.derivePath(`m/44'/0'/0'/0`).toPublic().toBase58();
  const pubETH = pr.derivePath(`m/44'/60'/0'/0`).toPublic().toBase58();
  keyData.pubBTC = pubBTC;
  keyData.pubETH = pubETH;

  return writeKeysToFile(keyData);
};


export const deleteKey = (name) => {
  const dir = path.resolve(appData, 'signatureSoftware');
  return fs.unlinkSync(`${dir}/${name}`);
};


export const getKeysList = () => {
  try {
    const dir = path.resolve(appData, 'signatureSoftware');
    return fs.readdirSync(dir);
  } catch (e) {
    console.error(e);
    return e;
  }
};

export const getSignKeysList = (tx) => {
  try {
    const dir = path.resolve(appData, 'signatureSoftware');
    const files = fs.readdirSync(dir);
    const data = files.map(file => {
      return readKeysFromFile(file);
    });

    const txKeys = tx.masterPubKeys;
    const filtered = data.filter(item => {
      return (txKeys.indexOf(item.pubBTC) >= 0 || txKeys.indexOf(item.pubBTC) >= 0);
    });

    return filtered;

  } catch (e) {
    console.error(e);
    return e;
  }
};


function keyEncrypt (mnemonic, passphrase) {
  const algorithm = 'aes256';
  const inputEncoding = 'utf8';
  const outputEncoding = 'hex';

  const cipher = crypto.createCipher(algorithm, passphrase);
  let ciphered = cipher.update(mnemonic, inputEncoding, outputEncoding);
  ciphered += cipher.final(outputEncoding);

  return ciphered;
}


export function keyDecrypt (hash, passphrase) {
  const algorithm = 'aes256';
  const inputEncoding = 'utf8';
  const outputEncoding = 'hex';

  const decipher = crypto.createDecipher(algorithm, passphrase);
  let deciphered = decipher.update(hash, outputEncoding, inputEncoding);
  deciphered += decipher.final(inputEncoding);

  return deciphered;
}

const writeKeysToFile = function (data) {
  const dir = path.resolve(appData, 'signatureSoftware');

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(`${dir}/${data.name}.json`, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
    return e;
  }
};


export const readKeysFromFile = function (name) {
  const dir = path.resolve(appData, 'signatureSoftware');

  try {
    const data = fs.readFileSync(`${dir}/${name}`);
    return JSON.parse(data.toString());
  } catch (e) {
    console.error(e);
    return e;
  }

};

export const rewriteTxFile = function (tx, path) {
  try {
    fs.writeFileSync(path, JSON.stringify(tx, null, 2));
  } catch (e) {
    console.error(e);
    return e;
  }
};


