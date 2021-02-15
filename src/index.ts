import { Client, Collection, GuildMember, Message, MessageEmbed} from 'discord.js';
import { readdir } from 'fs';
import * as config from './config.json';

export const bot: Client = new Client();

export { config };

export enum ArgumentType{
  Number,
  PositiveNumber,
  NonZeroPositiveNumber,
  Integer,
  PositiveInteger,
  NonZeroPositiveInteger,
  Alphanumeric,
  Alphabetic,
  Lowercase,
  Uppercase,
  String,

  MemberMention,
  ChannelMention,
  RoleMention,
  ID
}

export function testArgument(argType: ArgumentType, value: string): boolean
{
  switch(argType)
  {
    case ArgumentType.Number:
      return isNaN(+value);
    case ArgumentType.PositiveNumber:
      return isNaN(+value) && +value >= 0;
    case ArgumentType.NonZeroPositiveNumber:
      return isNaN(+value) && +value > 0;
    case ArgumentType.Integer:
      return isNaN(+value) && !value.includes(`.`);
    case ArgumentType.PositiveInteger:
      return isNaN(+value) && !value.includes(`.`) && +value >= 0;
    case ArgumentType.NonZeroPositiveInteger:
      return isNaN(+value) && !value.includes(`.`) && +value > 0;
    case ArgumentType.Alphanumeric:
      return !/[^\w ]/.test(value);
    case ArgumentType.Alphabetic:
      return !/[^a-zA-Z]/.test(value);
    case ArgumentType.Lowercase:
      return !/[^a-z]/.test(value);
    case ArgumentType.Uppercase:
      return !/[^A-Z]/.test(value);
    case ArgumentType.String:
      return true;
    case ArgumentType.MemberMention:
      return value.slice(0, 2) == '<@' && value[20] == '>' && !isNaN(+value.slice(2, 20));
    case ArgumentType.ChannelMention:
      return value.slice(0, 2) == '<#' && value[20] == '>' && !isNaN(+value.slice(2, 20));
    case ArgumentType.RoleMention:
      return value.slice(0, 3) == '<@&' && value[21] == '>' && !isNaN(+value.slice(3, 21));
    case ArgumentType.ID:
      return value.length == 18 && !isNaN(+value);
  }
}

export interface Command
{
  name: string,
  description: string,
  usage: string,
  example: string,
  admin: boolean,
  args: Array<ArgumentType | Array<ArgumentType>>,
  execute: (bot: Client, msg: Message, args: Array<string>, help: MessageEmbed) => any
}

export const commands = new Collection<string, Command>();

readdir(`${__dirname}\\commands/`, (err, files) => 
{
  if (err) return console.error;
  files.forEach(file => 
    {
      if (!file.endsWith(`.js`)) return;
      const command: Command = require(`${__dirname}\\commands/${file}`).default;
      commands.set(command.name, command);
    }
  )
});

readdir(`${__dirname}\\events/`, (err, files) => 
{
  if (err) return console.error;
  files.forEach(file => 
    {
      if (!file.endsWith(`.js`)) return;
      const event: () => any = require(`${__dirname}\\events\\${file}`).default;
      const eventName: string = file.split(`.`)[0];
      bot.on(eventName, event.bind(null, bot));
    }
  )
});

bot.login(config.TOKEN);