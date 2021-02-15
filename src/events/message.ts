import { Client, Message, MessageEmbed } from 'discord.js';
import { ArgumentType, Command, commands, testArgument, config } from '..';

export default async (bot: Client, msg: Message) =>
{
  if (msg.author.bot) return;

  let args: Array<string> = msg.content.substring(config.PREFIX.length).match(/\\?.|^$/g).reduce((p: any, c) => 
  {
    if(c === '"')
    {
      p.quote ^= 1;
    }else if(!p.quote && c === ' ')
    {
      p.a.push('');
    }else
    {
      p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
    }
    return p;
  }, {a: ['']}).a;

  let message: string = msg.content.substring(0);

  if (message.substring(0, config.PREFIX.length) == config.PREFIX) 
  {
    if (commands.has(args[0])) 
    {
      try 
      {
        if (commands.get(args[0]).admin && !await msg.member.hasPermission('MANAGE_GUILD')) 
        {
          return msg.channel.send(`Access denied.`);
        }
        const command: Command = commands.get(args[0]);

        const embed: MessageEmbed = new MessageEmbed()
          .setTitle(`Command: ${config.PREFIX}${args[0]}`)
          .setDescription(
            `**Description: **`
            + command.description.replace(/{p}/g, config.PREFIX).replace(/(?<=\n) +/g, '')
            + `\n`
    
            + `**Usage: **`
            + command.usage.includes(`\n`) ? `\n` : ``
            + command.usage.replace(/{p}/g, config.PREFIX).replace(/(?<=\n) +/g, '')
            + `\n`
    
            + `**Examples: **`
            + command.example.includes(`\n`) ? `n` : ``
            + command.example.replace(/{p}/g, config.PREFIX).replace(/(?<=\n) +/g, '')
          )

        if (command.args.some((argTypes, index) => 
              {
                if(typeof argTypes == typeof ArgumentType){
                  argTypes = [argTypes as ArgumentType];
                }
                return (argTypes as Array<ArgumentType>).some(argType => testArgument(argType, args[index]));
              }
            )
          ) 
        {
          return msg.channel.send(embed);
        }
        await commands.get(args[0]).execute(bot, msg, args.slice(1), embed);

      } catch (err) 
      {
        console.error(err);
        msg.channel.send(`There was an error trying to execute the ${args[0]} command! Please contact the admins.`).catch(()=>{});
      }
    }
  }
};