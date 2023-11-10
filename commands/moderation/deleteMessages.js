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
    let messagesToDelete = messages.filter(
      (message) =>
        message.content.toLowerCase().includes(keyword.toLowerCase()) &&
        message.id !== lastMessage.id
    );
    let minimumMessages = 50;

    for (const message of messagesToDelete.values()) {
      console.log(message.content);
      minimumMessages--;
    }

    while (minimumMessages > 0) {
      messages = await channel.messages.fetch({
        limit: 100,
        before: lastMessage.id,
      });
      lastMessage = messages.last();
      messagesToDelete = messages.filter(
        (message) =>
          message.content.toLowerCase().includes(keyword.toLowerCase()) &&
          message.id !== lastMessage.id
      );

      for (const message of messagesToDelete.values()) {
        await message.delete();
        minimumMessages--;
      }
    }

    await interaction.reply({
      content: "Mensagens apagadas com sucesso!",
      ephemeral: true,
    });
  },
};
