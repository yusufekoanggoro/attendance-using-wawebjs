const data = (data) => ({ err: null, data });

const error = (err) => ({ err, data: null });

module.exports = {
  data,
  error,
};
