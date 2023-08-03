const capitalizeEachWord = (str) => {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Return the input as-is if it's not a string or an empty string
  }

  const words = str.split(' ');
  const capitalizedWords = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return capitalizedWords.join(' ');
};

const containsOnlyNumbers = (inputString) => {
  // Regular expression to match digits (0-9) in the entire string
  const regex = /^\d+$/;
  return regex.test(inputString);
};

const isStringValid = (inputString, validationString) => {
  const res = inputString.toLowerCase() === validationString.toLowerCase();
  return res;
};

const isAlphabetOnlyWithSpace = (inputString) => {
  // Regular expression to match only alphabet characters (A-Z or a-z) with spaces
  const alphabetWithSpaceRegex = /^[A-Za-z\s]+$/;
  return alphabetWithSpaceRegex.test(inputString);
};

module.exports = {
  capitalizeEachWord,
  containsOnlyNumbers,
  isStringValid,
  isAlphabetOnlyWithSpace,
};
