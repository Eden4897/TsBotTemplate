# Typescript template for discord bots
## Template cleanup
1. Add these 2 lines into the gitignore
```
!package-lock.json
!package.json
```
2. Delete readme.md
3. Commit the changes to git (not compulsary)
## Setup
Delete the .vscode folder if you are not using visual studio code.

Install typescript if you have not already:
```
npm i typescript -g
```
Then run
```
npm init -y
npm i discord.js @types/node @types/ws
```
### Setup with config.json
Rename `config.json.example` to `config.json` and fill in the `PREFIX` and `TOKEN`.

### Setup with env variables
Delete `config.json.example`, and use the environment variables `PREFIX` and `TOKEN`.

## Traspiling and running
### VSC
If you are using visual studio code, you can just press `f5` to run the program. This will transpile and run the code for you in debug mode.

### Non VSC
If not, you will have to transpile the typescript to javascript yourself. To transpile the typescript, run:
```
tsc
```
then this to run the transpiled javascript:
```
cd build
node index.js
```

You can also have typescript watch for changes and automatically transpile if changes are found:
```
tsc --watch
```
Then, open a new terminal and
```
cd build
```
then run this whenever you made some changes to the typescript and want to run the transpiled js
```
node index.js
```

# Usage
## Command handler
The command handler loads all commands from the `src/commands` folder. All commands must use the `Command` interface which can be imported from `src/index.js`. Commands can be placed in nested folders inside `src/commands` folder since the command handler can read files recursively. Here are the properties of the interface.

### The `name` property
A string that would be the command's name in the bot
#### Example:
```
name: `ping`
```

### The `description` property
A string that would be the command's description in the information embed
#### Example:
```
description: `Gives you the ping of the bot in miliseconds`
```

### The `usage` property
A string that lists out all the variants of the command. Use `{p}` in place of the command. All spaces that follow a new line will be trimmed away for code styling purposes.
#### Example:
```
usage: `{p}purge bot [amount]
        {p}purge human [amount]
        {p}purge images [amount]`
```
The string will be trimmed to this:
```
{p}purge bot [amount]
{p}purge human [amount]
{p}purge images [amount]
```

### The `example` property
A string that demonstrates how all variants of the command would be used. Use `{p}` in place of the command. All spaces that follow a new line will be trimmed away for code styling purposes.

#### Example:
```
usage: `{p}purge bot 20
        {p}purge human 50
        {p}purge images 80`
```
The string will be trimmed to this:
```
{p}purge bot 20
{p}purge human 50
{p}purge images 80
```

### The `admin` property (optional)
A boolean that indicates if the user needs `MANAGE_GUILD` permissions to use this command. If this is set to true, the command can only be used in a guild.

Default: `false`

#### Example:
```
admin: true
```

### The `type` property (optional)
An enum value from the enum `CommandType` which can be imported from `src/index.js`.
* `CommandType.All`: The command can be used in DMs and guilds
* `CommandType.DM`: The command can only be used in DMs
* `CommandType.Guild`: The command can only be used in guilds

Default: `CommandType.All`

#### Example:
```
usage: `{p}purge bot 20
        {p}purge human 50
        {p}purge images 80`
```
The string will be trimmed to this:
```
{p}purge bot 20
{p}purge human 50
{p}purge images 80
```

## The `cd` property (optional)
A number that represents the cooldown between another use of this command of the same user (in ms).

Default: `0`

#### Example:
```
cd: 1000
```

### The `aliases` property (optional)
An array of strings that can also be used to call the command other than the `name`.

Default: `[]`

#### Example:
```
aliases: ['foo', 'bar']
```

## The `args` property (optional)
An array of enum values of `ArgumentType` or array of enum values of `ArgumentType`. This will be used to check if the command entered by the user is valid. If the arguments entered by the users do not match the `ArgumentType`s, an help embed will be automatically sent with the details from the `name`, `description`, `usage` and `example` properties. Spaces that are wrapped with ""s will not be spliced away, to allow for arguments that contains spaces.

Posible values:
* `Number`
* `PositiveNumber`
* `NonZeroPositiveNumber`
* `Integer`
* `PositiveInteger`
* `NonZeroPositiveInteger`
* `Alphanumeric`
* `Alphabetic`
* `Lowercase`
* `Uppercase`
* `String`
* `MemberMention`: a string with the syntax: `<@18-DIGIT-ID>`
* `ChannelMention`: a string with the syntax: `<#18-DIGIT-ID>`
* `RoleMention`: a string with the syntax: `<@&18-DIGIT-ID>`
* `ID`: a 18 digit id

Default: `[]`

#### Example:
```
args: [ArgumentType.MemberMention, ArgumentType.String]
```
If you want the user to be able to enter multiple types in the same argument, replace the enum value with an array of enum values:
```
args: [[ArgumentType.MemberMention, ArgumentType.ID], ArgumentType.String]
```

### The `execute` property
A function that will be called when the command is ran by a member.

* `bot: Client`: The discord client of the token provided in config.json
* `msg: Message`: The discord message sent by the member that started this command
* `args: Array<string>`: An array of arguments in the command that the member started. Note that the command itself will not be included in this array
* `help: MessageEmbed`: The help embed that is constructed from the `name`, `description`, `usage` and `example` provided
* `cdReset: () => any`: A function when called that will reset the cooldown of the command, allowing the user to use the comamnd right afterwards

#### Example:
```
async execute(bot, msg, args, help) 
{
    await msg.channel.send('Hi!');
}
```

## Event handler
All files inside the `src/events` folder will be binded to a discord event. The event binded will be according to the name of the file (with the .ts/.js removed). The files inside the `src/events` folder should defaultly export a function. The first parameter of the function will always be a `Client`, followed with the parameters of the discord event. View the discord events and event parameters [here](https://discord.js.org/#/docs/main/stable/class/Client) under the `Event` column.

## Config variables
You can inport all the config variables from `src/index.ts`, or from `src/util/global.ts`.
