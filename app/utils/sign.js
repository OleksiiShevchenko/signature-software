const bcoin = require('bcoin');
const KeyRing = bcoin.keyring;
const Amount = bcoin.amount;
const {Coin, MTX} = bcoin.primitives;
const HDPublicKey = bcoin.hd.PublicKey;
const Script = bcoin.script;
const TX = bcoin.tx;
const HDPrivateKey = bcoin.hd.PrivateKey;
const revHex = bcoin.util.revHex;

const abi = require('ethereumjs-abi');
const BN = require('bn.js');
const BigNumber = require('bignumber.js');
const truffleContract = require('truffle-contract');
const ethUtil = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx');


const ledger = require('./ledger');

const {readKeysFromFile, keyDecrypt, rewriteTxFile, ethToChecksumAddress} = require('./utils');


const network = 'main';
const m = 2;
const n = 3;
const btcPath = `m/44'/0'/0'/0`;
const ethPath = `m/44'/60'/0'/0`;


export function signBTC(key, tx, path) {

  //Only segwit
  return signSegwitBTC(key, tx, path);


  //TODO refactor P2SH addresses to work for multiple inputs
  //Get mnemonic from the file
  const isFirstSignature = !(tx.signatures && tx.signatures.length > 0);

  const keyData = readKeysFromFile(`${key.currentKey}.json`);
  const mnemonic = keyDecrypt(keyData.hash, key.passphrase);

  let spend = null;

  if (!isFirstSignature) {
    spend = MTX.fromRaw(new Buffer(tx.signatures[0], 'hex'));
  } else {
    spend = new MTX();
    //add output
    spend.addOutput({
      address: tx.address,
      value: Amount.fromBTC(tx.amount).toValue()
    });
  }

  //Sign every input in transaction
  for (const input of tx.inputs) {

    //Derive the public keys in order to retrieve the redeem script
    const derivedPubKeys = tx.masterPubKeys.map(key => {
      return HDPublicKey
        .fromBase58(key, network)
        .derive(input.derivationIndex)
        .publicKey;
    });

    //Get multisig redeem script from public keys
    const redeem = Script.fromMultisig(m, n, derivedPubKeys);
    const script = Script.fromScripthash(redeem.hash160());

    //retrieve the private key from mnemonic and derive using the addresses index
    const privateKey = HDPrivateKey.fromPhrase(mnemonic, network).derivePath(btcPath).derive(input.derivationIndex).privateKey;
    //get keyring from private key
    const ring = KeyRing.fromPrivate(privateKey);

    //decrypt the tx raw data to get tx hash
    const decryptTxHash = TX.fromRaw(input.rawTx, 'hex').toJSON();

    const txInfo = {
      value: Amount.fromBTC(tx.amount).toValue(),
      hash: decryptTxHash.hash,
      index: input.index
    };

    const coin = Coin.fromJSON({
      version: 1,
      height: -1,
      value: txInfo.value,
      coinbase: false,
      script: script.toJSON(),
      hash: txInfo.hash,
      index: txInfo.index
    });

    ring.script = redeem;

    //add coin
    if (!isFirstSignature) {
      spend.view.addCoin(coin);
    } else {
      spend.addCoin(coin);
      spend.scriptInput(0, coin, ring);
    }

    //sign input
    spend.signInput(0, coin, ring);

    if (!isFirstSignature) console.log(spend.verify(), 'Verify');
  }

  //raw tx
  const raw = spend.toRaw();
  //store this in the tx file for the first signature
  if (!tx.signatures) tx.signatures = [];
  tx.signatures.push(raw.toString('hex'));
  return rewriteTxFile(tx, path);

}


async function signSegwitBTC(key, tx, path) {
  const isLedger = key.currentKey === 'ledger';

  const isFirstSignature = !(tx.signatures && tx.signatures.length > 0);

  let keyData;
  let mnemonic;

  if (!isLedger) {
    keyData = readKeysFromFile(`${key.currentKey}.json`);
    mnemonic = keyDecrypt(keyData.hash, key.passphrase);
  }

  let spend = null;
  const coins = [];
  const data = {};


  if (!isFirstSignature) spend = MTX.fromRaw(new Buffer(tx.signatures[0], 'hex'));
  else spend = new MTX();

  spend.signInputLedger = signInputLedger;

  //Sign every input in transaction
  for (const input of tx.inputs) {

    //Derive the public keys in order to retrieve the redeem script
    const derivedPubKeys = tx.masterPubKeys.map(key => {
      return HDPublicKey
        .fromBase58(key, network)
        .derive(input.derivationIndex)
        .publicKey;
    });

    const decryptTxHash = TX.fromRaw(input.rawTx, 'hex').toJSON();

    let privateKey;
    let ring;

    if (!isLedger) {
      //retrieve the private key from mnemonic and derive using the addresses index
      privateKey = HDPrivateKey.fromPhrase(mnemonic, network).derivePath(btcPath).derive(input.derivationIndex).privateKey;

      //get keyring from private key
      ring = KeyRing.fromPrivate(privateKey);
    } else {
      const xpub = await ledger.getXPUB(btcPath, 'BTC');
      const publicKey = HDPublicKey.fromBase58(xpub, network).derive(input.derivationIndex).publicKey;

      ring = KeyRing.fromPublic(publicKey);
    }

    ring.witness = true;
    ring.script = Script.fromMultisig(m, n, derivedPubKeys);

    const address = input.address.includes('bc1') ? ring.getAddress() : ring.getNestedAddress();


    const txinfo = {
      hash: revHex(decryptTxHash.hash),
      index: input.index,
      value: Amount.fromSatoshis(input.value).toValue(),
      script: Script.fromAddress(address)
    };

    const coin = Coin.fromOptions(txinfo);

    coins.push(coin);

    data[txinfo.hash] = {
      ring,
      coin,
      rawTx: input.rawTx,
      derivationIndex: input.derivationIndex
    };
  }

  if (isFirstSignature) await spend.fund(coins, {
    rate: 2000,
    changeAddress: tx.address,
    selection: 'all'
  });


  let result;

  if (isLedger) {
    const inputs = [];
    const associatedKeysets = [];

    const outputScriptHex = ledger.btc.serializeTransactionOutputs(ledger.btc.splitTransaction(spend.toRaw(), true)).toString('hex');

    spend.inputs.forEach((input, i) => {

      const hash = input.prevout.hash;
      const ring = data[hash].ring;
      const rawTx = data[hash].rawTx;
      const derivationIndex = data[hash].derivationIndex;

      const txObject = ledger.btc.splitTransaction(rawTx, true);
      const outputIndex = input.prevout.index;
      const redeem = ring.script.toRaw().toString('hex');

      inputs.push([txObject, outputIndex, redeem]);
      associatedKeysets.push(`${btcPath}/${derivationIndex}`);
    });

    console.log(JSON.stringify({ledgerCoins: inputs, associatedKeysets, outputScript: outputScriptHex}));

    result = await ledger.btc.signP2SHTransaction(inputs, associatedKeysets, outputScriptHex, 0, 1, true);
  }


  spend.inputs.forEach((input, i) => {

    const hash = input.prevout.hash;
    const coin = data[hash].coin;
    const ring = data[hash].ring;

    if (!isFirstSignature) spend.view.addCoin(coin);
    else spend.scriptInput(i, coin, ring);

    //spend.signInputLedger(i, coin, ring, result[0])
    isLedger ? spend.signInput(i, coin, ring, 1, result[0]) : spend.signInput(i, coin, ring, 1);
  });

  console.log(spend.verify(), 'verify');

  //raw tx
  const raw = spend.toRaw();
  //store this in the tx file for the first signature
  if (!tx.signatures) tx.signatures = [];
  tx.signatures.push(raw.toString('hex'));
  return rewriteTxFile(tx, path);

}


export async function signETH(key, tx, path) {
  const isLedger = key.currentKey === 'ledger';

  const firstSignature = !tx.signatures || tx.signatures.length === 0;

  let keyData;
  let mnemonic;
  let privateKey;

  if (!isLedger) {
    keyData = readKeysFromFile(`${key.currentKey}.json`);
    mnemonic = keyDecrypt(keyData.hash, key.passphrase);
    privateKey = HDPrivateKey.fromPhrase(mnemonic, network).derivePath(`m/44'/60'/0'/0`).derive(0);
  }

  const amount = parseInt(tx.amount);
  const sequenceId = parseInt(tx.sequenceId);
  const data = '';

  if (firstSignature) {

    const toAddress = tx.address;
    const expireTime = Math.floor((new Date().getTime()) / 1000) + 3600 * 24;

    // console.log({
    //   toAddress,
    //   amount,
    //   data,
    //   expireTime,
    //   sequenceId
    // }, 'operation hash params');

    const operationHash = getSha3ForConfirmationTx(
      toAddress,
      amount,
      data,
      expireTime,
      sequenceId
    );

    const sig = ethUtil.ecsign(operationHash, privateKey.privateKey);

    if (!tx.signatures) tx.signatures = [];
    tx.signatures.push(serializeSignature(sig));
    tx.expireTime = expireTime;

  } else {

    const contractAddress = tx.contractAddress;
    const toAddress = tx.address;

    const wallet = truffleContract(tx.contract);
    const walletInstance = wallet.at(contractAddress);

    const gasPrice = 20000000000;//tx.fees.gasPrice;
    const gasLimit = 6721975;//tx.fees.gasLimit;

    let pubKey;
    if (isLedger) {
      const xpub = await ledger.getXPUB(ethPath, 'ETH');
      pubKey = HDPublicKey.fromBase58(xpub, network).derive(0).publicKey;
    } else {
      pubKey = privateKey.toPublic().publicKey;
    }

    const address = ethUtil.publicToAddress(pubKey, true);
    const keyAddress = ethToChecksumAddress(`0x${address.toString('hex')}`);

    const fromData = tx.masterAddresses.filter(item => {
      return item.checksumAddress === keyAddress;
    });

    // console.log({
    //   toAddress,
    //   amount: ethUtil.addHexPrefix(coinsToWei(amount).toString(16)),
    //   data,
    //   expireTime: tx.expireTime,
    //   sequenceId,
    //   sig: tx.signatures[0],
    // }, 'sendMultisig params');

    const txData = walletInstance.sendMultiSig.request(
      toAddress,
      ethUtil.addHexPrefix(coinsToWei(amount).toString(16)),
      data,
      tx.expireTime,
      sequenceId,
      tx.signatures[0],
      {from: keyAddress}
    );

    // console.log(txData, 'txdata result');

    const txParams = {
      nonce: ethUtil.addHexPrefix(Number(fromData[0].nonce).toString(16)),
      gasPrice: ethUtil.addHexPrefix(Number(gasPrice).toString(16)),
      gasLimit: ethUtil.addHexPrefix(Number(gasLimit).toString(16)),
      to: contractAddress,
      from: keyAddress,
      value: ethUtil.addHexPrefix(Number(0).toString(16)),
      data: txData.params[0].data,
      // EIP 155 chainId - mainnet: 1, ropsten: 3
      chainId: 1
    };

    //console.log(txParams, 'tx params');

    let rawTx;

    if (isLedger) {
      rawTx = new ethTx(txParams);
      rawTx.v = 1;
      rawTx.r = 0;
      rawTx.s = 0;

      const serializedTx = rawTx.serialize();
      const rawTxHex = serializedTx.toString('hex');

      const signature = await ledger.eth.signTransaction("m/44'/60'/0'/0/0", rawTxHex);

      signature.v = new Buffer(signature.v, 'hex');
      signature.r = new Buffer(signature.r, 'hex');
      signature.s = new Buffer(signature.s, 'hex');

      // if (txParams.chainId > 0) {
      //   signature.v += txParams.chainId * 2 + 8;
      // }

      console.log(signature, 'RESULT');


      Object.assign(rawTx, signature);

    } else {
      rawTx = new ethTx(txParams);
      rawTx.sign(privateKey.privateKey);
    }

    const serializedTx = rawTx.serialize();
    const rawTxHash = ethUtil.addHexPrefix(serializedTx.toString('hex'));

    console.log(ethUtil.addHexPrefix(serializedTx.toString('hex')), 'rawTx');

    tx.signatures.push(rawTxHash);
  }

  return rewriteTxFile(tx, path);
}


// Helper to get sha3 for solidity tightly-packed arguments
const getSha3ForConfirmationTx = function (toAddress, amount, data, expireTime, sequenceId) {

  return abi.soliditySHA3(
    ['string', 'address', 'uint', 'string', 'uint', 'uint'],
    ['ETHER', new BN(toAddress.replace('0x', ''), 16), ethUtil.addHexPrefix(coinsToWei(amount).toString(16)), data, expireTime, sequenceId]
  );
};

const WEI_MULT = 10 ** 18;
const coinsToWei = coins => new BigNumber(coins).multipliedBy(WEI_MULT);

// Serialize signature into format understood by our recoverAddress function
const serializeSignature = ({r, s, v}) => '0x' + Buffer.concat([r, s, Buffer.from([v])]).toString('hex');


function signInputLedger(index, coin, ring, sig) {

  sig = Buffer.from(sig, 'hex');

  const input = this.inputs[index];

  // Get the previous output's script
  let prev = coin.script;
  let vector = input.script;
  let redeem = false;


  // Grab regular p2sh redeem script.
  if (prev.isScripthash()) {
    console.log('isscripthash');
    prev = input.script.getRedeem();
    if (!prev) {
      throw new Error('Input has not been templated.',);
    }
    redeem = true;
  }

  // If the output script is a witness program,
  // we have to switch the vector to the witness
  // and potentially alter the length. Note that
  // witnesses are stack items, so the `dummy`
  // _has_ to be an empty buffer (what OP_0
  // pushes onto the stack).
  if (prev.isWitnessScripthash()) {
    console.log('iswitness');
    prev = input.witness.getRedeem();
    if (!prev)
      throw new Error('Input has not been templated.');
    vector = input.witness;
    redeem = true;
  } else {
    const wpkh = prev.getWitnessPubkeyhash();
    if (wpkh) {
      prev = Script.fromPubkeyhash(wpkh);
      vector = input.witness;
      redeem = false;
    }
  }

  if (redeem) {
    const stack = vector.toStack();
    const redeem = stack.pop();

    const result = this.signVector(prev, stack, sig, ring);

    if (!result)
      return false;

    result.push(redeem);

    vector.fromStack(result);

    return true;
  }

  const stack = vector.toStack();
  const result = this.signVector(prev, stack, sig, ring);

  if (!result)
    return false;

  vector.fromStack(result);

  return true;
}

