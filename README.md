
<p align="center">
  <img src="https://files.catbox.moe/hubkvg.jpg" width="250"/>
</p>

<h1 align="center">Rin Okumura - WhatsApp Bot X Telegram Bot</h1>


---

## 👤 Owner

> GitHub: [LeooxzyDekuu](https://github.com/LeooxzyDekuu.png)  
> Project: **Rin Okumura WhatsApp Bot X Telegram Bot**

---

> Bot WhatsApp modular yang kuat menggunakan JavaScript, dibuat dengan sistem plugin untuk fleksibilitas maksimal. Terinspirasi oleh **Rin Okumura** dari *Blue Exorcist*, bot ini menghadirkan semangat dan disiplin dalam obrolan Anda!

---

## 📌 Features

- Arsitektur berbasis plugin
- Ditulis dalam JavaScript
- Kompatibel dengan CommonJS & ESModule
- Pembuatan perintah yang mudah
- Terinspirasi oleh karakter anime Rin Okumura

---

## ⚙️ Config.js

```javascript
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
```

## ⚙️ Install
```bash
$ git clone https://github.com/FrankXz12/HanakoBotz
$ cd HanakoBotz
$ npm install
$ npm start
```

## 🌐 Commonjs Example File .js

## 🧠 Example Plugin (No Regex)

```javascript
let handler = async (m, { conn, ctx, client, sock, text, Func, config, Scraper }) => {
  // code
};

handler.command = ['expired', 'exp'];
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
handler.owner = false;
handler.group = false;
handler.admin = false;
handler.botAdmin = false;

module.exports = handler;
```

---

## ⚡ Example Plugin (With Regex)

```javascript
let handler = async (m, { conn, ctx, client, sock, text, Func, config, Scraper }) => {
  // code
};

handler.command = /^(expired|exp)$/i;
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
handler.owner = false;
handler.group = false;
handler.admin = false;
handler.botAdmin = false;

module.exports = handler;
```

---

## 🌐 ECMAScript Module Example File .mjs

## 🧠 Example Plugin (No Regex)

```javascript
let handler = async (m, { conn, ctx, client, sock, text, Func, config, Scraper }) => {
  // code
};

handler.command = ['expired', 'exp'];
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
handler.owner = false;
handler.group = false;
handler.admin = false;
handler.botAdmin = false;

export default handler;
```

---

## ⚡ Example Plugin (With Regex)

```javascript
let handler = async (m, { conn, ctx, client, sock, text, Func, config, Scraper }) => {
  // code
};

handler.command = /^(expired|exp)$/i;
handler.help = ['expired', 'exp'];
handler.tags = ['run'];
handler.limit = false;
handler.loading = false;
handler.owner = false;
handler.group = false;
handler.admin = false;
handler.botAdmin = false;

export default handler;
```

---

## 💡 Command Fitur Plugin/Scrape

```Plugin
.plugin - buat liat list plugins
.plugin --add file/file.js / .plugin --add file/file.mjs - Buat Add Fitur
.plugin --get file/file.js / .plugin --get file/file.mjs - Buat Get Fitur
.plugin --delete file/file.js / .plugin --delete file/file.mjs - Buat Delete Fitur
```

```Scrape
.skrep - buat liat list skrep
.skrep --add file/file.js / .skrep --add file/file.mjs - Buat Add Skrep
.skrep --get file/file.js / .skrep --get file/file.mjs - Buat Get Skrep
.skrep --delete file/file.js / .skrep --delete file/file.mjs - Buat Delete Skrep
```

---

---

## 💡 Menu Command

```
.menu       - Show main menu
.menu all   - Show all commands
.menu tags  - Show commands by tags
```

---


## 👥 All Contributors
[![LeooxzyDekuu](https://github.com/LeooxzyDekuu.png?size=100)](https://github.com/LeooxzyDekuu) | [![AxellNetwork](https://github.com/AxellNetwork.png?size=100)](https://github.com/AxellNetwork) | [![AndhikaGG](https://github.com/AndhikaGG.png?size=100)](https://github.com/AndhikaGG)  
---|---|---  
[LeooxzyDekuu](https://github.com/LeooxzyDekuu) | [AxellNetwork](https://github.com/AxellNetwork) | [AndhikaGG](https://github.com/AndhikaGG)  
Remake Base | Base Script | Penyumbang fitur

---

> *"Api pengusir setan akan menuntun perintahmu. Jangan takut pada iblis, jadilah tuan."*
