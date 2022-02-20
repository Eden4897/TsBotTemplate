import { EmojiIdentifierResolvable, Interaction, Message, MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageComponentInteraction } from "discord.js";

export class CallbackButton {
    disabled?: boolean = false
    emoji?: EmojiIdentifierResolvable = null
    label?: string = null
    style?: MessageButtonStyleResolvable = "PRIMARY"
    url?: string = ''
    authorOnly?: boolean = true
    collectorDuraction?: number = 30000
    callback: (originalMsg: Message, botMsg: Message) => void
}

export async function attachButtons(originalMsg: Message, botMsg: Message, ...callbackButtons: Array<CallbackButton>) {
    const buttonRows: Array<MessageActionRow> = [new MessageActionRow()];
    for (const [i, callbackButton] of callbackButtons.entries()) {
        const button = new MessageButton()
            .setCustomId(`${botMsg.id}-callbackButton-${i}`)
            .setDisabled(callbackButton.disabled ?? false)
            .setEmoji(callbackButton.emoji)
            .setLabel(callbackButton.label)
            .setStyle(callbackButton.style ?? "PRIMARY")
            .setURL(callbackButton.url ?? '');
        if (buttonRows[buttonRows.length - 1].components.length >= 5) {
            if (buttonRows.length >= 5) {
                throw new Error('Too many buttons.');
            }
            buttonRows.push(new MessageActionRow())
        }
        buttonRows[buttonRows.length - 1].addComponents(button)
    }

    await botMsg.edit({
        components: buttonRows
    });

    for (const [i, callbackButton] of callbackButtons.entries()) {
        const filter = (interaction: MessageComponentInteraction<'cached'>) =>
            interaction.customId === `${botMsg.id}-callbackButton-${i}`.toString() &&
            (callbackButton.authorOnly ? interaction.user.id === botMsg.author.id : true);


        const collector = botMsg.createMessageComponentCollector({
            filter,
            time: callbackButton.collectorDuraction
        });

        collector.on('collect', async interaction => {
            interaction.deferUpdate()
            callbackButton.callback(originalMsg, botMsg)
        });
    }
}