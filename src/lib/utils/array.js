const allAreTrue = (arr) => {
  try {
    return arr.every((element) => element === true);
  } catch (error) {
    return false;
  }
};

module.exports = {
  allAreTrue,
};
