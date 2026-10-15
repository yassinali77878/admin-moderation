import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("عرض معلومات عضو")
  .addUserOption(option =>
    option
      .setName("member")
      .setDescription("العضو المطلوب")
      .setRequired(false)
  );

export async function execute(interaction) {
  const user =
    interaction.options.getUser("member") || interaction.user;

  const member = await interaction.guild.members
    .fetch(user.id)
    .catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "❌ لم أتمكن من العثور على هذا العضو.",
      ephemeral: true
    });
  }

  const roles = member.roles.cache
    .filter(role => role.id !== interaction.guild.id)
    .map(role => role.toString())
    .join(" ") || "لا توجد رتب";

  const embed = new EmbedBuilder()
    .setTitle("👤 معلومات العضو")
    .setThumbnail(user.displayAvatarURL({ size: 1024 }))
    .addFields(
      {
        name: "👤 الاسم",
        value: `${user}`,
        inline: true
      },
      {
        name: "🆔 ID",
        value: `\`${user.id}\``,
        inline: true
      },
      {
        name: "🤖 بوت؟",
        value: user.bot ? "نعم" : "لا",
        inline: true
      },
      {
        name: "📅 إنشاء الحساب",
        value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
        inline: false
      },
      {
        name: "📥 دخول السيرفر",
        value: member.joinedTimestamp
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
          : "غير معروف",
        inline: false
      },
      {
        name: "🏷️ الرتب",
        value: roles.length > 1024
          ? "عدد الرتب كبير جدًا"
          : roles,
        inline: false
      }
    )
    .setFooter({
      text: `YassinAli Bot • ${interaction.guild.name}`
    })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed]
  });
}