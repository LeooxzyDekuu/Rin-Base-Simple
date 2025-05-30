/**
 *  ═══🗡️≪ DEMON CORE ≫🗡️═══
 *  @ Scrape: [Spotify]
 *  @ Creator: [Dxyz - Putra]
 *  @ Name Bot: [Rin-Okumura]
 *  @ Link Ch: [ https://whatsapp.com/channel/0029Vb6Q4eA1Hsq5qeBu0G1z ]
 *  @ Note: [Not Hapus Wm]
 *  ═══🔥≪ 業火 ≫🔥═══
 **/

const axios = require("axios");

const client_id = "acc6302297e040aeb6e4ac1fbdfd62c3";
const client_secret = "0e8439a1280a43aba9a5bc0a16f3f009";
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

async function spotifyCreds() {
    try {
        const response = await axios.post(
            TOKEN_ENDPOINT,
            "grant_type=client_credentials", {
                headers: {
                    Authorization: "Basic " + basic
                },
            },
        );
        return {
            status: true,
            data: response.data,
        };
    } catch (error) {
        return {
            status: false,
            msg: "Failed to retrieve Spotify credentials."
        };
    }
}

const toTime = (ms) => {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
};

class Spotify {
    search = async (query, type = "track", limit = 20) => {
        try {
            const creds = await spotifyCreds();
            if (!creds.status) return creds;

            const response = await axios.get(
                `https://api.spotify.com/v1/search?query=${encodeURIComponent(query)}&type=${type}&offset=0&limit=${limit}`, {
                    headers: {
                        Authorization: "Bearer " + creds.data.access_token
                    },
                },
            );

            if (
                !response.data[type + "s"] ||
                !response.data[type + "s"].items.length
            ) {
                return {
                    msg: "Music not found!"
                };
            }

            return response.data[type + "s"].items.map((item) => ({
                title: item.name,
                id: item.id,
                duration: toTime(item.duration_ms),
                artist: item.artists.map((artist) => artist.name).join(" & "),
                url: item.external_urls.spotify,
            }));
        } catch (error) {
            return {
                status: false,
                msg: "Error searching for music. " + error.message,
            };
        }
    };

    download = async function spotifydown(url) {
        if (!/open.spotify.com/.test(url)) return new Error("Input Url from Spotify !")
        const result = {
            status: false,
            success: 500,
            metadata: {},
            download: ''
        }
        
        return new Promise(async (resolve, reject) => {
            await axios.get('https://spotifyapi.caliphdev.com/api/info/track', { params: { url: url } }).then(async (metadata) => {
                result.status = true || false;
                result.success = 200 || 500;
                result.metadata = metadata.data || {};
                result.download = `https://spotifyapi.caliphdev.com/api/download/track?url=${metadata.data.url}`;
            });
            
            resolve(result);
        }).catch((e) => {
            reject({
                msg: 'Error Gagal Di Download'
            })
        })
    };
}

module.exports = new Spotify();
