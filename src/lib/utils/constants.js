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
7️⃣ Ketik ".sticker" ~sticker maker
8️⃣ Ketik ".quote" ~kata-kata hari ini boloo 🥰

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

// source: https://www.bola.com/ragam/read/5376986/40-kata-kata-hari-ini-simple-tapi-keren
const QUOTES_ARRAY = [
  "Bahagia adalah sebuah pilihan.",
  "Waktu tidak menunggu.",
  "Buatlah hidupmu indah.",
  "Jangan pernah meragukan instingmu.",
  "Bekerja keras. Tetaplah rendah hati.",
  "Rancanglah hidupmu dengan hati-hati.",
  "Raihlah bintang-bintang.",
  "Bangun dan hiduplah.",
  "Kamu tidak sendirian.",
  "Ambil tindakan, termotivasilah.",
  "Kumpulkanlah momen, bukan benda.",
  "Hiduplah dengan cerita yang baik.",
  "Cobalah sesuatu yang baru hari ini.",
  "Kebahagiaan tergantung kepada diri kita sendiri.",
  "Tidak apa-apa. Coba lagi.",
  "Kamu telah menangani yang lebih buruk sebelumnya.",
  "Jangan khawatir, berbahagialah.",
  "Pada akhirnya, cinta adalah segalanya.",
  "Kegagalan membangun karaktermu.",
  "Tidak ada kata terlambat.",
  "Hidup mengajarkan, cinta mengungkapkan.",
  "Segala sesuatu adalah pilihan.",
  "Pola pikir positif membawa kedamaian.",
  "Keberhasilan adalah 99 persen kegagalan.",
  "Jangan membandingkan dirimu sendiri.",
  "Nikmatilah perjalananmu.",
  "Jangan pernah menyerah.",
  "Lakukan sekarang juga!",
  "Berbuat lebih banyak. Jangan terlalu banyak berpikir.",
  "Biarkan hidup mengejutkanmu.",
  "Aku tahu aku bisa.",
  "Pikiran-pikiran yang indah menginspirasi orang lain.",
  "Jangan pernah meragukan instingmu.",
  "Bangkitlah dengan mengangkat orang lain.",
  "Nikmati hal-hal kecil.",
  "Fokuslah pada hal yang baik.",
  "Kamu hidup hanya sekali.",
  "Temukan kenyamanan dalam kekacauan.",
  "Dengarkan lebih banyak dan kurangi bicara.",
  "Jadikan hari ini luar biasa."
];

const QUOTES_ARRAY_2 = [
  "Cinta adalah pengorbanan, tapi kalau pengorbanan mulu sih namanya penderitaan.",
  "Tertawa bisa jadi obat terbaik. Tapi kalau kamu tertawa tanpa alasan yang jelas, mungkin kamu butuh obat.",
  "Belajarlah dari bulu ketek. Walaupun terhimpit tapi tetap tegar bertahan dan tetap tumbuh.",
  "Uang memang tidak menjamin kebahagiaan, tapi tidak punya uang lebih tidak terjamin lagi.",
  "Ketika seseorang berusaha menjauh darimu, jangan biarkan sebelum ia melunasi hutang-hutangnya.",
  "Jika kamu tak mampu meyakinkan dan memukau orang dengan kepintaranmu, bingungkan dia dengan kebodohanmu.",
  "Teman yang baik akan meminjamkan pundaknya untukmu menangis. Tapi sahabat yang baik akan meminjam cangkul untuk memukul orang yang membuatmu menangis.",
  "Saat Anda sopan, kami curiga.",
  "Sebenarnya pacar orang itu juga pacar kita karena kita kan juga orang.",
  "Ketika kamu malas, bukan berarti kamu rajin.",
  "Kerja keraslah sampai tetangga berpikir rezekimu hasil dari pesugihan.",
  "Sekali mendayung, dua tiga hari pegelnya enggak hilang-hilang.",
  "Kamu pasti capek ya, setiap pagi harus me-makeup dua wajah sekaligus.",
  "Di dunia ini ada tiga hal yang paling dibenci orang, yaitu otak kosong, omong kosong, dan juga dompet kosong.",
  "Kalau kamu pengen nyaman terus pacaran aja sama sofa.",
  "Manusia boleh berencana, tapi saldo juga yang menentukan.",
  "Aku tidak sedang menghinamu, aku sedang mendeskripsikan dirimu secara jujur.",
  "Kalau belajar sering lupa waktu, lupa waktu kalau sudah waktunya belajar.",
  "Terkadang hidup itu seperti komedi, kalau tidak tertawa ya ditertawakan.",
  "Bercanda tidak boleh kelewatan, jika kelewatan jadinya jauh mutarnya.",
  "Jangan mati-matian mengejar sesuatu yang tak bisa dibawa mati.",
  "Cinta itu harusnya seperti pelajaran kimia, bukan cuma teori, tapi ada praktik juga.",
  "Cara termudah mencari barang hilang di rumah adalah dengan membeli yang baru.",
  "Istikamah itu berat, kalau yang ringan mah istirahat.",
  "Mencintaimu itu wajar. Yang enggak wajar itu mencintai bapakmu.",
  "Pengalaman adalah guru terbaik, tapi guru yang baik belum tentu berpengalaman.",
  "Jika Tuhan belum menjawab doamu, bersabarlah, dan ingat bukan cuman kamu saja yang berdoa.",
  "Enggak usah mikirin omongan orang. Mereka aja ngomongnya enggak pakai pikiran.",
  "Uang tidak bisa membeli kebahagian, tetapi memiliki uang lebih bahagia dari pada tidak memiliki.",
  "Jangan suka membohongi diri sendiri karena itu jadi tugas orang lain.",
  "Tak ada pekerjaan berat di dunia ini. Pekerjaan seberat apa pun akan terasa ringan apabila tidak dikerjakan.",
  "Secapek-capeknya kerja, lebih capek menganggur.",
  "Karena disapa setitik, rusaklah move on sebelanga.",
  "Rumah tangga itu rumit. Kalau sederhana itu namanya rumah makan.",
  "Cinta sejati itu di dalam hati bukan di story Instagram.",
  "Persahabatan itu bagai ‘kepompong’, kadang kepo dan kadang rempong.",
  "Cewek hobi ngaca buat benerin dandanan, tapi enggak buat benerin kesalahan.",
  "Hidupmu seperti pohon pisang, punya jantung tapi tak punya hati.",
  "Sebenarnya pelajaran matematika di Amerika lebih susah karena dicampur bahasa Inggris.",
  "Nabung setengah mati, habisinnya setengah sadar.",
  "Kunci kesehatan cuma satu, yaitu jangan sakit.",
  "Sakit hati dan sakit gigi itu sama-sama berawal dari yang manis.",
  "Tidak ada yang abadi, kecuali perubahan dan pengeluaran.",
  "Jodoh emang gak kemana, tapi saingan di mana mana.",
  "Cinta itu buta. Tapi, cinta itu tahu mana mobil mana motor."
];

module.exports = {
  LogLevelColor,
  HELP_MESSAGE,
  REPLY_USER_NOT_REGISTERED,
  REPLY_USER_REGISTERED,
  REPLY_WRONG_FORMAT_EDIT,
  QUOTES_ARRAY,
  QUOTES_ARRAY_2,
};
