
export default function (field, value, formValues) {
  switch (field) {
    case 'mnemonic':
      const words = value.trim().split(/[\s\u3000]+/);
      const wbits = words.length * 11;
      const cbits = wbits % 32;
      const bits = wbits - cbits;

      return (
        typeof value === 'string' &&
        value.length <= 1000 &&
        cbits !== 0 &&
        bits >= 128 &&
        bits <= 512 &&
        bits % 32 === 0
      );
      break;
    case 'name':
      if (typeof value == 'string' && value.length > 0) return true;
      else return false;
      break;
    case 'passphrase':
      return (typeof value === 'string' && value.length > 4);
      break;
    case 'passphraseConfirm':
      if (typeof value === 'string' && value.length > 4 && value === formValues.passphrase.value) return true;
      else return false;
      break;
    default:
      return false;
  }
}