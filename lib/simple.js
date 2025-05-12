const config = require("baileys");
const fs = require("node:fs");
const crypto = require("node:crypto");
const PhoneNumber = require("awesome-phonenumber");
const axios = require("axios");
const mime = require("mime-types");
const Jimp = require("jimp");
const pino = require("pino");
const path = require("path");
const FileType = require("file-type");
const store = config.makeInMemoryStore({
  logger: pino().child({ level: "silent", stream: "store" }),
});

module.exports = (connection, store) => {
  global.ephemeral = {
    ephemeralExpiration: config.WA_DEFAULT_EPHEMERAL,
  };
  let sock = config.makeWASocket(connection);
  sock.decodeJid = (jid) => {
    if (!jid) return jid;
    if (/:\d+@/gi.test(jid)) {
      const decode = config.jidDecode(jid) || {};
      return (
        (decode.user && decode.server && decode.user + "@" + decode.server) ||
        jid
      );
    } else return jid;
  };
  if (sock.user && sock.user.id) sock.user.jid = sock.decodeJid(sock.user.id);
 sock.sendButton = async (
    jid,
    array,
    quoted,
    json = {},
  ) => {
    const result = [];

    for (const data of array) {
      if (data.type === "reply") {
        for (const pair of data.value) {
          result.push({
            buttonId: pair[1],
        buttonText: {
        displayText: pair[0]
      },
      nativeFlowInfo: {
        name: "quick_reply",
                paramsJson: JSON.stringify({
                  display_text: pair[0],
                  id: pair[1],
               }),
      },
      type: 2 
     });
        }
      } else if (data.type === "bubble") {
        for (const pair of data.value) {
          result.push({
      buttonId: pair[1],
        buttonText: {
        displayText: pair[0]
      },
        type: 1
     });
        }
      } else if (data.type === "url") {
        for (const pair of data.value) {
          result.push({
            buttonId: pair[1],
        buttonText: {
        displayText: pair[0]
      },
      nativeFlowInfo: {
        name: "cta_url",
        paramsJson: JSON.stringify({
             display_text: pair[0],
                  url: pair[1],
                  merchant_url: pair[1]
               }),
      },
      type: 2
       });
    }
      } else if (data.type === "copy") {
        for (const pair of data.value) {
          result.push({
            buttonId: pair[1],
        buttonText: {
        displayText: pair[0]
      },
      nativeFlowInfo: {
        name: "cta_copy",
                paramsJson: JSON.stringify({
                  display_text: pair[0],
                  copy_code: pair[1],
                 }),
      },
      type: 2
     });
        }
      } else if (data.type === "list") {
        let transformedData = data.value.map((item) => ({
          ...(item.headers
            ? {
                title: item.headers,
              }
            : {}),
          rows: item.rows.map((row) => ({
            header: row.headers,
            title: row.title,
            description: row.body,
            id: row.command,
          })),
        }));

        let sections = transformedData;
        const listMessage = {
          title: data.title,
          sections,
        };
        result.push({
            buttonId: 'action',
            buttonText: {
               displayText: 'ini pesan interactiveMeta'
            },
            type: 4,
      nativeFlowInfo: {
        name: "single_select",
                paramsJson: JSON.stringify(listMessage),
      },
    });
      }
    }
    return sock.sendMessage(jid, {
    ...json,
  buttons: result,
    headerType: 1,
  viewOnce: true
    }, { quoted: quoted, ...global.ephemeral });
  };
    sock.sendButtonMessage = async (
    jid,
    array,
    quoted,
    json = {},
    options = {},
  ) => {
    const result = [];

    for (const data of array) {
      if (data.type === "reply") {
        for (const pair of data.value) {
          result.push({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: pair[0],
              id: pair[1],
            }),
          });
        }
      } else if (data.type === "bubble") {
        for (const pair of data.value) {
          result.push({
      buttonId: pair[1],
        buttonText: {
        displayText: pair[0]
      },
        type: 1
     });
        }
      } else if (data.type === "url") {
        for (const pair of data.value) {
          result.push({
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: pair[0],
              url: pair[1],
              merBott_url: pair[1],
            }),
          });
        }
      } else if (data.type === "copy") {
        for (const pair of data.value) {
          result.push({
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: pair[0],
              copy_code: pair[1],
            }),
          });
        }
      } else if (data.type === "list") {
        let transformedData = data.value.map((item) => ({
          ...(item.headers
            ? {
                title: item.headers,
              }
            : {}),
          rows: item.rows.map((row) => ({
            header: row.headers,
            title: row.title,
            description: row.body,
            id: row.command,
          })),
        }));

        let sections = transformedData;
        const listMessage = {
          title: data.title,
          sections,
        };
        result.push({
           buttonId: 'action',
           buttonText: {
              displayText: 'ini pesan interactiveMeta'
          },
          type: 4,
          name: "single_select",
          buttonParamsJson: JSON.stringify(listMessage),
        });
      }
    }

    let msg;
    if (json.url) {
      let file = await sock.getFile(json.url);
      let mime = file.mime.split("/")[0];
      let mediaMessage = await config.prepareWAMessageMedia(
        {
          ...(mime === "image"
            ? {
                image: file.data,
              }
            : mime === "video"
              ? {
                  video: file.data,
                }
              : {
                  document: file.data,
                  mimetype: file.mime,
                  fileName:
                    json.filename || "NekoBot." + extension(file.mime),
                }),
        },
        {
          upload: sock.waUploadToServer,
        },
      );

      msg = config.generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage:
                config.proto.Message.InteractiveMessage.create({
                  body: config.proto.Message.InteractiveMessage.Body.create({
                    text: json.body,
                  }),
                  footer: config.proto.Message.InteractiveMessage.Footer.create(
                    {
                      text: json.footer,
                    },
                  ),
                  header: config.proto.Message.InteractiveMessage.Header.create(
                    {
                      hasMediaAttachment: true,
                      ...mediaMessage,
                    },
                  ),
                  nativeFlowMessage:
                    config.proto.Message.InteractiveMessage.NativeFlowMessage.create(
                      {
                        buttons: result,
                      },
                    ),
                  ...options,
                }),
            },
          },
        },
        {
          userJid: sock.user.jid,
          quoted,
          upload: sock.waUploadToServer,
          ...ephemeral,
        },
      );
    } else {
      msg = config.generateWAMessageFromContent(
        jid,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
              },
              interactiveMessage:
                config.proto.Message.InteractiveMessage.create({
                  body: config.proto.Message.InteractiveMessage.Body.create({
                    text: json.body,
                  }),
                  footer: config.proto.Message.InteractiveMessage.Footer.create(
                    {
                      text: json.footer,
                    },
                  ),
                  header: config.proto.Message.InteractiveMessage.Header.create(
                    {
                      hasMediaAttachment: false,
                    },
                  ),
                  nativeFlowMessage:
                    config.proto.Message.InteractiveMessage.NativeFlowMessage.create(
                      {
                        buttons:
                          result.length > 0
                            ? result
                            : [
                                {
                                  text: "",
                                },
                              ],
                      },
                    ),
                  ...options,
                }),
            },
          },
        },
        {
          userJid: sock.user.jid,
          quoted,
          upload: sock.waUploadToServer,
          ...ephemeral,
        },
      );
    }

    await sock.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
    });
    return msg;
  };
  sock.appendTextMessage = async (m, text, chatUpdate) => {
    let messages = await config.generateWAMessage(
      m.cht,
      {
        text: text,
        mentions: m.mentions,
      },
      {
        userJid: sock.user.id,
        quoted: m.quoted,
        ...ephemeral,
      },
    );
    messages.key.fromMe = config.areJidsSameUser(m.sender, sock.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.pushName;
    if (m.isGroup) messages.participant = m.sender;
    let msg = {
      ...chatUpdate,
      messages: [config.proto.WebMessageInfo.fromObject(messages)],
      type: "append",
    };
    sock.ev.emit("messages.upsert", msg);
    return m;
  };

  sock.delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  sock.getFile = async (PATH) => {
    let res, filename;
    const data = Buffer.isBuffer(PATH)
      ? PATH
      : /^data:.*?\/.*?;base64,/i.test(PATH)
        ? Buffer.from(PATH.split`,`[1], "base64")
        : /^https?:\/\//.test(PATH)
          ? (res = await axios.get(PATH, {
              responseType: "arraybuffer",
            }))
          : fs.existsSync(PATH)
            ? ((filename = PATH), fs.readFileSync(PATH))
            : typeof PATH === "string"
              ? PATH
              : Buffer.alloc(0);
    if (!Buffer.isBuffer(data.data || data))
      throw new TypeError("Result is not a buffer");
    const type = res
      ? {
          mime: res.headers["content-type"],
          ext: mime.extension(res.headers["content-type"]),
        }
      : (await FileType.fromBuffer(data)) || {
          mime: "application/bin",
          ext: ".bin",
        };

    return {
      filename,
      ...type,
      data: data.data ? data.data : data,
      deleteFile() {
        return filename && fs.promises.unlink(filename);
      },
    };
  };

  sock.sendContact = async (jid, data, quoted, options) => {
    if (!Array.isArray(data[0]) && typeof data[0] === "string") data = [data];
    let contacts = [];
    for (let [number, name] of data) {
      number = number.replace(/[^0-9]/g, "");
      let njid = number + "@s.whatsapp.net";
      let biz = (await sock.getBusinessProfile(njid).catch((_) => null)) || {};
      let vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${name.replace(/\n/g, "\\n")}
ORG:
item1.TEL;waid=${number}:${PhoneNumber("+" + number).getNumber("international")}
item1.X-ABLabel:Ponsel${
        biz.description
          ? `
item2.EMAIL;type=INTERNET:${(biz.email || "").replace(/\n/g, "\\n")}
item2.X-ABLabel:Email
PHOTO;BASE64:${((await sock.getFile(await sock.profilePictureUrl(njid)).catch((_) => ({}))) || {}).number?.toString("base64")}
X-WA-BIZ-DESCRIPTION:${(biz.description || "").replace(/\n/g, "\\n")}
X-WA-BIZ-NAME:${name.replace(/\n/g, "\\n")}
`
          : ""
      }
END:VCARD
`.trim();
      contacts.push({
        vcard,
        displayName: name,
      });
    }
    return sock.sendMessage(
      jid,
      {
        ...options,
        contacts: {
          ...options,
          displayName:
            (contacts.length >= 2
              ? `${contacts.length} kontak`
              : contacts[0].displayName) || null,
          contacts,
        },
      },
      {
        quoted: quoted,
        ...options,
        ...ephemeral,
      },
    );
    enumerable: true;
  };
  const fetchParticipants = async (...jids) => {
  let results = [];
  for (const jid of jids) {
    let { participants } = await sock.groupMetadata(jid);
    participants = participants.map(({ id }) => id);
    results = results.concat(participants);
  }
  return results;
};

   sock.reply = async(jid, teks = "", quoted = null) => {
      await sock.sendMessage(
        m.cht, {
            text: teks,
        }, {
            quoted: quoted,
        },
      );
   }

sock.sendStatus = async(jids, content) => {
  let colors = ['#7ACAA7', '#6E257E', '#5796FF', '#7E90A4', '#736769', '#57C9FF', '#25C3DC', '#FF7B6C', '#55C265', '#FF898B', '#8C6991', '#C69FCC', '#B8B226', '#EFB32F', '#AD8774', '#792139', '#C1A03F', '#8FA842', '#A52C71', '#8394CA', '#243640'];
  let fonts = [0, 1, 2, 6, 7, 8, 9, 10];
  
  const msg = await config.generateWAMessage(config.STORIES_JID, content, {
    backgroundColor: colors[Math.floor(Math.random() * colors.length)],
    textArgb: 0xffffffff,
    font: fonts[Math.floor(Math.random() * colors.length)],  
    upload: sock.waUploadToServer
  });

  let statusJidList = [];
  for(const _jid of jids) {
    if(_jid.endsWith("@g.us")) {
      for(const jid of await fetchParticipants(_jid)) {
        statusJidList.push(jid);
      }
    } else {
      statusJidList.push(_jid);
    }
  }
  statusJidList = [
    ...new Set(
      statusJidList
    )
  ];

  await sock.relayMessage(msg.key.remoteJid, msg.message, {
    messageId: msg.key.id,
    statusJidList,
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: jids.map((jid) => ({
              tag: "to",
              attrs: {
                jid
              },
              content: undefined
            }))
          }
        ]
      }
    ]
  });

  for(const jid of jids) {
    let type = (
      jid.endsWith("@g.us") ? "groupStatusMentionMessage" :
      "statusMentionMessage"
    );
    await sock.relayMessage(jid, {
      [type]: {
        message: {
          protocolMessage: {
            key: msg.key,
            type: 25
          }
        }
      }
    }, {
      userJid: sock.user.id,
      additionalNodes: [
        {
          tag: "meta",
          attrs: {
            is_status_mention: "true"
          },
          content: undefined
        }
      ]
    });
  }
  return msg;
}
  sock.getName = async (jid = "", withoutContact = false) => {
    jid = sock.decodeJid(jid);
    withoutContact = sock.withoutContact || withoutContact;
    let v;
    if (jid.endsWith("@g.us")) {
     return sock
       .groupMetadata(jid)
       .then(
         (metadata) =>
           metadata || store?.fetchGroupMetadata(jid, sock.groupMetadata),
       )
       .then((metadata) => metadata || {})
       .then(
         (metadata) =>
           metadata.name ||
           metadata.subject ||
           PhoneNumber("+" + Number(parseInt(jid))).getNumber(
             "international",
           ),
       );
    }
    if (jid.endsWith("@newsletter")) {
     return sock
       .newsletterMetadata("jid", jid)
       .then((metadata) => metadata || {})
       .then(
         (metadata) =>
           metadata.name ||
           metadata.subject ||
           PhoneNumber("+" + Number(parseInt(jid))).getNumber(
             "international",
           ),
       );
    }
    v =
      jid === "0@s.whatsapp.net"
        ? {
            jid: jid,
            vname: "WhatsApp",
          }
        : config.areJidsSameUser(jid, sock.user.id)
          ? sock.user
          : (store?.contacts[jid] || {});
      return (
         (withoutContact ? "" : v.name) ||
         v.subject ||
         v.vname ||
         v.notify ||
         v.verifiedName ||
         PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber(
            "international",
         )
      );
  };
  sock.getBuffer = async (url, options) => {
    try {
      options ? options : {};
      const res = await axios({
        method: "get",
        url,
        headers: {
          DNT: 1,
          "Upgrade-Insecure-Request": 1,
        },
        ...options,
        responseType: "arraybuffer",
      });
      return res.data;
    } catch (e) {
      console.log(`Error : ${e}`);
    }
  };
  sock.sendFile = async (
    jid,
    media,
    filename = null,
    caption = null,
    quoted = null,
    ptt = false,
    options = {},
  ) => {
    let buffer;
    let mimeType;
    let ext;
    let data = await sock.getFile(media);
    buffer = data.data;
    mimeType = data.mime || "application/octet-stream";
    ext = data.ext || ".tmp";
    let isSticker = false;
    if (data.ext === "webp") return (isSticker = true);
    if (options && options.useDocument) {
      return sock.sendMessage(
        jid,
        {
          document: buffer,
          fileName: filename || "file." + ext,
          caption: caption,
          mimetype: mimeType,
          ...options,
        },
        {
          quoted: quoted,
          ...global.ephemeral,
        },
      );
    } else if (/image/.test(mimeType) && !isSticker) {
      return sock.sendMessage(
        jid,
        {
          image: buffer,
          mimetype: mimeType,
          caption: caption,
          ...options,
        },
        {
          quoted: quoted,
          ...global.ephemeral,
        },
      );
    } else if (/video/.test(mimeType)) {
      return sock.sendMessage(
        jid,
        {
          video: buffer,
          mimetype: mimeType,
          caption: caption,
          ...options,
        },
        {
          quoted: quoted,
          ...global.ephemeral,
        },
      );
    } else if (/audio/.test(mimeType)) {
      return sock.sendMessage(
        jid,
        {
          audio: buffer,
          mimetype: mimeType,
          ...ptt,
          ...options,
        },
        {
          quoted: quoted,
          ...global.ephemeral,
        },
      );
    } else {
      return sock.sendMessage(
        jid,
        {
          document: buffer,
          fileName: filename || "file." + ext,
          mimetype: mimeType,
          caption: caption,
          ...options,
        },
        {
          quoted: quoted,
          ...global.ephemeral,
        },
      );
    }
  };
  /*
  sock.sendAlbumMessage = async (jid, array, options = {}) => {
    options = { ...options };
    
   const delay = !isNaN(options.delay) ? options.delay : 500;
    const album = config.generateWAMessageFromContent(jid, {
        messageContextInfo: {
            messageSecret: crypto.randomBytes(32)
        },
        albumMessage: {
            expectedImageCount: array.filter(a => a.hasOwnProperty("image")).length,
            expectedVideoCount: array.filter(a => a.hasOwnProperty("video")).length,
            ...(options.quoted ? {
                contextInfo: {
                    remoteJid: options.quoted.key.remoteJid,
                    fromMe: options.quoted.key.fromMe,
                    stanzaId: options.quoted.key.id,
                    participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                    quotedMessage: options.quoted.message,
                    ...(options.mentions ? { mentionedJid: options.mentions } : {})
                }
            } : {})
        }
    }, {
        userJid: sock.user.jid,
        upload: sock.waUploadToServer
    });

    await sock.relayMessage(album.key.remoteJid, album.message, {
        messageId: album.key.id
    });

    for (let content of array) {
        const img = await config.generateWAMessage(album.key.remoteJid, content, {
            ...(options.quoted ? { quoted: options.quoted } : {}),
            ...(options.mentions ? { mentions: options.mentions } : {}),
            upload: sock.waUploadToServer,
        });

        img.message.messageContextInfo = {
            messageSecret: crypto.randomBytes(32),
            messageAssociation: {
                associationType: 1,
                parentMessageKey: album.key
            }
        };

        await sock.relayMessage(img.key.remoteJid, img.message, {
            messageId: img.key.id
        });
        await config.delay(delay);
    }
    return album;
  };
  */
  sock.sendAlbumMessage = async (jid, medias, options = {}) => {
      if (typeof jid !== 'string') throw new TypeError(`jid must be string, received: ${jid} (${jid?.constructor?.name})`)
      for (const media of medias) {
         if (!media.type || (media.type !== 'image' && media.type !== 'video')) throw new TypeError(`medias[i].type must be 'image' or 'video', received: ${media.type} (${media.type?.constructor?.name})`)
         if (!media.data || (!media.data.url && !Buffer.isBuffer(media.data))) throw new TypeError(`medias[i].data must be object with url or buffer, received: ${media.data} (${media.data?.constructor?.name})`)
      }
      if (medias.length < 2) throw new RangeError('Minimum 2 media')

      const caption = options.text || options.caption || ''
      const delay = !isNaN(options.delay) ? options.delay : 500
      
      delete options.text
      delete options.caption
      delete options.delay

      const album = config.generateWAMessageFromContent(jid, {
         messageContextInfo: {
            messageSecret: new Uint8Array(crypto.randomBytes(32))
         },
         albumMessage: {
            expectedImageCount: medias.filter(media => media.type === 'image').length,
            expectedVideoCount: medias.filter(media => media.type === 'video').length,
            ...(options.quoted && options.quoted.message ? {
               contextInfo: {
                  remoteJid: options.quoted.key.remoteJid,
                  fromMe: options.quoted.key.fromMe,
                  stanzaId: options.quoted.key.id,
                  participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                  quotedMessage: options.quoted.message || ''
               }
            } : {})
         }
      }, {})

      await conn.relayMessage(album.key.remoteJid, album.message, {
         messageId: album.key.id
      })

      for (const i in medias) {
         const { type, data } = medias[i]
         const img = await config.generateWAMessage(album.key.remoteJid, { [type]: data, ...(i === '0' ? { caption } : {}) }, { upload: conn.waUploadToServer }).catch(err => {
            console.log('Error saat generateWAMessage:', err)
            return null
         })

         if (!img || !img.message) {
            console.log('Gagal membuat pesan gambar/video, lewati ke media berikutnya')
            continue
         }

         img.message.messageContextInfo = {
            messageSecret: new Uint8Array(crypto.randomBytes(32)),
            messageAssociation: {
               associationType: 1,
               parentMessageKey: album.key
            }
         }

         await conn.relayMessage(img.key.remoteJid, img.message, {
            messageId: img.key.id
         })

         await sock.delay(delay)
      }

      return album
   }
    (sock.reply = (jid, text = "", quoted, options) => {
      return Buffer.isBuffer(text)
        ? conn.sendFile(jid, text, "file", "", quoted, false, options)
        : conn.sendMessage(
            jid,
            { ...options, text, mentions: conn.parseMention(text) },
            {
              quoted,
              ...options,
              mentions: conn.parseMention(text),
              ...ephemeral,
            },
          );
    });
  sock.resize = async (image, width, height) => {
    let oyy = await Jimp.read(image);
    let kiyomasa = await oyy
      .resize(width, height)
      .getBufferAsync(Jimp.MIME_JPEG);
    return kiyomasa;
  };
  sock.cMod = (
    jid,
    message,
    text = "",
    sender = sock.user.jid,
    options = {},
  ) => {
    let copy = message;
    delete copy.message.messageContextInfo;
    delete copy.message.senderKeyDistributionMessage;
    let mtype = Object.keys(copy.message)?.[0];
    let isEphemeral = false;
    if (isEphemeral) {
      mtype = Object.keys(copy.message.ephemeralMessage.message)[0];
    }
    let msg = isEphemeral
      ? copy.message.ephemeralMessage.message
      : copy.message;
    let content = msg[mtype];
    if (typeof content === "string") msg[mtype] = text || content;
    else if (content.caption) content.caption = text || content.caption;
    else if (content.text) content.text = text || content.text;
    if (typeof content !== "string")
      msg[mtype] = {
        ...content,
        ...options,
      };
    if (copy.participant)
      sender = copy.participant = sender || copy.participant;
    else if (copy.key.participant)
      sender = copy.key.participant = sender || copy.key.participant;
    if (copy.key.remoteJid.includes("@s.whatsapp.net"))
      sender = sender || copy.key.remoteJid;
    else if (copy.key.remoteJid.includes("@broadcast"))
      sender = sender || copy.key.remoteJid;
    copy.key.remoteJid = jid;
    copy.key.fromMe = config.areJidsSameUser(sender, sock.user.id) || false;
    return config.proto.WebMessageInfo.fromObject(copy);
  };
  sock.copyNForward = async (
    jid,
    message,
    forwardingScore = true,
    quoted,
    options = {},
  ) => {
    let m = config.generateForwardMessageContent(message, !!forwardingScore);
    let mtype = Object.keys(m)[0];
    if (
      forwardingScore &&
      typeof forwardingScore == "number" &&
      forwardingScore > 1
    )
      m[mtype].contextInfo.forwardingScore += forwardingScore;
    m = config.generateWAMessageFromContent(jid, m, {
      ...options,
      userJid: sock.user.id,
      quoted,
    });
    await sock.relayMessage(jid, m.message, {
      messageId: m.key.id,
      additionalAttributes: {
        ...options,
      },
    });
    return m;
  };

  sock.downloadM = async (m, type, saveToFile) => {
    if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
    const stream = await config.downloadContentFromMessage(m, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    if (saveToFile) var { filename } = await sock.getFile(buffer, true);
    return saveToFile && fs.existsSync(filename) ? filename : buffer;
  };

  sock.parseMention = (text = "") => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
      (v) => v[1] + "@s.whatsapp.net",
    );
  };

  sock.setBio = async (status) => {
    return await sock.query({
      tag: "iq",
      attrs: {
        to: "s.whatsapp.net",
        type: "set",
        xmlns: "status",
      },
      content: [
        {
          tag: "status",
          attrs: {},
          content: Buffer.from(status, "utf-8"),
        },
      ],
    });
    // <iq to="s.whatsapp.net" type="set" xmlns="status" id="21168.6213-69"><status>"Hai, saya menggunakan WhatsApp"</status></iq>
  };

  sock.serializeM = (m) => {
    return require("./serialize")(m, sock, store);
  };

  Object.defineProperty(sock, "name", {
    value: "WASocket",
    configurable: true,
  });

  return sock;
};
