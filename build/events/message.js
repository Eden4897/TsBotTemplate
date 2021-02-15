"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const __1 = require("..");
exports.default = async (bot, msg) => {
    if (msg.author.bot)
        return;
    let args = msg.content.substring(__1.config.PREFIX.length).match(/\\?.|^$/g).reduce((p, c) => {
        if (c === '"') {
            p.quote ^= 1;
        }
        else if (!p.quote && c === ' ') {
            p.a.push('');
        }
        else {
            p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
        }
        return p;
    }, { a: [''] }).a;
    let message = msg.content.substring(0);
    if (message.substring(0, __1.config.PREFIX.length) == __1.config.PREFIX) {
        if (__1.commands.has(args[0])) {
            try {
                if (__1.commands.get(args[0]).admin && !await msg.member.hasPermission('MANAGE_GUILD')) {
                    return msg.channel.send(`Access denied.`);
                }
                const command = __1.commands.get(args[0]);
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle(`Command: ${__1.config.PREFIX}${args[0]}`)
                    .setDescription(`**Description: **`
                    + command.description.replace(/{p}/g, __1.config.PREFIX).replace(/(?<=\n) +/g, '')
                    + `\n`
                    + `**Usage: **`
                    + command.usage.includes(`\n`) ? `\n` : ``
                    + command.usage.replace(/{p}/g, __1.config.PREFIX).replace(/(?<=\n) +/g, '')
                    + `\n`
                    + `**Examples: **`
                    + command.example.includes(`\n`) ? `n` : ``
                    + command.example.replace(/{p}/g, __1.config.PREFIX).replace(/(?<=\n) +/g, ''));
                if (command.args.some((argTypes, index) => {
                    if (typeof argTypes == typeof __1.ArgumentType) {
                        argTypes = [argTypes];
                    }
                    return argTypes.some(argType => __1.testArgument(argType, args[index]));
                })) {
                    return msg.channel.send(embed);
                }
                await __1.commands.get(args[0]).execute(bot, msg, args.slice(1), embed);
            }
            catch (err) {
                console.error(err);
                msg.channel.send(`There was an error trying to execute the ${args[0]} command! Please contact the admins.`).catch(() => { });
            }
        }
    }
};
