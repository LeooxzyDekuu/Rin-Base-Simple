/*
 *@ Script Based: Neko/Hanako
 *@ Remake Bagian: Help, Tags Command
 *@ Ch: https://whatsapp.com/channel/0029VadFS3r89inc7Jjus03W
*/

const config = require("./settings.js");
const Func = require("./lib/function.js");
const serialize = require("./lib/serialize.js");
const Uploader = require("./lib/uploader.js");
const {
   jidNormalizedUser,
   WAMessageStubType
} = require("baileys");
const moment = require("moment-timezone");
const cron = require("node-cron");
const {
  exec
} = require("child_process");
const chalk = require("chalk");

module.exports = async (m, sock, store) => {
  const client = conn = DekuGanz = sock;
  try {
     require("./lib/system.js")(m, sock, store);
  } catch (e) {
     console.log(e);
  };

  await db.main(m);
  if (m.isBot) return;
  if (db.list().settings.online) sock.readMessages([m.key]);  
  if (db.list().settings.self && !m.isOwner) return;
  if (m.isGroup && db.list().group[m.cht]?.mute && !m.isOwner) return;

  if (m.isOwner) {
      db.list().user[m.sender].premium = { status: true, expired: 99999 };
      db.list().user[m.sender].limit = 100;
  }

  if (Object.keys(store.groupMetadata).length === 0) {
    store.groupMetadata = await sock.groupFetchAllParticipating();
  }

  const isPrems = db.list().user[m.sender].premium.status;
  const isBanned = db.list().user[m.sender].banned.status;
  const isAdmin = m.isAdmin;
  const botAdmin = m.isBotAdmin;
  const Scraper = await scraper.list();
  const usedPrefix = config.prefix.includes(m.prefix);
  const text = m.text;
  const isCmd = m.prefix && usedPrefix;
   if (!m.isGroup && db.list().settings.onlygrub && !m.isOwner) {
      if (isCmd) return m.reply({ text: `Sorry Bre Ini Only Gc Link Gc:\n\n${config.wagc.map((a, i) => `${i + 1 + ','} ${a}`).join(`\n`)}` })
   }

  if (isPrems) {
      db.list().user[m.sender].limit = 100;
  }

  if (isCmd) {
      db.list().user[m.sender].rpg.exp += Math.floor(Math.random() * 20) + 1;
  }

  for (let name in pg.plugins) {
    let plugin;
    if (typeof pg.plugins[name].code === "function") {
      let anu = pg.plugins[name];
      plugin = anu.code;
      for (let prop in anu) {
        if (prop !== "run") {
          plugin[prop] = anu[prop];
        }
      }
    } else {
      plugin = pg.plugins[name];
    }
    if (!plugin) return;

    try {
      if (typeof plugin.events === "function") {
        if (
          plugin.events.call(sock, m, {
            sock,
            client,
            conn,
            DekuGanz,
            Func,
            config,
            Uploader,
            store,
            isAdmin,
            botAdmin,
            isPrems,
            isBanned,
          })
        )
          continue;
      }

      if (typeof plugin.before === "function") {
        if (
          plugin.before.call(sock, m, {
            sock,
            client,
            conn,
            DekuGanz,
            Func,
            config,
            Uploader,
            store,
            isAdmin,
            botAdmin,
            isPrems,
            isBanned,
          })
        )
          continue;
      }
      
      const cmd = usedPrefix
        ? m.command.toLowerCase() === plugin.command ||
          plugin?.command?.includes(m.command.toLowerCase())
        : "";
      if (cmd) {
         if (plugin.loading) {
            m.react("🕐");
         }
          if (plugin.owner && !m.isOwner) {
            return m.reply(config.messages.owner);
          }
          if (plugin.premium && !isPrems) {
            return m.reply(config.messages.premium);
          }          
          if (plugin.group && !m.isGroup) {
            return m.reply(config.messages.group);
          }
          if (plugin.private && m.isGroup) {
            return m.reply(config.messages.private);
          }
          if (plugin.admin && !isAdmin) {
            return m.reply(config.messages.admin);
          }
          if (plugin.botAdmin && !botAdmin) {
            return m.reply(config.messages.botAdmin);
          }
        if (plugin.settings) {
          if (plugin.settings.owner && !m.isOwner) {
            return m.reply(config.messages.owner);
          }
          if (plugin.settings.premium && !isPrems) {
            return m.reply(config.messages.premium);
          }          
          if (plugin.settings.group && !m.isGroup) {
            return m.reply(config.messages.group);
          }
          if (plugin.settings.private && m.isGroup) {
            return m.reply(config.messages.private);
          }
          if (plugin.settings.admin && !isAdmin) {
            return m.reply(config.messages.admin);
          }
          if (plugin.settings.botAdmin && !botAdmin) {
            return m.reply(config.messages.botAdmin);
          }
        }

        await plugin(m, {
          sock,
          client,
          conn,
          DekuGanz,
          config,
          text,
          plugins: Object.values(pg.plugins).filter((a) => a.alias),
          Func,
          Scraper,
          Uploader,
          store,
          isAdmin,
          botAdmin,
          isPrems,
          isBanned,
        })
          .then(async (a) => {
             if (plugin?.limit && plugin?.settings?.limit && !isPrems && !m.isOwner) {
                let user = db.list().user[m.sender];
                if (user.limit > plugin.limit && plugin.settings.limit) {
                   user.limit -= plugin.limit && plugin.settings.limit;
                   m.reply(
                      `💡 *Informasi:* Kamu telah menggunakan fitur limit\n> *- Limit kamu saat ini:* ${user.limit} tersisa ☘️\n> *- Catatan:* Limit akan direset pada pukul 02:00 WIB setiap harinya.`
                   );
                   if (user.limit === plugin.limit && plugin.settings.limit) {
                      m.reply(
                         `⚠️ *Peringatan:* Limit kamu sudah habis! ❌\nSilakan tunggu hingga reset pukul 02:00 WIB atau beli limit tambahan.`
                      );
                   }
                } else {
                   m.reply(
                      `⚠️ *Peringatan:* Limit kamu sudah habis! ❌\nSilakan tunggu hingga reset pukul 02:00 WIB atau beli limit tambahan.`
                  );
                }
             }
          })
        }
    } catch (error) {
      if (error.name) {
        for (let owner of config.owner) {
          let jid = await sock.onWhatsApp(owner + "@s.whatsapp.net");
          if (!jid[0].exists) continue;
          let caption = "*– 乂 *Error Terdeteksi* 📉*\n"
          caption += `> *Nama command:* ${m.command}\n`
          caption += `> *Lokasi File:* ${name}`
          caption += `\n\n${Func.jsonFormat(error)}`

          sock.sendMessage(owner + "@s.whatsapp.net", {
            text: caption
          })
        }
        m.reply("*– 乂 *Error Terdeteksi* 📉*\n !*\n> Command gagal dijalankan karena terjadi error\n> Laporan telah terkirim kepada owner kami dan akan segera di perbaiki !");
      } else {
        m.reply(Func.jsonFormat(error));
      }
    }
  }
};
