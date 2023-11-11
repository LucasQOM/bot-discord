const { SlashCommandBuilder } = require("@discordjs/builders");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("apaga-tudo")
    .setDescription(
      "Apaga todas mensagens que tenham a palavra especifica do canal"
    )
    .addStringOption((option) =>
      option
        .setName("keyword")
        .setDescription("Palavra chave para apagar mensagens")
        .setRequired(true)
    ),
  async execute(interaction) {
    const keyword = interaction.options.getString("keyword");
    const channel = interaction.channel;
    let messages = await channel.messages.fetch({ limit: 100 });
    let lastMessage = messages.last();
    let minimumMessages = 50;
    let countDeletedMessages = 0;

    await interaction.reply({
      content: `Apagando as mensagens que contém a palavra ${keyword}`,
      ephemeral: true,
    });

    let i = 0;
    while (minimumMessages > 0) {
      if (lastMessage && lastMessage.id) {
        if (i >= 1) {
          messages = await channel.messages.fetch({
            limit: 100,
            before: lastMessage.id,
          });
          lastMessage = messages.last();
        }
        let messagesToDelete = messages.filter(
          (message) =>
            message.content.toLowerCase().includes(keyword.toLowerCase()) &&
            message.id !== lastMessage.id
        );

        for (const message of messagesToDelete.values()) {
          await message.delete();
          countDeletedMessages++;
          minimumMessages--;
        }
        i++;
      } else {
        break;
      }
    }

    await interaction.followUp({
      content: `Foram apagadas ${countDeletedMessages} mensagens`,
      ephemeral: true,
    });
  },
};
