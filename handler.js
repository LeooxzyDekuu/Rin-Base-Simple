/**
 *  ═══🗡️≪ DEMON CORE ≫🗡️═══
 *  @ Filr: [handler.js]
 *  @ Creator: [Dxyz - Putra]
 *  @ Name Bot: [Rin-Okumura]
 *  ═══🔥≪ 業火 ≫🔥═══
**/

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
    const client = ctx = conn = DekuGanz = sock;
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

    if (m.isGroup) {
        db.list().group[m.cht].totalpesan[m.sender] = db.list().group[m.cht].totalpesan[m.sender] || {
            member: m.sender,
            chat: 0
        };
        db.list().group[m.cht].totalpesan[m.sender].chat += 1;
    }

    if (Object.keys(store.groupMetadata).length === 0) {
        store.groupMetadata = await sock.groupFetchAllParticipating();
    }

    const reactram = ['🪩', '🫩', '😂', '🔥', '💙', '🌷', '🌃', '🔮'];
    const reactt = reactram[Math.floor(Math.random() * reactram.length)];
    const participant = (m.isGroup ? m.metadata.participants : []) || [];
    const isPrems = db.list().user[m.sender].premium.status;
    const isBanned = db.list().user[m.sender].banned.status;
    const isAdmin = m.isAdmin;
    const botAdmin = m.isBotAdmin;
    const Scraper = await scraper.list();
    const isPrefix = config.prefix.includes(m.prefix);
    const usedPrefix = m.prefix;
    const quoted = m.isQuoted ? m.quoted : m;
    const command = m.command;
    const text = m.text;
    const isCmd = m.prefix && isPrefix;
    if (!m.isGroup && db.list().settings.onlygrub && !m.isOwner) {
        if (isCmd) return m.reply({
            text: `Sorry Bre Ini Only Gc Link Gc:\n\n${config.wagc.map((a, i) => `${i + 1 + ','} ${a}`).join(`\n`)}`
        })
    }

    if (m.isOwner) {
        db.list().user[m.sender].limit = 100
    }
    if (isPrems) {
        db.list().user[m.sender].limit = 99999;
    }

    if (isCmd) {
        db.list().user[m.sender].rpg.exp += Math.floor(Math.random() * 20) + 1;

    }
    /*"
      if (isCmd) {
          const extra = {
              sock,
              client,
              ctx,
              conn,
              DekuGanz,
              usedPrefix,
              quoted,
              command,
              config,
              text,
              Func,
              Scraper,
              Uploader,
              store,
              isAdmin,
              botAdmin,
              isPrems,
              isBanned,
          };
          await require('./case/case-cjs.js')(m, extra);
          const filename = './case/case-mjs.mjs';
          await (await import(`${filename}`)).default(m, extra);
      };
    **/

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
                        ctx,
                        conn,
                        DekuGanz,
                        usedPrefix,
                        command,
                        quoted,
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
                        ctx,
                        conn,
                        DekuGanz,
                        usedPrefix,
                        command,
                        quoted,
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

            let cmdd;
            try {
                cmdd = await plugin.command.includes(m.command.toLowerCase())
            } catch (e) {
              try {
                cmdd = await plugin.command.test(m.command)
              } catch (e) {
                cmdd = null
              }
            };

            const cmd = isPrefix ?
                (plugin.command && cmdd) :
                "";
            if (cmd) {
                if (plugin.loading) {
                    m.react(reactt);
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

                await plugin(m, {
                        sock,
                        client,
                        ctx,
                        conn,
                        DekuGanz,
                        usedPrefix,
                        command,
                        config,
                        text,
                        plugins: Object.values(pg.plugins).filter((a) => a.command),
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
                        if (plugin?.limit && !isPrems && !m.isOwner) {
                            let user = db.list().user[m.sender];
                            if (user.limit > plugin.limit) {
                                user.limit -= plugin.limit;
                                ctx.reply(
                                    m.chat,
                                    `⚡━━━━━━━━━━━━━━━━━━━⚡
  👹 *LIMIT DEMONIC* 👹
⚡━━━━━━━━━━━━━━━━━━━⚡

🗡️ Limit kamu: ${user.limit} tersisa 
⏳ Reset: 02:00 WIB
"Jangan habiskan kekuatan iblismu!" - Rin
⚡━━━━━━━━━━━━━━━━━━━⚡`,
                                    m
                                );
                                if (user.limit === plugin.limit) {
                                    ctx.reply(
                                        m.chat,
                                        `💢━━━━ *FINAL WARNING* ━━━━💢
👹 *Limit terakhir!* Hanya ${user.limit} tersisa!
⏱️ Tunggu reset 02:00 WIB
"Kau menguji kesabaranku!" - Rin`,
                                        m
                                    );
                                }
                            } else {
                                ctx.reply(
                                    m.chat,
                                    `🔥━━━━ *LIMIT HABIS* ━━━━🔥
⚔️ Tidak bisa menggunakan fitur!
⏳ Reset otomatis 02:00 WIB
"Pulang saja kau, manusia!" - Rin`,
                                    m
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
