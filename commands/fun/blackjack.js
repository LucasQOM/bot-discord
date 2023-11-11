const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Jogue uma partida de blackjack"),

  async execute(interaction) {
    const deck = new Deck();
    const dealerHand = new Hand();
    const playerHand = new Hand();
    let playerTurn = true;
    let gameOver = false;
    let winner = null;

    await interaction.reply({
      content: `Iniciando uma partida de blackjack`,
      ephemeral: true,
    });

    for (let i = 0; i < 2; i++) {
      dealerHand.addCard(deck.deal());
      playerHand.addCard(deck.deal());
    }

    if (playerHand.getScore() === 21) {
      gameOver = true;
      winner = "você";
    }

    const dealerHandEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Mão do Dealer")
      .setDescription(dealerHand.toString())
      .setFooter({ text: `Pontuação: ${dealerHand.getScore()}` });

    const playerHandEmbed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("Sua mão")
      .setDescription(playerHand.toString())
      .setFooter({ text: `Pontuação: ${playerHand.getScore()}` });

    if (dealerHand.getScore() === 21) {
      gameOver = true;
      winner = "mesa";
    }

    if (playerHand.getScore() === 21) {
      gameOver = true;
      winner = "você";
    }

    await interaction.followUp({
      embeds: [dealerHandEmbed, playerHandEmbed],
      ephemeral: true,
    });

    if (playerTurn) {
      const hitButton = new ButtonBuilder()
        .setCustomId("hit")
        .setLabel("Hit")
        .setStyle("Primary");

      const standButton = new ButtonBuilder()
        .setCustomId("stand")
        .setLabel("Stand")
        .setStyle("Primary");

      const row = new ActionRowBuilder().addComponents(hitButton, standButton);

      await interaction.followUp({
        content: "É sua vez de jogar",
        components: [row],
        ephemeral: true,
      });

      const filter = (interaction) => {
        return interaction.user.id === interaction.user.id;
      };

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "hit") {
          playerHand.addCard(deck.deal());
          playerHandEmbed.setDescription(playerHand.toString());
          playerHandEmbed.setFooter({
            text: `Pontuação: ${playerHand.getScore()}`,
          });
          await interaction.update({
            embeds: [dealerHandEmbed, playerHandEmbed],
            components: [row],
            ephemeral: true,
          });

          if (playerHand.getScore() > 21) {
            gameOver = true;
            winner = "mesa";
          }
        }

        if (interaction.customId === "stand") {
          while (dealerHand.getScore() <= 17) {
            dealerHand.addCard(deck.deal());
            dealerHandEmbed.setDescription(dealerHand.toString());
            dealerHandEmbed.setFooter({
              text: `Pontuação: ${dealerHand.getScore()}`,
            });

            if (interaction.replied) {
              await interaction.followUp({
                embeds: [dealerHandEmbed, playerHandEmbed],
                components: [],
                ephemeral: true,
              });
            } else {
              await interaction.reply({
                embeds: [dealerHandEmbed, playerHandEmbed],
                components: [],
                ephemeral: true,
              });
            }
          }

          if (dealerHand.getScore() > 21) {
            gameOver = true;
            winner = "você";
          } else if (dealerHand.getScore() >= playerHand.getScore()) {
            gameOver = true;
            winner = "mesa";
          }
        }

        if (gameOver) {
          if (interaction.replied) {
            await interaction.followUp({
              content: `O vencedor é ${winner}`,
              components: [],
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: `O vencedor é ${winner}`,
              components: [],
              ephemeral: true,
            });
          }
          collector.stop();
        }
      });
    }
  },
};

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
  }

  isAce() {
    return this.rank === "A";
  }

  getValue() {
    if (this.isAce()) {
      return 11;
    } else if (["J", "Q", "K"].includes(this.rank)) {
      return 10;
    } else {
      return parseInt(this.rank);
    }
  }

  toString() {
    return `${this.rank}${this.suit}`;
  }
}

class Deck {
  constructor() {
    this.cards = [];

    const suits = ["♠", "♣", "♥", "♦"];
    const ranks = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }

    this.shuffle();
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const newIndex = Math.floor(Math.random() * (i + 1));
      const oldValue = this.cards[newIndex];
      this.cards[newIndex] = this.cards[i];
      this.cards[i] = oldValue;
    }
  }

  deal() {
    return this.cards.pop();
  }
}

class Hand {
  constructor() {
    this.cards = [];
  }

  addCard(card) {
    this.cards.push(card);
  }

  getScore() {
    let score = 0;
    let hasAce = false;

    for (const card of this.cards) {
      score += card.getValue();
      if (card.isAce()) {
        hasAce = true;
      }
    }

    if (hasAce && score > 21) {
      score -= 10;
    }

    return score;
  }

  toString() {
    return this.cards.join(" ");
  }
}
