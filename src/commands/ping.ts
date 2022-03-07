import { Client, Message, MessageEmbed } from "discord.js";
import { Command } from "..";

export default new Command({
  name: `ping`,
  async execute(bot: Client, msg: Message, args: Array<String>) {
    const pinging: Message = await msg.channel.send(`🏓 Pinging...`);

    const embed: MessageEmbed = new MessageEmbed()
      .setColor(`#3B88C3`)
      .setTitle(`🏓 Pong!`)
      .setDescription(
        `Bot Latency is **${Math.floor(
          pinging.createdTimestamp - msg.createdTimestamp
        )} ms** \nAPI Latency is **${Math.round(bot.ws.ping)} ms**`
      );

    pinging.delete();
    await msg.channel.send({ embeds: [embed] });
  },
});
