import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("تحذير عضو")
  .addUserOption(option =>
    option
      .setName("member")
      .setDescription("العضو المطلوب تحذيره")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("سبب التحذير")
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

export async function execute(interaction) {
  if (!interaction.memberPermissions.has(
    PermissionFlagsBits.ModerateMembers
  )) {
    return interaction.reply({
      content: "❌ ليس لديك صلاحية استخدام هذا الأمر.",
      ephemeral: true
    });
  }

  const user = interaction.options.getUser("member");

  const reason =
    interaction.options.getString("reason") ||
    "لم يتم تحديد سبب";

  const member = await interaction.guild.members
    .fetch(user.id)
    .catch(() => null);

  if (!member) {
    return interaction.reply({
      content: "❌ لم أتمكن من العثور على هذا العضو.",
      ephemeral: true
    });
  }

  if (member.id === interaction.user.id) {
    return interaction.reply({
      content: "❌ لا يمكنك تحذير نفسك.",
      ephemeral: true
    });
  }

  if (member.user.bot) {
    return interaction.reply({
      content: "❌ لا يمكن تحذير بوت.",
      ephemeral: true
    });
  }

  try {
    // حفظ التحذيرات
    if (!interaction.client.warnings) {
      interaction.client.warnings = new Map();
    }

    if (!interaction.client.warnings.has(interaction.guild.id)) {
      interaction.client.warnings.set(
        interaction.guild.id,
        new Map()
      );
    }

    const guildWarnings =
      interaction.client.warnings.get(interaction.guild.id);

    if (!guildWarnings.has(member.id)) {
      guildWarnings.set(member.id, []);
    }

    const warnings = guildWarnings.get(member.id);

    warnings.push({
      reason,
      moderator: interaction.user.id,
      date: Date.now()
    });

    // إرسال التحذير في الخاص
    try {
      await member.send(
        `⚠️ **تم تحذيرك في سيرفر ${interaction.guild.name}**\n\n` +
        `📝 **سبب التحذير:** ${reason}\n` +
        `🔢 **عدد التحذيرات:** ${warnings.length}\n` +
        `👮 **بواسطة:** ${interaction.user.tag}`
      );
    } catch {
      console.log(
        `⚠️ لم أتمكن من إرسال رسالة خاصة إلى ${member.user.tag}`
      );
    }

    // رسالة بسيطة في الشات بدون السبب
    await interaction.reply({
      content:
        `⚠️ تم تحذير ${member} بنجاح.\n` +
        `📩 تم إرسال تفاصيل التحذير إلى الخاص.\n` +
        `🔢 عدد التحذيرات: **${warnings.length}**`
    });

  } catch (error) {
    console.error("Warn Error:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ حدث خطأ أثناء تحذير العضو.",
        ephemeral: true
      });
    }
  }
}