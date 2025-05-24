const axios = require("axios");
const fs = require("fs");
const config = require("@configuration");

module.exports = async function handleSpotifyReply(ctx) {
    global.scraper = new (await require(process.cwd() + "/scrapers"))(process.cwd() + "/scrapers/src");
    await scraper.watch();
    await scraper.load();
    setInterval(async () => {
      await scraper.load();
    }, 2000);
    const Scraper = scraper.list();
    const replyMsg = ctx.message?.reply_to_message;
    const text = ctx.message?.text;
    const userId = ctx.from?.id;

    if (!replyMsg || !text || isNaN(text)) return;

    const messageId = replyMsg.message_id;
    const store = global.spotifyReplyStore?.[messageId];

    if (!store || store.user_id !== userId) return;

    const selectedIndex = parseInt(text.trim());
    if (selectedIndex < 1 || selectedIndex > store.results.length) {
        return ctx.reply("⚠️ Nomor tidak valid. Pilih antara 1 sampai 5.");
    }

    const selected = store.results[selectedIndex - 1];
    await ctx.reply(`📥 Mendownload: ${selected.title} - ${selected.artist}`);

    try {
        const { metadata: detail, download: spdlUrl } = await Scraper.spotify.download(selected.url);
        const outputPath = `./tmp/spotify-${Date.now()}.mp3`;

        const caption = `╭───────────────────────────────╮
│  🔥 RIN'S SPOTIFY DOWNLOADER  │
├───────────────────────────────┤
│ 🎵 ${detail.title || ''}               │
│ 🎤 ${detail.artist || ''}          │
│ 💿 ${detail.album || ''} │
│ 🔗 ${detail.url || ''} │
├───────────────────────────────┤
│ 🗡️ (•̀ᴗ•́)و ︻デ═一            │
│ 📥 Downloading...              │
│ 💽 Format: MP3               │
╰───────────────────────────────╯
"Not bad... for human music." - Rin Okumura`;

        await ctx.reply(caption);

        const response = await axios.get(spdlUrl, { responseType: "arraybuffer" });
        await fs.promises.writeFile(outputPath, response.data);

        await ctx.replyWithAudio({
            source: fs.createReadStream(outputPath),
            filename: detail.title + ".mp3"
        }, {
            title: detail.title,
            performer: config.name,
        });

        await fs.promises.unlink(outputPath);
    } catch (err) {
        console.error("Spotify download error:", err);
        await ctx.reply("❌ Gagal memproses lagu.");
    }

    delete global.spotifyReplyStore[messageId];
};
