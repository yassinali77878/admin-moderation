import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unlock")
  .setDescription("فتح الروم الحالية")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

export async function execute(interaction) {
  const channel = interaction.channel;

  if (!channel || !channel.isTextBased()) {
    return interaction.reply({
      content: "❌ لا يمكن فتح هذا النوع من الرومات.",
      ephemeral: true
    });
  }

  try {
    await channel.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      {
        SendMessages: null
      }
    );

    await interaction.reply({
      content: "🔓 تم فتح الروم بنجاح."
    });

  } catch (error) {
    console.error("Unlock Error:", error);

    await interaction.reply({
      content:
        "❌ لم أستطع فتح الروم.\n" +
        "تأكد أن البوت لديه صلاحية **Manage Channels**.",
      ephemeral: true
    });
  }
}