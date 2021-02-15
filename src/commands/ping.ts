import { Message, MessageEmbed } from 'discord.js';
import { Command } from '..';

export default {
  name: `ping`,
  description: `Ping!`,
  usage: `{p}ping`,
  example: `{p}ping`,
  admin: false,
  args: [],
  async execute(bot, msg, args, help) 
  {
    const pinging: Message = await msg.channel.send(`🏓 Pinging...`);

    const embed: MessageEmbed = new MessageEmbed()
      .setColor(`#3B88C3`)
      .setTitle(`🏓 Pong!`)
      .setDescription(`Bot Latency is **${Math.floor(pinging.createdTimestamp - msg.createdTimestamp)} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`);

    pinging.delete();
    await msg.channel.send(embed);
  },
} as Command;