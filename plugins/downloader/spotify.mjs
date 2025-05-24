// 🔥® Rin-Okumura™ 🔥
// 👿 Creator: Dxyz
// ⚡ Plugin: downloader/spotify.mjs

import axios from 'axios';
import fs from 'fs';
let outputPath = `./tmp/spotify-${Date.now()}.mp3`

let handler = async (m, {
    conn,
    Func,
    Scraper,
    text
}) => {
    if (!text) throw '⚠️ Masukan Link/Query !'
    if (Func.isUrl(text)) {
        if (!/open.spotify.com/.test(text)) throw '⚠️Mana Link Spotify Nya !';
        const {
            metadata: detail
        } = await Scraper.spotify.download(text);

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
        ctx.reply(m.chat, caption, m);
        const {
            download: spdl
        } = await Scraper.spotify.download(detail.link);
        const media = await axios.get(spdl, {
            responseType: 'arraybuffer'
        });
        await fs.writeFileSync(outputPath, media.data);
        let audio = await fs.readFileSync(outputPath);

        conn.sendMessage(m.chat, {
            audio: Buffer.from(audio),
            mimetype: 'audio/mpeg'
        }, {
            quoted: m
        });
        await conn.delay(200);
        await fs.unlinkSync(outputPath);
    } else {
        const search = await Scraper.spotify.search(text);
        if (!search && !search.length > 0) throw '⚠️ Maaf Lagu Yg Anda Search Tidak Di Temukan';

        let message = `╭────────────────────────────╮
│ 🔥 RIN'S SPOTIFY PICKS     │
├──┬─────────────────────────┤\n`;
        message += search.map((a, i) => `│ [${i + 1}] │ ${a.title} - ${a.artist}           
│  │ 🔗 ${a.url}
├──┴─────────────────────────┤`).join("\n");
        message += `\n│ (ง🔥Д🔥)ง︻デ═一 [search.length/50]       
│ "Hurry up!" - Rin          
╰────────────────────────────╯`
        await conn.sendAliasMessage(m.chat, {
            text: message
        }, search.map((a, i) => ({
            alias: `${i + 1}`,
            response: `${m.prefix + m.command} ${a.url}`
        })), m);
    }
};

handler.help = ["spotify", "spdl"].map(v => v + ' *[ Download/Search Lagu ]* ');
handler.tags = ["downloader", "internet"];
handler.command = ["spotify", "spdl"];
handler.limit = true;
handler.loading = true;

export default handler;
