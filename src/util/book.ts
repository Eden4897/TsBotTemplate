import {
  DMChannel,
  Message,
  MessageEmbed,
  TextChannel,
  User,
} from "discord.js";
import { attachCallbackButtons, CallbackButton } from "./interactions";

export type Page<T> = Array<PageEntry<T>>;
export type PageEntry<T> = {
  name: string;
  description: string;
  rawEntryData?: T;
};

export class Book {
  protected pages: Array<Page<any>> = [[]];

  protected title: string = "";

  private activator: Message = null;

  protected currentPageIndex: number = 0;

  protected createEmbed = () => {
    const _ = new MessageEmbed()
      .setTitle(this.title)
      .addFields(
        this.pages[this.currentPageIndex].map(({ name, description }) => {
          return {
            name,
            value:
              description.length > 1000
                ? description.substring(0, 1000) + "..."
                : description,
          };
        })
      )
      .setFooter({
        text: `Page ${this.currentPageIndex + 1}/${this.pages.length}`,
      });
    return _;
  };

  protected buttons: Array<CallbackButton | "\n"> = [
    {
      emoji: "◀",
      callback: (_, bookMsg) => {
        if (this.currentPageIndex == 0)
          this.currentPageIndex = this.pages.length - 1;
        else this.currentPageIndex--;
        const embed = this.createEmbed();
        bookMsg.edit({ embeds: [embed] });
      },
    },
    {
      emoji: "▶",
      callback: (_, bookMsg) => {
        if (this.currentPageIndex >= this.pages.length - 1)
          this.currentPageIndex = 0;
        else this.currentPageIndex++;
        const embed = this.createEmbed();
        bookMsg.edit({ embeds: [embed] });
      },
    },
  ];

  public constructor({
    pageEntriesGenerator,
    activator,
    title = "",
    maxiumPageSize = 25,
  }: {
    pageEntriesGenerator: () => Array<PageEntry<any>>;
    activator: Message;
    title?: string;
    maxiumPageSize?: number;
  }) {
    for (const pageEntry of pageEntriesGenerator()) {
      if (this.pages[this.pages.length - 1].length >= maxiumPageSize) {
        this.pages.push([]);
      }
      this.pages[this.pages.length - 1].push(pageEntry);
    }

    this.title = title;
    this.activator = activator;
  }

  async send(channel: TextChannel | DMChannel | User): Promise<void> {
    const bookMsg = await channel.send({ embeds: [this.createEmbed()] });

    attachCallbackButtons(this.activator, bookMsg, this.buttons);
  }
}
