const usecase = require('../usecase/normal');
const timeUtils = require('../lib/utils/time');
const logger = require('../lib/logger');
const constants = require('../lib/utils/constants');
const config = require('../../config');

const minSleepmsHandleBlasting = config.get('/minSleepmsHandleBlasting')
  ? config.get('/minSleepmsHandleBlasting')
  : 500;
const maxSleepmsHandleBlasting = config.get('/maxSleepmsHandleBlasting')
  ? config.get('/maxSleepmsHandleBlasting')
  : 1500;

const ucAbnormal = require('../usecase/abnormal');

const onMessage = async (client, normalMode) => {
  client.on('message', async (msg) => {
    try {
      const chat = await msg.getChat();
      if (chat.isGroup) {
        const msgBody = msg.body;
        if (typeof msgBody === 'string') {
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

          if (msgBody.startsWith('.daftar ')) {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.createUser({ msg, groupInfo, userInfo });
            } else {
              ucRes = await ucAbnormal.createUser({ msg, groupInfo, userInfo });
            }

            if (!ucRes.err) {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.data);
            } else {
              if (ucRes.err === 'gagal daftar, format pesan salah') {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
              }
              if(ucRes.err === 'gagal daftar, npm sudah terdaftar'){
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
              }
              if(ucRes.err === 'gagal daftar, pengguna sudah terdaftar'){
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
              }
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }

          if (msgBody === '.presensi') {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.createPresence({ groupInfo, userInfo });
            } else {
              ucRes = await ucAbnormal.createPresence({ groupInfo, userInfo });
            }

            if (!ucRes.err) {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.data);
            } else {
              if (ucRes.err === 'waktu telah berakhir') {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(`gagal presensi, ${ucRes.err}`);
              }
              if (ucRes.err === 'gagal presensi, pengguna belum terdaftar') {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(constants.REPLY_USER_NOT_REGISTERED);
              }
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }

          if (msgBody === '.peserta') {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.getParticipants({ groupInfo, userInfo });
            } else {
              ucRes = await ucAbnormal.getParticipants({ groupInfo, userInfo });
            }

            if (!ucRes.err) {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.data);
            } else {
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }

          if (msgBody === '.help') {
            await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
            await msg.reply(constants.HELP_MESSAGE);
          }

          if (msgBody === '.reminder') {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.sendReminder({
                groupInfo, userInfo, client, chat,
              });
            } else {
              ucRes = await ucAbnormal.sendReminder({
                groupInfo, userInfo, client, chat,
              });
            }

            if (!ucRes.err) {
              if (ucRes.data.textMentionsUser !== '' && ucRes.data.mentions.length) {
                const reminder = `🤖 Reminder: Jangan lupa untuk melakukan presensi hari ini! ⏰\n\n${ucRes.data.textMentionsUser}`;
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await chat.sendMessage(reminder, {
                  mentions: ucRes.data.mentions,
                });
              }
              if (!ucRes.data.mentions.length) {
                await msg.reply('done!');
              }
            } else {
              if (ucRes.err === 'waktu telah berakhir') {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
              }
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }

          if (msgBody === '.kehadiran') {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.getPresence(groupInfo);
            } else {
              ucRes = await ucAbnormal.getPresence(groupInfo);
            }

            if (!ucRes.err) {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.data);
            } else {
              if (ucRes.err === 'waktu telah berakhir') {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
              }
              if (ucRes.err === 'data not found') {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply('data tidak ditemukan');
              }
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }

          if (msgBody.startsWith('.edit ')) {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.updateUser({ msg, groupInfo, userInfo });
            } else {
              ucRes = await ucAbnormal.updateUser({ msg, groupInfo, userInfo });
            }

            if (!ucRes.err) {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.data);
            } else {
              if (ucRes.err === 'gagal edit, pengguna belum terdaftar'
               || ucRes.err === 'gagal edit, npm sudah terdaftar'
               ) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
              }
              if(ucRes.err === 'gagal edit, format pesan salah'){
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(constants.REPLY_WRONG_FORMAT_EDIT);
              }
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }

          if (msgBody === '.profile') {
            logger.info(`Processing: ${msgBody}`);

            let ucRes;
            if (normalMode) {
              ucRes = await usecase.getProfile({ groupInfo, userInfo });
            } else {
              ucRes = await ucAbnormal.getProfile({ groupInfo, userInfo });
            }

            if (!ucRes.err) {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.data);
            } else {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(ucRes.err);
              logger.error(ucRes.err);
            }
            logger.info(`Processed: ${msgBody}`);
          }
        }
      }
    } catch (error) {
      logger.error(error);
    }
  });
};

const onMessageCreate = async (client, normalMode) => {
  client.on('message_create', async (msg) => {
    try {
      if (msg.fromMe) {
        const chat = await msg.getChat();
        if (chat.isGroup) {
          const msgBody = msg.body;
          if (typeof msgBody === 'string') {
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
  
            if (msgBody.startsWith('.daftar ')) {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.createUser({ msg, groupInfo, userInfo });
              } else {
                ucRes = await ucAbnormal.createUser({ msg, groupInfo, userInfo });
              }
  
              if (!ucRes.err) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.data);
              } else {
                if (ucRes.err === 'gagal daftar, format pesan salah') {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(ucRes.err);
                }
                if(ucRes.err === 'gagal daftar, npm sudah terdaftar'){
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(ucRes.err);
                }
                if(ucRes.err === 'gagal daftar, pengguna sudah terdaftar'){
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(ucRes.err);
                }
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
  
            if (msgBody === '.presensi') {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.createPresence({ groupInfo, userInfo });
              } else {
                ucRes = await ucAbnormal.createPresence({ groupInfo, userInfo });
              }
  
              if (!ucRes.err) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.data);
              } else {
                if (ucRes.err === 'waktu telah berakhir') {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(`gagal presensi, ${ucRes.err}`);
                }
                if (ucRes.err === 'gagal presensi, pengguna belum terdaftar') {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(constants.REPLY_USER_NOT_REGISTERED);
                }
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
  
            if (msgBody === '.peserta') {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.getParticipants({ groupInfo, userInfo });
              } else {
                ucRes = await ucAbnormal.getParticipants({ groupInfo, userInfo });
              }
  
              if (!ucRes.err) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.data);
              } else {
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
  
            if (msgBody === '.help') {
              await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
              await msg.reply(constants.HELP_MESSAGE);
            }
  
            if (msgBody === '.reminder') {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.sendReminder({
                  groupInfo, userInfo, client, chat,
                });
              } else {
                ucRes = await ucAbnormal.sendReminder({
                  groupInfo, userInfo, client, chat,
                });
              }
  
              if (!ucRes.err) {
                if (ucRes.data.textMentionsUser !== '' && ucRes.data.mentions.length) {
                  const reminder = `🤖 Reminder: Jangan lupa untuk melakukan presensi hari ini! ⏰\n\n${ucRes.data.textMentionsUser}`;
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await chat.sendMessage(reminder, {
                    mentions: ucRes.data.mentions,
                  });
                }
                if (!ucRes.data.mentions.length) {
                  await msg.reply('done!');
                }
              } else {
                if (ucRes.err === 'waktu telah berakhir') {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(ucRes.err);
                }
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
  
            if (msgBody === '.kehadiran') {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.getPresence(groupInfo);
              } else {
                ucRes = await ucAbnormal.getPresence(groupInfo);
              }
  
              if (!ucRes.err) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.data);
              } else {
                if (ucRes.err === 'waktu telah berakhir') {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(ucRes.err);
                }
                if (ucRes.err === 'data not found') {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply('data tidak ditemukan');
                }
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
  
            if (msgBody.startsWith('.edit ')) {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.updateUser({ msg, groupInfo, userInfo });
              } else {
                ucRes = await ucAbnormal.updateUser({ msg, groupInfo, userInfo });
              }
  
              if (!ucRes.err) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.data);
              } else {
                if (ucRes.err === 'gagal edit, pengguna belum terdaftar'
                 || ucRes.err === 'gagal edit, npm sudah terdaftar'
                 ) {
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(ucRes.err);
                }
                if(ucRes.err === 'gagal edit, format pesan salah'){
                  await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                  await msg.reply(constants.REPLY_WRONG_FORMAT_EDIT);
                }
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
  
            if (msgBody === '.profile') {
              logger.info(`Processing: ${msgBody}`);
  
              let ucRes;
              if (normalMode) {
                ucRes = await usecase.getProfile({ groupInfo, userInfo });
              } else {
                ucRes = await ucAbnormal.getProfile({ groupInfo, userInfo });
              }
  
              if (!ucRes.err) {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.data);
              } else {
                await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
                await msg.reply(ucRes.err);
                logger.error(ucRes.err);
              }
              logger.info(`Processed: ${msgBody}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error(error);
    }
  });
};

module.exports = {
  onMessage,
  onMessageCreate,
};
