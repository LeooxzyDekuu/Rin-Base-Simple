// Versi Commonjs

const fs = require("node:fs");
const Crypto = require("crypto");
const ff = require("fluent-ffmpeg");
const webp = require("node-webpmux");
const path = require("path");

const temp = process.platform === "win32" ? process.env.TEMP : "/tmp";

async function mp4ToMp3(media) {
  // Validasi input
  if (!media?.data) {
    throw new Error("Data media tidak ditemukan");
  }

  // Buat nama file temporary unik
  const tmpFileIn = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`
  );
  const tmpFileOut = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`
  );

  // Tulis data media ke file temporary
  fs.writeFileSync(tmpFileIn, media.data);

  try {
    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
        .noVideo() // Hanya audio
        .audioCodec('libmp3lame') // Codec MP3
        .audioBitrate('192k') // Bitrate 192kbps (bisa disesuaikan)
        .audioChannels(2) // Stereo
        .audioFrequency(44100) // Sample rate 44.1kHz
        .on("error", reject)
        .on("end", () => resolve(true))
        .save(tmpFileOut);
    });

    // Bersihkan file temporary input
    fs.promises.unlink(tmpFileIn);
    
    // Baca file output
    const buff = fs.readFileSync(tmpFileOut);
    
    // Bersihkan file temporary output
    fs.promises.unlink(tmpFileOut);

    return {
      data: buff,
      ext: 'mp3'
    };
  } catch (e) {
    // Pastikan file temporary dihapus jika terjadi error
    fs.existsSync(tmpFileIn) && await fs.promises.unlink(tmpFileIn);
    fs.existsSync(tmpFileOut) && await fs.promises.unlink(tmpFileOut);
    throw e;
  }
}

async function mediaToWebp(media) {
  // Validasi input
  if (!media?.data) {
    throw new Error("Data media tidak ditemukan");
  }

  // Buat nama file temporary unik
  const ext = media.ext?.toLowerCase() === 'gif' ? 'gif' : 'mp4';
  const tmpFileIn = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`
  );
  const tmpFileOut = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );

  // Tulis data media ke file temporary
  fs.writeFileSync(tmpFileIn, media.data);

  try {
    await new Promise((resolve, reject) => {
      const command = ff(tmpFileIn)
        .on("error", reject)
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vcodec", "libwebp",
          "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=000000[p];[b][p]paletteuse",
          "-loop", "0",
          "-lossless", "0",
          "-compression_level", "6",
          "-qscale", "75",
          "-preset", "default",
          "-an",
          "-vsync", "0"
        ]);

      // Tambahan opsi khusus untuk MP4
      if (ext === 'mp4') {
        command.addOutputOptions([
          "-ss", "00:00:00",
          "-t", "00:00:05"
        ]);
      }

      command.toFormat("webp").save(tmpFileOut);
    });

    // Bersihkan file temporary
    fs.promises.unlink(tmpFileIn);
    const buff = fs.readFileSync(tmpFileOut);
    fs.promises.unlink(tmpFileOut);

    return buff;
  } catch (e) {
    // Pastikan file temporary dihapus jika terjadi error
    fs.existsSync(tmpFileIn) && await fs.promises.unlink(tmpFileIn);
    fs.existsSync(tmpFileOut) && await fs.promises.unlink(tmpFileOut);
    throw e;
  }
};

module.exports = {
  mp4ToMp3,
  mediaToWebp,
};

/*
// Versi Esm
import fs from "node:fs";
import Crypto from "crypto";
import ff = from "fluent-ffmpeg";
import webp from "node-webpmux";
import path from "path";

const temp = process.platform === "win32" ? process.env.TEMP : "/tmp";

async function mp4ToMp3(media) {
  // Validasi input
  if (!media?.data) {
    throw new Error("Data media tidak ditemukan");
  }

  // Buat nama file temporary unik
  const tmpFileIn = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`
  );
  const tmpFileOut = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp3`
  );

  // Tulis data media ke file temporary
  fs.writeFileSync(tmpFileIn, media.data);

  try {
    await new Promise((resolve, reject) => {
      ff(tmpFileIn)
        .noVideo() // Hanya audio
        .audioCodec('libmp3lame') // Codec MP3
        .audioBitrate('192k') // Bitrate 192kbps (bisa disesuaikan)
        .audioChannels(2) // Stereo
        .audioFrequency(44100) // Sample rate 44.1kHz
        .on("error", reject)
        .on("end", () => resolve(true))
        .save(tmpFileOut);
    });

    // Bersihkan file temporary input
    fs.promises.unlink(tmpFileIn);
    
    // Baca file output
    const buff = fs.readFileSync(tmpFileOut);
    
    // Bersihkan file temporary output
    fs.promises.unlink(tmpFileOut);

    return {
      data: buff,
      ext: 'mp3'
    };
  } catch (e) {
    // Pastikan file temporary dihapus jika terjadi error
    fs.existsSync(tmpFileIn) && await fs.promises.unlink(tmpFileIn);
    fs.existsSync(tmpFileOut) && await fs.promises.unlink(tmpFileOut);
    throw e;
  }
}

async function mediaToWebp(media) {
  // Validasi input
  if (!media?.data) {
    throw new Error("Data media tidak ditemukan");
  }

  // Buat nama file temporary unik
  const ext = media.ext?.toLowerCase() === 'gif' ? 'gif' : 'mp4';
  const tmpFileIn = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`
  );
  const tmpFileOut = path.join(
    temp,
    `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`
  );

  // Tulis data media ke file temporary
  fs.writeFileSync(tmpFileIn, media.data);

  try {
    await new Promise((resolve, reject) => {
      const command = ff(tmpFileIn)
        .on("error", reject)
        .on("end", () => resolve(true))
        .addOutputOptions([
          "-vcodec", "libwebp",
          "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=000000[p];[b][p]paletteuse",
          "-loop", "0",
          "-lossless", "0",
          "-compression_level", "6",
          "-qscale", "75",
          "-preset", "default",
          "-an",
          "-vsync", "0"
        ]);

      // Tambahan opsi khusus untuk MP4
      if (ext === 'mp4') {
        command.addOutputOptions([
          "-ss", "00:00:00",
          "-t", "00:00:05"
        ]);
      }

      command.toFormat("webp").save(tmpFileOut);
    });

    // Bersihkan file temporary
    fs.promises.unlink(tmpFileIn);
    const buff = fs.readFileSync(tmpFileOut);
    fs.promises.unlink(tmpFileOut);

    return buff;
  } catch (e) {
    // Pastikan file temporary dihapus jika terjadi error
    fs.existsSync(tmpFileIn) && await fs.promises.unlink(tmpFileIn);
    fs.existsSync(tmpFileOut) && await fs.promises.unlink(tmpFileOut);
    throw e;
  }
};

module.exports = {
  mp4ToMp3,
  mediaToWebp,
};
*/
