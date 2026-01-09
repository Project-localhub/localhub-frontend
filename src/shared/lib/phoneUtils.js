export const formatPhoneNumber = (value) => {
  const numbers = value.replace(/[^0-9]/g, '');

  if (
    numbers.startsWith('010') ||
    numbers.startsWith('011') ||
    numbers.startsWith('016') ||
    numbers.startsWith('017') ||
    numbers.startsWith('018') ||
    numbers.startsWith('019')
  ) {
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  }

  if (numbers.startsWith('02')) {
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 6)}-${numbers.slice(6, 10)}`;
    }
  }

  const areaCodes = [
    '031',
    '032',
    '033',
    '041',
    '042',
    '043',
    '044',
    '051',
    '052',
    '053',
    '054',
    '055',
    '061',
    '062',
    '063',
    '064',
  ];
  const matchedAreaCode = areaCodes.find((code) => numbers.startsWith(code));

  if (matchedAreaCode) {
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
  }

  return numbers;
};

export const validatePhoneNumber = (phoneNumber) => {
  const numbers = phoneNumber.replace(/[^0-9]/g, '');

  if (numbers.match(/^(010|011|016|017|018|019)\d{8}$/)) {
    return true;
  }

  if (numbers.match(/^02\d{7,8}$/)) {
    return true;
  }

  if (numbers.match(/^(031|032|033|041|042|043|044|051|052|053|054|055|061|062|063|064)\d{7,8}$/)) {
    return true;
  }

  return false;
};
