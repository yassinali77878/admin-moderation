import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("إرسال رسالة Embed")
  .addStringOption(option =>
    option
      .setName("title")
      .setDescription("عنوان الـ Embed")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("message")
      .setDescription("محتوى الرسالة")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageMessages
  );

export async function execute(interaction) {
  const title = interaction.options.getString("title");
  const message = interaction.options.getString("message");

  await interaction.channel.send({
    embeds: [embed]
  });

  await interaction.reply({
    content: "✅ تم إرسال الـ Embed بنجاح.",
    ephemeral: true
  });
}