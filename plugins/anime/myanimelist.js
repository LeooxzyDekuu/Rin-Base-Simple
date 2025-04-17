// © HanakoBotz
// • By: Leooxzy - Deku
// • Owner: 6283136099660

// By: Leooxzy
// Bio cr: Krz

module.exports = {
    help: ["myanimelist", "mal"].map(v => v + ' *[ Search/Detail, Anime/Manga/Karakter ]* '),
    tags: ["anime"],
    command: ["myanimelist", "mal"],
    loading: true,
    limit: true,
    code: async (m, {
        conn,
        text,
        Scraper,
        Func
    }) => {
        let message = `⚠️Masukan Nama Anime
Contoh: ${m.prefix + m.command} blue exorcist

\`[ Type ]\`
Manga
${m.prefix + m.command} blue exorcist --manga
${m.prefix + m.command} https://myanimelist.net/manga/13492/Ao_no_Exorcist

\`[ Character ]\`
${m.prefix + m.command} okumura, rin --character
${m.prefix + m.command} https://myanimelist.net/character/24482/Rin_Okumura`

        if (!text) return m.reply(message);
        const isManga = m.args.includes('--manga');
        const isCharacter = m.args.includes('--character');
        let input = text.replace(/--\w+(\=\w+)?/g, "").trim();

        if (isManga) {
            Scraper.mal.MalSearchManga(input).then(async (a) => {
                if (!a.length > 0) throw '⚠️ Pencarian Anda Tidak Di Temukan';
                let caption = `🔍 Search Manga\n\n${a.map((v, i) => `\`[ ${i + 1} ]\`\n> • Title: ${v.title || ''}\n> • Type: ${v.type || ''}\n> • Vol: ${v.vol || ''}\n> • Score: ${v.score || ''}\n> • Url: ${v.link || ''}`).join("\n\n")}`;
                await conn.sendAliasMessage(m.chat, {
                    text: caption
                }, a.map((v, i) => ({
                    alias: `${i + 1}`,
                    response: `${m.prefix + m.command} ${v.link}`
                })), m);
            });
        } else if (isCharacter) {
            let input = text.replace(/--\w+(\=\w+)?/g, "").trim();
            Scraper.mal.MalSearchCharacter(input).then(async (a) => {
                let caption = `🔍Search Character\n\n`;
                caption += a.map((v, i) => `\`[ ${i + 1} ]\`\n> • *Nama:* ${v.name || ''}\n> • *Alias:* ${v.alias || ''}\n> • *Anime:* ${v.anime || ''}\n> • *Manga:* ${v.manga || ''}\n> • *Url:* ${v.url || ''}`).join("\n\n");
                await conn.sendAliasMessage(m.chat, {
                    text: caption
                }, a.map((v, i) => ({
                    alias: `${i + 1}`,
                    response: `${m.prefix + m.command} ${v.url}`
                })), m);
            })
        } else if (Func.isUrl(text)) {
            if (/myanimelist\.net\/manga\//.test(text)) {
                if (!/myanimelist\.net\/manga\//.test(text)) return m.reply('⚠️ Mana Link Nya Buat Liat Manga !');
                Scraper.mal.MalMangaInfo(text).then(async (a) => {
                    let caption = `📒Detail Manga\n`;
                    caption += `> • *Title:* ${a.title || ''}\n`;
                    caption += `> • *Synops:*\n${a.synops || ''}\n`;
                    caption += `> • *Score:* ${a.score || ''}\n`;
                    caption += `> • *Character:*\n`;
                    caption += a.character.map(v => `> • *Name:* ${v.name || ''}\n> • *Role:* ${v.role || ''}\n> • *Link:* ${v.link || ''}`).join("\n\n");
                    m.reply(caption);
                });
            } else if (/https:\/\/myanimelist\.net\/character\//.test(text)) {
                if (!/https:\/\/myanimelist\.net\/character\//.test(text)) return m.reply('⚠️ Mana Link Character Nya !')
                const match = text.match(/https:\/\/myanimelist\.net\/character\/(\d+)(?:\/[^/]+)?/);
                const characterId = match[1];
                const character = await fetch('https://api.jikan.moe/v4/characters/' + characterId).then(a => a.json());
                if (!character) return m.reply('⚠️ Maaf Character Yg Anda Cari Tidak Di Temukan');
                const message = `📒Detail Character
> • *Name:* ${character.data.name || ''}
> • *Name Jepang:* ${character.data.name_kanji || ''}
> • *Nickname:*
${character.data.nicknames.map(a => `${a}`).join("\n") || ''}
> • *Id:* ${character.data.mal_id || ''}
> • *Favorite:* ${character.data.favorites || ''}
> • *About:*
${character.data.about || ''}
> • *Url:* ${character.data.url || ''}`;
                await conn.sendMessage(m.chat, {
                    image: {
                        url: character.data.images.jpg.image_url
                    },
                    caption: message
                }, {
                    quoted: m
                });
            }
        } else {
            Scraper.mal.MalSearchAnime(text).then(async (a) => {
                if (!a.length > 0) throw '⚠️ Pencarian Anda Tidak Di Temukan';
                let caption = `🔍 Search Anime\n\n${a.map((v, i) => `\`[ ${i + 1} ]\`\n> • Title: ${v.title || ''}\n> • Type: ${v.type || ''}\n> • Score: ${v.score || ''}\n> • Url: ${v.url || ''}`).join("\n\n")}`;
                m.reply(caption);
            });
        }
    },
};
