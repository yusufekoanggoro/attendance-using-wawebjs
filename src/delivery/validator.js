const arrayUtils = require('../lib/utils/array');
const wrapper = require('../lib/utils/wrapper');
const config = require('../../config');

const incomingMessage = async (msg) => {
  const chat = await msg.getChat();
  const msgBody = msg.body;

  const validation = [
    chat.isGroup,
    typeof msg.body === 'string',
  ];

  if (config.get('/isCertainGroup')) {
    validation.push(
      config.get('/allowedGroups').includes(chat.id._serialized),
    );
  }

  if (arrayUtils.allAreTrue(validation)) {
    const groupInfo = {
      id: chat.id._serialized,
      id2: msg.from,
      name: chat.name,
    };

    const userInfo = {
      id: msg.author,
      name: '',
      npm: '',
    };

    return wrapper.data({
      chat, groupInfo, userInfo, msgBody: msgBody.trim(),
    });
  }

  return wrapper.error('validation valid: incoming message');
};

module.exports = {
  incomingMessage,
};
