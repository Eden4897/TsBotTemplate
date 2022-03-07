import { Client, Message } from "discord.js";
import {
  ArgumentType,
  Command,
  commands,
  testIfArgumentValid,
  config,
  CommandType,
} from "..";

let recentCommands: Array<string> = [];

export default async (bot: Client, msg: Message) => {
  if (msg.author.bot) return;

  let phrases: Array<string> = msg.content
    .substring(config.PREFIX.length)
    .match(/\\?.|^$/g)
    .reduce(
      (p: any, c) => {
        if (c === '"') {
          p.quote ^= 1;
        } else if (!p.quote && c === " ") {
          p.a.push("");
        } else {
          p.a[p.a.length - 1] += c.replace(/\\(.)/, "$1");
        }
        return p;
      },
      { a: [""] }
    ).a;

  let commandName = phrases[0];
  let args = phrases.splice(1);

  let content: string = msg.content.substring(0);

  if (content.substring(0, config.PREFIX.length) == config.PREFIX) {
    let command: Command =
      commands.get(commandName) ??
      commands.find((cmd) => cmd.aliases.includes(commandName));

    if (command) {
      try {
        if (command.type == CommandType.DM && msg.guild) {
          return msg.channel.send("This command can only be used in DMs!");
        }
        if (command.type == CommandType.Guild && !msg.guild) {
          return msg.channel.send("This command can only be used in a guild!");
        }
        if (recentCommands.includes(`${msg.author.id}-${commandName}`)) {
          return msg.channel.send(
            "Please wait a while before using this command again."
          );
        }
        if (!command.permissionTest(msg.member ?? msg.author)) {
          return msg.channel.send(`Access denied.`);
        }

        if (
          command.argTypes &&
          command.argTypes.some((argTypesArr, index) => {
            if (!Array.isArray(argTypesArr)) {
              argTypesArr = [argTypesArr as unknown as ArgumentType];
            }
            return !(argTypesArr as Array<ArgumentType>).every(
              (possibleArgTypes) =>
                testIfArgumentValid(possibleArgTypes, args[index])
            );
          })
        ) {
          return msg.channel.send(
            "Wrong command format; please use the help command."
          );
        }
        recentCommands.push(`${msg.author.id}-${commandName}`);

        setTimeout(() => {
          recentCommands = recentCommands.filter(
            (r) => r != `${msg.author.id}-${commandName}`
          );
        }, command.cd);

        await command.execute(bot, msg, args, () => {
          recentCommands = recentCommands.filter(
            (r) => r != `${msg.author.id}-${commandName}`
          );
        });
      } catch (err) {
        console.error(err);
        msg.channel
          .send(
            `There was an error trying to execute the ${commandName} command! Please contact the admins.`
          )
          .catch(() => {});
      }
    }
  }
};
