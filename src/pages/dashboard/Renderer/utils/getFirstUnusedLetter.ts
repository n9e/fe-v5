import _ from 'lodash';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

const getFirstUnusedLetter = (usedLetters: string[]) => {
  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i];
    if (!_.includes(usedLetters, letter)) {
      return letter;
    }
  }
  return 'Z';
};

export default getFirstUnusedLetter;