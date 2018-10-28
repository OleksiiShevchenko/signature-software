const bcoin = require('bcoin');
const KeyRing = bcoin.keyring;
const Amount = bcoin.amount;
const { Coin, MTX } = bcoin.primitives;
const HDPublicKey = bcoin.hd.PublicKey;
const Script = bcoin.script;
const TX = bcoin.tx;
const HDPrivateKey = bcoin.hd.PrivateKey;

const network = 'main';
const m = 2;
const n = 3;
const { readKeysFromFile, keyDecrypt, rewriteTxFile } = require('./utils');


// const transaction = {
//   "inputs": [
//     {
//       "rawTx": "0100000000010126d732e66f74f8389ab5fd23651715adb60dd1f81a17cf3396c34799b0dc30bb000000001716001425ab764de75421a5fcd5cc90917dfbf7ec7c526cffffffff02f03c00000000000017a9143fa27aa8c4a5ee048f6d7637f267b7a2a08713d587da0001000000000017a91451385e6ae3e2e2bdec43996cacbc01ca6248c01687024730440220556aeeb4785c65ec7ed530c080c4c15eade1e0449b24a949c2935c3d2826681a0220681dc4fa9d552723bd4e2c54826a4a229f7b139730c31fda0beee594da0d31b6012102b024c694ed23d4fddb69a0f7aec4e9a1b0d22e0f305336155d3a6503bedd602300000000",
//       "index": 0,
//       "address": "37VV8sr4qaK8Nv8NQgVrRgRNDVin4vepjK",
//       "value": 15600,
//       "height": 545904,
//       "derivationIndex": 0,
//     },
//     // {
//     //   "rawTx": "01000000000101f6a5c0c86ae6280c49825111270d6286cbc887471354c56dce1dde4c69e75f4a000000001716001425ab764de75421a5fcd5cc90917dfbf7ec7c526cffffffff02f03c000000000000220020fe9d193bd76e095370f85399bd659256e63ae535db01218e9f3e2482c5ba778702fe00000000000017a914d44bd3afe2fd004e2fe9d82e7054324d74e6d38887024830450221009e9301802fcabf9d8b5a913d29e049dd2763fe9dc845e8f4bef276d6bf7c32b5022004a52f5dcc864aac904a883ab11c28008199ae1a7d0b0bc7af42233d44870cbd012102b024c694ed23d4fddb69a0f7aec4e9a1b0d22e0f305336155d3a6503bedd602300000000",
//     //   "index": 0,
//     //   "address": "bc1ql6w3jw7hdcy4xu8c2wvm6evj2mnr4ef4mvqjrr5l8cjg93d6w7rsf60qwq",
//     //   "value": 15600,
//     //   "height": 545904,
//     //   "derivationIndex": 1,
//     // },
//     // {
//     //   "rawTx": "010000000001015c53b8d0ab96514f2b9f7a955304028bc80838d66205c5d1a2b533aad42532b4010000001716001442c06116d6dbe97dc2b803a3c0eac22107582f42ffffffff02f03c00000000000017a9149b9aca2ad84ae5e49d2a5fd2c1f4eabf3bebd53e87dcc200000000000017a914d716d46f3b9f29e33ad2ad3cb5250537b712f519870247304402202960ec2aab2d639628c61d3c70c0fbd00fa4c61ca91b5e17f504a65074a4751c022021b9e3c7a0166fb6886fd0568f3c20f2879b4a2661e47abe0b8d68b7215f15d501210284562b86310ad654f9e3b74d6e0f5631786ebb4074fa4c23b38f07ca328a26c900000000",
//     //   "index": 0,
//     //   "address": "3Fsn6FmmBhi18t4db7XmMfovQssJWsDWF6",
//     //   "value": 15600,
//     //   "height": 545904,
//     //   "derivationIndex": 2,
//     // }
//   ],
//   "amount": "0.000156",
//   "address": "3KDf2PmM5LkGv3ZG8cJTgxef99ksHq3Y4B",
//   "masterPubKeys": [
//     "xpub6EbGf4gmGMFRn3u9JEx65BpBJJbxgf4RD4dPkxRDX5hsRhTNVz4NXCqnHZyJptCTJWU3BYeXThe7NobdTizSY334WKHJAV9nUYMxHdWgays",
//     "xpub6DbSt4EcpCEyXR3dCNgYPt5JysbJHgJzMt3fUmVumV6frsDz8c7JdheRuFELofUMAA5n8tQbAxo5nXLL5GpGPiWWPJYdoFRNY14dcrv9FDb",
//     "xpub6F7UQUZfXkZbQpDBN1erkgWRQbm7NPdQezNPfVDs4mUMD9mkJUz6xwWNfYwuLPv9ZNu3ETJGRqhxLWy3K8b2Arr9fDzKdqp3PWto8xS1yka"
//   ]
// };






export function signBTC (key, tx, path) {
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
    const privateKey = HDPrivateKey.fromPhrase(mnemonic, network).derivePath(`m/44'/0'/0'/0`).derive(input.derivationIndex).privateKey;
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
