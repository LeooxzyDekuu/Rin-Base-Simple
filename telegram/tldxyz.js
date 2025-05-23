const yts = require("yt-search");
const config = require("@configuration");
const { Markup } = require("telegraf");
const chalk = require("chalk");
const logger = require("./library/logger.js");
const cloudKu = require("cloudku-uploader");
const pkg = require("./library/case");
const Case = new pkg(process.cwd() + "/telegram/tldxyz.js");

module.exports = async (bot, ctx) => {
    const m = ctx.message;
    if (!m) return;

    const text = m.text || "";
    const body = text.trim();
    const prefix = "/";
    const isCommand = body.startsWith(prefix);
    const command = isCommand ? body.slice(1).split(" ")[0].toLowerCase() : "";
    const args = body.split(" ").slice(1).join(" ");
    const Scraper = scraper.list();
    const isOwner = config.telegram.owner_id;

    await logger(ctx);

    switch (command) {
        case "start":
        case "help":
        case "menu": {
            const caption = `Hai Aku Rin Okumura Dan Aku Asisten Bot Di Sini :v

Fitur:
${Case.list().map((a, i) => `${prefix + a}`).join("\n")}

Masih Lengkap Tapi Mau Bagaimana Lagi Ini Versi Simple Case :v`;
            await ctx.replyWithMarkdown(caption, Markup.keyboard([
                ["/help", "/ping"],
                ["/owner"]
            ]).resize());
            }
            break;
        case "ping": {
            await ctx.reply("Pong!");
            }
            break;

        case "play": {
             if (!args) return ctx.reply("Kirim judul lagu.");
             await ctx.reply(`Mencari lagu: ${args}`);

              try {
                  const query = await yts(args);
                  const {
                      downloadUrl,
                      title
                  } = await Scraper.ddownr.download(query.all[0].url, "mp3");
                  const result = await Scraper.googleYoutube(query.all[0].url);

                  const caption = `📁 Download YouTube
• *Title:* ${result.title || ""}
• *Id:* ${result.videoId || ""}
• *Ago:* ${result.metadata.ago || ""}
• *Author:* ${result.author.channelTitle || ""}
• *Url:* ${result.url || ""}

👁️${result.metadata.view || ""} | 💙${result.metadata.like || ""} | 💬${result.metadata.comment || ""}`;

                  await ctx.replyWithPhoto(result.thumbnail, {
                      caption
                  });
                  await ctx.replyWithAudio(downloadUrl, {
                      caption,
                      title,
                      performer: config.name
                  });
              } catch (error) {
                  console.error("Play error:", error);
                  await ctx.reply("Gagal memproses permintaan.");
              }
            }
            break;

        case "ytmp3":
        case "yta": {
            if (!args.includes("youtu")) return ctx.reply("Kirim link Yt.");
            await ctx.reply(`Download Lagu: ${args}`);

            try {
                const {
                    downloadUrl,
                    title
                } = await Scraper.ddownr.download(args, "mp3");
                const result = await Scraper.googleYoutube(args);

                const caption = `📁 Download YouTube
• *Title:* ${result.title || ""}
• *Id:* ${result.videoId || ""}
• *Ago:* ${result.metadata.ago || ""}
• *Author:* ${result.author.channelTitle || ""}
• *Url:* ${result.url || ""}

👁️${result.metadata.view || ""} | 💙${result.metadata.like || ""} | 💬${result.metadata.comment || ""}`;

                await ctx.replyWithPhoto(result.thumbnail, {
                    caption
                });
                await ctx.replyWithAudio(downloadUrl, {
                    caption,
                    title,
                    performer: config.name
                });
              } catch (error) {
                  console.error("Play error:", error);
                  await ctx.reply("Gagal memproses permintaan.");
              }
            }
            break;

        case "ytmp4":
        case "ytv": {
            if (!args.includes("youtu")) return ctx.reply("Kirim Link Yt.");
            await ctx.reply(`Download Video: ${args}`);
            const [url, resolusi] = args.split(" ");

            try {
                const {
                    downloadUrl,
                    title
                } = await Scraper.ddownr.download(url, resolusi);
                const result = await Scraper.googleYoutube(url);

                const caption = `📁 Download YouTube
• *Title:* ${result.title || ""}
• *Id:* ${result.videoId || ""}
• *Ago:* ${result.metadata.ago || ""}
• *Author:* ${result.author.channelTitle || ""}
• *Url:* ${result.url || ""}

👁️${result.metadata.view || ""} | 💙${result.metadata.like || ""} | 💬${result.metadata.comment || ""}`;

                await ctx.replyWithPhoto(result.thumbnail, {
                    caption
                });
                await ctx.replyWithAudio(downloadUrl, {
                    caption,
                    title,
                    performer: config.name
                });
              } catch (error) {
                  console.error("Play error:", error);
                  await ctx.reply("Gagal memproses permintaan.");
              }
            }
            break;

        case "owner": {
             try {
                 for (let num of config.telegram.owner) {
                     await ctx.replyWithContact(
                          "+" + num,
                         config.ownername2, {
                             last_name: "",
                             caption: "Nih Owner Saya !"
                         }
                     );
                 }
              } catch (error) {
                  console.error("Owner error:", error);
                  await ctx.reply("Gagal mengirim kontak owner.");
              }
            }
            break;

        case "restart": {
              if (String(ctx.from.id) !== String(isOwner)) {
                  await ctx.reply("Kamu tidak memiliki izin untuk me-restart bot.");
              }

              await ctx.reply("Bot sedang di-restart...");
              setTimeout(() => {
                 process.exit(0);
              }, 1000);
            }
            break;

        case "cekid": {
            ctx.reply(`${m.from.id}`);
            }
            break;

        case "tourl": {
              if (!ctx.message.reply_to_message) {
                  return ctx.reply("⚠️ Balas pesan yang berisi file dengan command /tourl");
              }

              const repliedMsg = ctx.message.reply_to_message;
              let fileId, fileName, fileType;

              if (repliedMsg.photo) {
                  fileId = repliedMsg.photo[repliedMsg.photo.length - 1].file_id;
                  fileName = `photo_${Date.now()}.jpg`;
                  fileType = "image";
              } else if (repliedMsg.document) {
                  fileId = repliedMsg.document.file_id;
                  fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
                  fileType = "document";
              } else if (repliedMsg.audio) {
                  fileId = repliedMsg.audio.file_id;
                  fileName = repliedMsg.audio.file_name || `audio_${Date.now()}.mp3`;
                  fileType = "audio";
              } else if (repliedMsg.video) {
                  fileId = repliedMsg.video.file_id;
                  fileName = repliedMsg.video.file_name || `video_${Date.now()}.mp4`;
                  fileType = "video";
              } else {
                 return ctx.reply("🚫 Jenis file tidak didukung");
              }

              try {
                  const fileLink = await ctx.telegram.getFileLink(fileId);
                  const response = await axios.get(fileLink, {
                     responseType: "stream"
                  });

                  const result = await cloudKu(response.data);

                  ctx.replyWithHTML(`
<b>✅ Upload Berhasil!</b>

📄 <b>File:</b> ${result.result.filename}
📦 <b>Tipe:</b> ${result.result.type}
📏 <b>Ukuran:</b> ${result.result.size}
🔗 <b>URL:</b> ${result.result.url}`);
              } catch (error) {
                  console.error("Upload error:", error);
                  ctx.reply("❌ Gagal mengupload file");
              }
            }
            break;

    default:
    if (isCommand) {
        await ctx.reply("Perintah tidak dikenal.");
    }
  }
};

let file = __filename;
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.green(`[ CHANGE ] "${file}" updated. Reloading...`));
});
