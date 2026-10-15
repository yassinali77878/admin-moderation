import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("lock")
  .setDescription("قفل الروم الحالية")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const channel = interaction.channel;

  if (!channel || !channel.isTextBased()) {
    return interaction.reply({
      content: "❌ لا يمكن قفل هذا النوع من الرومات.",
      ephemeral: true
    });
  }

  try {
    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: false
      }
    );

    await interaction.reply({
      content: "🔒 تم قفل الروم الحالي بواسطه YassinAli.Noor."
    });

  } catch (error) {
    console.error("Lock Error:", error);

    await interaction.reply({
      content:
        "❌ لم أستطع قفل الروم.\n" +
        "تأكد أن البوت لديه صلاحية **Manage Channels**.",
      ephemeral: true
    });
  }
}