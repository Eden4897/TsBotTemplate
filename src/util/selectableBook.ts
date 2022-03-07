import { Message, MessageEmbed } from "discord.js";
import { Book, Page, PageEntry } from "./book";
import { ButtonApperance, CallbackButton } from "./interactions";

export type SelectionButton<T> = {
  buttonAppearance: ButtonApperance;
  onSelect: (rawData: T) => Promise<void> | void;
};
export class SelectableBook<T> extends Book {
  protected cursorIndex: number = 0;

  protected maximumPageSize: number = 25;

  public constructor(
    pageEntriesGenerator: () => Array<PageEntry<T>>,
    activator: Message = null,
    title: string = "",
    maxiumPageSize: number = 25,
    selectionButtons: Array<SelectionButton<T> | "\n"> = []
  ) {
    super({ pageEntriesGenerator, activator, title, maxiumPageSize });

    this.createEmbed = () => {
      this.updatePages(pageEntriesGenerator());
      if (this.pages.length >= 1) {
        if (this.pages.length <= this.currentPageIndex) {
          this.currentPageIndex = this.pages.length - 1;
        }
      }
      const _ = new MessageEmbed().setTitle(this.title).addFields(
        this.pages[this.currentPageIndex].map(
          ({ name, description }, index) => {
            description =
              description.length > 200
                ? description.substring(0, 200) + "\n..."
                : description;
            description =
              this.cursorIndex == index
                ? description
                    .split("\n")
                    .map((line) => "> " + line)
                    .join("\n")
                : description;
            return {
              name: this.cursorIndex == index ? `> ${name}` : name,
              value: description,
            };
          }
        )
      );
      if (this.pages.length >= 1)
        _.setFooter({
          text: `Page ${this.currentPageIndex + 1}/${this.pages.length} Entry ${
            this.currentPageIndex * this.maximumPageSize + this.cursorIndex + 1
          }/${this.pages.flat().length}`,
        });
      return _;
    };

    const selectionButtonObjects = selectionButtons.map((selectionButton) => {
      return selectionButton == "\n"
        ? "\n"
        : {
            callback: async (_: Message, __: Message) =>
              await selectionButton.onSelect(
                this.pages[this.currentPageIndex][this.cursorIndex].rawEntryData
              ),
            ...selectionButton.buttonAppearance,
          };
    });

    const prevPageButton: CallbackButton = {
      emoji: "◀",
      callback: (_, bookMsg) => {
        if (this.currentPageIndex == 0)
          this.currentPageIndex = this.pages.length - 1;
        else this.currentPageIndex--;
        this.cursorIndex = 0;
        bookMsg.edit({ embeds: [this.createEmbed()] });
      },
    };

    const nextPageButton: CallbackButton = {
      emoji: "▶",
      callback: (_, bookMsg) => {
        if (this.currentPageIndex >= this.pages.length - 1)
          this.currentPageIndex = 0;
        else this.currentPageIndex++;
        this.cursorIndex = 0;
        bookMsg.edit({ embeds: [this.createEmbed()] });
      },
    };

    const upBotton: CallbackButton = {
      emoji: "🔼",
      callback: (_, bookMsg) => {
        if (this.cursorIndex == 0)
          this.cursorIndex = this.pages[this.currentPageIndex].length - 1;
        else this.cursorIndex--;
        bookMsg.edit({ embeds: [this.createEmbed()] });
      },
    };

    const downButton: CallbackButton = {
      emoji: "🔽",
      callback: (_, bookMsg) => {
        if (this.cursorIndex >= this.pages[this.currentPageIndex].length - 1)
          this.cursorIndex = 0;
        else this.cursorIndex++;
        bookMsg.edit({ embeds: [this.createEmbed()] });
      },
    };

    const selfUpdatingSelectionButtons: Array<CallbackButton | "\n"> =
      selectionButtonObjects.map((e) => {
        // Make all selectionButtons inputted edit the message after the callback
        return e == "\n"
          ? "\n"
          : {
              ...e,
              callback: async (_: Message, botMsg: Message) => {
                await e.callback(_, botMsg);
                await botMsg.edit({ embeds: [this.createEmbed()] });
              },
            };
      });

    this.buttons = [
      prevPageButton,
      nextPageButton,
      upBotton,
      downButton,
      ...selfUpdatingSelectionButtons,
    ];

    this.maximumPageSize = maxiumPageSize;
  }

  public updatePages(newPages: Array<PageEntry<T>>): void {
    this.pages = [[]];
    for (const pageEntry of newPages) {
      if (this.pages[this.pages.length - 1].length >= this.maximumPageSize) {
        this.pages.push([]);
      }
      this.pages[this.pages.length - 1].push(pageEntry);
    }
  }
}
