import {
  EmojiIdentifierResolvable,
  Interaction,
  Message,
  MessageActionRow,
  MessageButton,
  MessageButtonStyleResolvable,
  MessageComponentInteraction,
} from "discord.js";

export class ButtonApperance {
  disabled?: boolean = false;
  emoji?: EmojiIdentifierResolvable = null;
  label?: string = "";
  style?: MessageButtonStyleResolvable = "PRIMARY";
  url?: string = "";
}

export class CallbackButton extends ButtonApperance {
  authorOnly?: boolean = true;
  collectorDuraction?: number = 30000;
  callback: (
    originalMsg: Message | null,
    botMsg: Message,
    buttonUpdater: (
      buttonIndex: number,
      newButton: CallbackButton
    ) => Promise<void>
  ) => Promise<void> | void;
}

export async function attachCallbackButtons(
  originalMsg: Message,
  botMsg: Message,
  callbackButtons: Array<CallbackButton | "\n">
): Promise<void> {
  //'\n' =  start new line of buttons
  const buttonRows: Array<MessageActionRow> = [new MessageActionRow()];
  for (const [i, callbackButton] of callbackButtons.entries()) {
    if (callbackButton == "\n") {
      buttonRows.push(new MessageActionRow());
      continue;
    }
    const button = new MessageButton()
      .setCustomId(`${botMsg.id}-callbackButton-${i}`)
      .setDisabled(callbackButton.disabled ?? false)
      .setEmoji(callbackButton.emoji)
      .setLabel(callbackButton.label ?? "")
      .setStyle(callbackButton.style ?? "PRIMARY")
      .setURL(callbackButton.url ?? "");
    if (buttonRows[buttonRows.length - 1].components.length >= 5) {
      if (buttonRows.length >= 5) {
        throw new Error("Too many buttons.");
      }
      buttonRows.push(new MessageActionRow());
    }
    buttonRows[buttonRows.length - 1].addComponents(button);
  }

  await botMsg.edit({
    components: buttonRows,
  });

  for (const [i, callbackButton] of (<Array<CallbackButton>>(
    callbackButtons
  )).entries()) {
    const filter = (interaction: MessageComponentInteraction<"cached">) =>
      interaction.customId === `${botMsg.id}-callbackButton-${i}`.toString() &&
      (callbackButton.authorOnly
        ? interaction.user.id === botMsg.author.id
        : true);

    const collector = botMsg.createMessageComponentCollector({
      filter,
      time: callbackButton.collectorDuraction,
    });

    collector.on("collect", async (interaction) => {
      interaction.deferUpdate();
      await callbackButton.callback(
        originalMsg ? originalMsg : null,
        botMsg,
        updateButtonApperance
      );
    });
  }

  async function updateButtonApperance(
    buttonIndex: number,
    newButton: CallbackButton
  ) {
    const row = Math.floor(buttonIndex / 5);
    const column = buttonIndex % 5;
    const newRow = buttonRows[row].components;
    const button = new MessageButton()
      .setCustomId(`${botMsg.id}-callbackButton-${buttonIndex}`)
      .setDisabled(newButton.disabled ?? false)
      .setEmoji(newButton.emoji)
      .setLabel(newButton.label ?? "")
      .setStyle(newButton.style ?? "PRIMARY")
      .setURL(newButton.url ?? "");
    newRow[column] = button;
    buttonRows[row].setComponents(newRow);
    await botMsg.edit({
      components: buttonRows,
    });
  }
}
