import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("فك الميوت عن عضو")
  .addUserOption(option =>
    option
      .setName("member")
      .setDescription("العضو المطلوب فك الميوت عنه")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("سبب فك الميوت")
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {
  if (!interaction.memberPermissions.has(
    PermissionFlagsBits.ManageRoles
  )) {
    return interaction.reply({
      content: "❌ ليس لديك صلاحية استخدام أمر فك الميوت.",
      ephemeral: true
    });
  }

  const member = interaction.options.getMember("member");

  const reason =
    interaction.options.getString("reason") ||
    "تم فك الميوت";

  if (!member) {
    return interaction.reply({
      content: "❌ لم أتمكن من العثور على العضو.",
      ephemeral: true
    });
  }

  const muteRole = interaction.guild.roles.cache.find(
    role => role.name === "Muted"
  );

  if (!muteRole) {
    return interaction.reply({
      content: "❌ رتبة `Muted` غير موجودة في السيرفر.",
      ephemeral: true
    });
  }

  if (!member.roles.cache.has(muteRole.id)) {
    return interaction.reply({
      content: "ℹ️ هذا العضو ليس عليه ميوت.",
      ephemeral: true
    });
  }

  if (!member.manageable) {
    return interaction.reply({
      content:
        "❌ لا أستطيع فك الميوت عن هذا العضو.\n" +
        "تأكد أن رتبة البوت أعلى من رتبة العضو.",
      ephemeral: true
    });
  }

  try {
    await member.roles.remove(muteRole, reason);

    await interaction.reply({
      content:
        `🔊 تم فك الميوت عن ${member} بنجاح.\n\n` +
        `📝 السبب: **${reason}**\n` +
        `👮 بواسطة: ${interaction.user}`
    });

  } catch (error) {
    console.error("Unmute Error:", error);

    await interaction.reply({
      content:
        "❌ حدث خطأ أثناء فك الميوت.\n" +
        "تأكد أن البوت لديه صلاحية **Manage Roles**.",
      ephemeral: true
    });
  }
}