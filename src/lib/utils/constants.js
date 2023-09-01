/**
 * Events that can be emitted by the client
 * @readonly
 * @enum {string}
 */
module.exports.Events = {
  AUTHENTICATED: 'authenticated',
  AUTHENTICATION_FAILURE: 'auth_failure',
  READY: 'ready',
  CHAT_REMOVED: 'chat_removed',
  CHAT_ARCHIVED: 'chat_archived',
  MESSAGE_RECEIVED: 'message',
  MESSAGE_CREATE: 'message_create',
  MESSAGE_REVOKED_EVERYONE: 'message_revoke_everyone',
  MESSAGE_REVOKED_ME: 'message_revoke_me',
  MESSAGE_ACK: 'message_ack',
  MESSAGE_EDIT: 'message_edit',
  UNREAD_COUNT: 'unread_count',
  MESSAGE_REACTION: 'message_reaction',
  MEDIA_UPLOADED: 'media_uploaded',
  CONTACT_CHANGED: 'contact_changed',
  GROUP_JOIN: 'group_join',
  GROUP_LEAVE: 'group_leave',
  GROUP_ADMIN_CHANGED: 'group_admin_changed',
  GROUP_UPDATE: 'group_update',
  QR_RECEIVED: 'qr',
  LOADING_SCREEN: 'loading_screen',
  DISCONNECTED: 'disconnected',
  STATE_CHANGED: 'change_state',
  BATTERY_CHANGED: 'change_battery',
  INCOMING_CALL: 'call',
  REMOTE_SESSION_SAVED: 'remote_session_saved',
};

const LogLevelColor = {
  info: '\x1b[36m',
  error: '\x1b[31m',
  warn: '\x1b[33m',
  verbose: '\x1b[43m',
};

const HELP_MESSAGE = `
🤖 Welcome to Help Bot! 🚀
            
Available Commands:
1️⃣ Ketik ".help"
2️⃣ Ketik ".daftar npm nama"
3️⃣ Ketik ".presensi"
4️⃣ Ketik ".peserta"
5️⃣ Ketik ".kehadiran"
5️⃣ Ketik ".edit npm|nama value"
6️⃣ Ketik ".profile"
    
Feel free to explore and interact with the bot 🤗`;

const REPLY_USER_NOT_REGISTERED = `kamu belum terdaftar
silahkan ketik .daftar npm nama
lalu .presensi`;

const REPLY_USER_REGISTERED = `pengguna atau npm sudah terdaftar
silahkan ketik .presensi`;

const REPLY_WRONG_FORMAT_EDIT = `format pesan salah.
contoh:
ubah npm: .edit npm 2020xxx
ubah nama: .edit nama Udin`;

module.exports = {
  LogLevelColor,
  HELP_MESSAGE,
  REPLY_USER_NOT_REGISTERED,
  REPLY_USER_REGISTERED,
  REPLY_WRONG_FORMAT_EDIT,
};
