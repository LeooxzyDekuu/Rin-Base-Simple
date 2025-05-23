const fs = require('node:fs');

const ftpick = [
  "https://files.catbox.moe/118nmm.jpg",
  "https://files.catbox.moe/r5h96m.jpg",
  "https://files.catbox.moe/cwe31b.jpg"
]
const geturl = ftpick[Math.floor(Math.random() * ftpick.length)]

const config = {
    owner: ["6283136099660"],
    name: "Rin-Kun",
    ownername: 'Leooxzy', 
    ownername2: 'Dxyz',
    menu: { thumbnailUrl: 'https://files.catbox.moe/8h6ylu.jpg' }, //thumbnail: fs.readFileSync('./image/tambahkan-ft-trus-kasih-nama')
    thumbnail: {
      thumbnailUrl: geturl
      //thumbnail: fs.readFileSync('./image/tambahkan-ft-trus-kasih-nama')
    },
    isQr: false,
    prefix: [".", "?", "!", "/", "#"], //Tambahin sendiri prefix nya kalo kurang
    wagc: [ "https://chat.whatsapp.com/JyeT1hdCPJeLy95tzx5eyI", "https://chat.whatsapp.com/DfffgArbTUu46nqCgmCbE0" ],
    saluran: '120363401113812327@newsletter', 
    jidgroupnotif: '120363266755712733@g.us', 
    saluran2: '120363335701540699@newsletter', 
    jidgroup: '120363267102694949@g.us', 
    wach: 'https://whatsapp.com/channel/0029VadFS3r89inc7Jjus03W', 
    sessions: "sessions",
    groq: {
     api: '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'
    },
    link: {
     tt: "https://www.tiktok.com/@leooxzy_ganz/"
    },
    bot: {
      whatsapp: true,
      telegram: false
    },
    telegram: {
      token: 'tokenlu',
      owner_id: '',
      owner: ['']
    },
    sticker: {
      packname: "〆 Rin-Kun",
      author: "By: Deku/Dxyz 〆"
    },
   messages: {
      wait: "*( Loading )* Tunggu Sebentar...",
      owner: "*( Denied )* Kamu bukan owner ku !",
      premium: "*( Denied )* Fitur ini khusus user premium",
      group: "*( Denied )* Fitur ini khusus group",
      botAdmin: "*( Denied )* Lu siapa bukan Admin group",
      grootbotbup: "*( Denied )* Jadiin Yuta-Botz admin dulu baru bisa akses",
   },
   database: "rin-db",
   tz: "Asia/Jakarta"
}

module.exports = config

let file = require.resolve(__filename);
fs.watchFile(file, () => {
   fs.unwatchFile(file);
  delete require.cache[file];
});
