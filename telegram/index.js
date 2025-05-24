const { Telegraf } = require('telegraf');
const chalk = require('chalk');
const config = require('@configuration');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const bot = new Telegraf(config.telegram.token);

console.log(chalk.bold.green('[ Loading ] ') + chalk.white('>>> ') + chalk.green('🔁 Memuat Base Telegram...'));
console.log(chalk.bold.green('[ Terconnect ] ') + chalk.white('>>> ') + chalk.green('Bot berhasil terhubung.'));

// Media helper
const getMediaFileId = (msg) => {
  return msg?.photo?.[msg.photo.length - 1]
    || msg?.video
    || msg?.audio
    || msg?.document
    || msg?.voice
    || msg?.sticker
    || null;
};

// Global Scraper Loader
(async () => {
  global.scraper = new (await require(process.cwd() + "/scrapers"))(process.cwd() + "/scrapers/src");
  await scraper.watch();
  await scraper.load();
  setInterval(async () => {
    await scraper.load();
  }, 2000);
})();

// Middleware untuk inject fungsi
bot.use(async (ctx, next) => {
  const m = ctx.message;
  if (!m) return next();

  m.pushName = async (id) => {
    try {
      const user = await ctx.telegram.getChat(id);
      return user.first_name || user.username || 'User';
    } catch (e) {
      console.error(chalk.red('[ ERROR ]'), e.message);
      return 'User';
    }
  };
  
  m.reply = (text) => ctx.reply(text);
  
  m.download = async () => {
    try {
      const fileId = getMediaFileId(m);
      if (!fileId) throw new Error('Tidak ada media.');
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
      return Buffer.from(response.data, 'binary');
    } catch (e) {
      console.error(chalk.red('[DOWNLOAD ERROR]'), e.message);
      throw new Error('Gagal download media.');
    }
  };

  if (m.reply_to_message) {
    m.quoted = m.reply_to_message;
    m.quoted.download = async () => {
      try {
        const fileId = getMediaFileId(m.quoted);
        if (!fileId) throw new Error('Tidak ada media di reply.');
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary');
      } catch (e) {
        console.error(chalk.red('[QUOTED DOWNLOAD ERROR]'), e.message);
        throw new Error('Gagal download media dari quoted.');
      }
    };
  }

  ctx.m = m;

  // Panggil semua handler
  try {
    const handlers = ['./tldxyz.js', './eval.js'];
    for (const handlerPath of handlers) {
      delete require.cache[require.resolve(handlerPath)];
      await require(handlerPath)(bot, ctx);
    }
  } catch (err) {
    console.error(chalk.red('[HANDLER ERROR]'), err.message);
  }

  await next();
});


const callbackPath = path.join(__dirname, "callback");
fs.readdirSync(callbackPath).forEach(file => {
  const fullPath = path.join(callbackPath, file);
  
  // Hapus cache untuk hot-reload
  const isCached = require.cache[require.resolve(fullPath)];
  if (isCached) delete require.cache[require.resolve(fullPath)];

  const cb = require(fullPath);

  if (cb.pattern && typeof cb.handler === "function") {
    bot.action(cb.pattern, (ctx) => cb.handler(ctx, ctx.match));
    console.log(`${isCached ? "[UPDATED]" : "[ADDED]"} Callback loaded: ${file}`);
  } else {
    console.log(`[SKIPPED] Invalid callback file: ${file}`);
  }
});

// Jalankan bot
bot.launch()
  .then(() => console.log(chalk.green('[ BOT ] Telegram bot launched')))
  .catch(err => console.error('[ LAUNCH ERROR ]', err.message));

// Auto-reload index.js
const file = __filename;
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.green(`[ CHANGE ] '${file}' updated. Reloading...`));
  process.exit(0);
});
