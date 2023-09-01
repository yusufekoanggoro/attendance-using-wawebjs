const logger = require('../lib/logger');
const validator = require('./validator');
const presenceUsecase = require('../usecase/presence');
const config = require('../../config');

const minSleepmsHandleBlasting = config.get('/minSleepmsHandleBlasting')
  ? config.get('/minSleepmsHandleBlasting')
  : 500;
const maxSleepmsHandleBlasting = config.get('/maxSleepmsHandleBlasting')
  ? config.get('/maxSleepmsHandleBlasting')
  : 1500;
const timeUtils = require('../lib/utils/time');
const constants = require('../lib/utils/constants');

const onMessage = async (msg, additionalData) => {
  try {
    const {
      classHours,
      isFreeMode,
    } = additionalData;

    const validation = await validator.incomingMessage(msg);
    if (validation.err) throw new Error(validation.err);

    const {
      chat,
      groupInfo,
      userInfo,
      msgBody,
    } = validation.data;

    const payload = {
      msg,
      chat,
      groupInfo,
      userInfo,
      classHours,
      isFreeMode,
    };

    let result;
    let allowedReply;

    logger.info(`Processing: ${msgBody}`);
    switch (true) {
      case msgBody.startsWith('.daftar '):
        result = await presenceUsecase.createUser(payload);

        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

        allowedReply = [
          result.data === 'berhasil daftar, silahkan ketik .presensi',
          result.err === 'gagal daftar, format pesan salah',
          result.err === 'gagal daftar, npm sudah terdaftar',
          result.err === 'gagal daftar, pengguna sudah terdaftar',
        ];

        if (allowedReply.includes(true)) {
          await msg.reply(result.data !== null ? result.data : result.err);
        }

        if (result.err) logger.error(result.err);
        break;

      case msgBody.startsWith('.presensi'):
        result = await presenceUsecase.createPresence(payload);

        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

        allowedReply = [
          result.data !== null,
          result.err === 'waktu telah berakhir',
          result.err === 'gagal presensi, pengguna belum terdaftar',
        ];

        if (allowedReply.includes(true)) {
          if (allowedReply[2]) {
            await msg.reply(constants.REPLY_USER_NOT_REGISTERED);
          } else {
            await msg.reply(result.data !== null ? result.data : result.err);
          }
        }

        if (result.err) logger.error(result.err);
        break;

      case msgBody.startsWith('.kehadiran'):
        result = await presenceUsecase.getPresence(payload);

        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

        allowedReply = [
          result.data !== null,
          result.err === 'waktu telah berakhir',
          result.err === 'data not found',
        ];

        if (allowedReply.includes(true)) {
          await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

          if (allowedReply[2]) {
            await msg.reply('data tidak di temukan');
          } else {
            await msg.reply(result.data !== null ? result.data : result.err);
          }
        }

        if (result.err) logger.error(result.err);
        break;

      case msgBody.startsWith('.reminder'):
        result = await presenceUsecase.sendReminder(payload);

        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

        allowedReply = [
          result.data !== null,
          result.err === 'waktu telah berakhir',
        ];

        if (allowedReply.includes(true)) {
          await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
          if (allowedReply[0]) {
            if (result.data.textMentionsUser !== '' && result.data.mentions.length) {
              const reminder = `🤖 Reminder: Jangan lupa untuk melakukan presensi hari ini! ⏰\n\n${result.data.textMentionsUser}`;
              await chat.sendMessage(reminder, {
                mentions: result.data.mentions,
              });
            }
            if (!result.data.mentions.length) await msg.reply('done!');
          } else {
            await msg.reply(result.err);
          }
        }

        if (result.err) logger.error(result.err);
        break;

      case msgBody.startsWith('.peserta'):
        result = await presenceUsecase.getParticipants(payload);

        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

        allowedReply = [
          result.data !== null,
        ];

        if (allowedReply.includes(true)) {
          await msg.reply(result.data);
        }

        if (result.err) logger.error(result.err);
        break;

      case msgBody.startsWith('.help'):
        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
        await msg.reply(constants.HELP_MESSAGE);
        break;

      case msgBody.startsWith('.edit '):
        result = await presenceUsecase.updateUser(payload);

        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);

        allowedReply = [
          result.data !== null,
          result.err === 'gagal edit, pengguna belum terdaftar',
          result.err === 'gagal edit, npm sudah terdaftar',
          result.err === 'gagal edit, format pesan salah',
        ];

        if (allowedReply.includes(true)) {
          await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
          if (allowedReply[3]) {
            await msg.reply(constants.REPLY_WRONG_FORMAT_EDIT);
          } else {
            await msg.reply(result.data !== null ? result.data : result.err);
          }
        }

        if (result.err) logger.error(result.err);
        break;

      case msgBody.startsWith('.profile'):
        result = await presenceUsecase.getProfile(payload);
        await timeUtils.sleepRandom(minSleepmsHandleBlasting, maxSleepmsHandleBlasting);
        await msg.reply(result.data !== null ? result.data : result.err);
        break;

      default:
        await msg.reply('format pesan salah');
        logger.info('switch case default');
        break;
    }
    logger.info(`Processed: ${msgBody}`);
  } catch (error) {
    logger.error(error);
  }
};

module.exports = {
  onMessage,
};
