const util = require('util');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);
const config = require('@configuration');
const logger = require('./library/logger.js');

module.exports = async (bot, ctx) => {
  const m = ctx.message;
  const raw = m?.text?.trim();
  if (!raw) return;

  await logger(ctx);
  const Scraper = scraper.list();
  const ownerId = config.telegram.owner_id;
  if (ctx.from.id.toString() !== ownerId.toString()) return;

  if (/^(x|=>|>)/.test(raw)) {
    const code = raw.replace(/^(x|=>|>)\s*/, '');
    try {
      const evaled = await eval(`(async () => { ${code} })()`);
      const output = typeof evaled === 'string' ? evaled : util.inspect(evaled, { depth: 2 });
      await ctx.reply(`✅ *Eval Result:*\n\`\`\`\n${output.slice(0, 4000)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ *Eval Error:*\n\`\`\`\n${(err.stack || err).toString().slice(0, 4000)}\n\`\`\``, { parse_mode: 'Markdown' });
    }
  } else if (raw.startsWith('$')) {
    const cmd = raw.slice(1).trim();
    try {
      const { stdout, stderr } = await execPromise(cmd);
      const out = stdout || stderr;
      await ctx.reply(`💻 *Exec Output:*\n\`\`\`\n${out.slice(0, 4000)}\n\`\`\``, { parse_mode: 'Markdown' });
    } catch (err) {
      await ctx.reply(`❌ *Exec Error:*\n\`\`\`\n${(err.stack || err).toString().slice(0, 4000)}\n\`\`\``, { parse_mode: 'Markdown' });
    }
  }
};


let pathh = __filename
let fs = require('fs');
let chalk = require('chalk');
fs.watchFile(pathh, () => {
  fs.unwatchFile(pathh);
  delete require.cache[pathh];
  console.log(chalk.green(`[ CHANGE ] : '${pathh}' Update`));
});
