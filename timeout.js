import {
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("timeout")
  .setDescription("إعطاء Timeout لعضو")
  .addUserOption(option =>
    option
      .setName("member")
      .setDescription("العضو المطلوب إعطاؤه Timeout")
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option
      .setName("minutes")
      .setDescription("مدة الـ Timeout بالدقائق")
      .setMinValue(1)
      .setMaxValue(40320)
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("سبب الـ Timeout")
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
  const minutes = interaction.options.getInteger("minutes");

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
      content: "❌ لا يمكنك إعطاء Timeout لنفسك.",
      ephemeral: true
    });
  }

  if (member.user.bot) {
    return interaction.reply({
      content: "❌ لا يمكن إعطاء Timeout لبوت.",
      ephemeral: true
    });
  }

  if (!member.moderatable) {
    return interaction.reply({
      content:
        "❌ لا أستطيع إعطاء Timeout لهذا العضو.\n" +
        "تأكد أن رتبة البوت أعلى من رتبته وأن لدي صلاحية Timeout.",
      ephemeral: true
    });
  }

  const duration = minutes * 60 * 1000;

  try {
    await member.timeout(duration, reason);

    // إرسال تفاصيل الـ Timeout في الخاص
    try {
      await member.send(
        `🔇 **تم إعطاؤك Timeout في سيرفر ${interaction.guild.name}**\n\n` +
        `⏱️ **المدة:** ${minutes} دقيقة\n` +
        `📝 **السبب:** ${reason}\n` +
        `👮 **بواسطة:** ${interaction.user.tag}`
      );
    } catch {
      console.log(
        `⚠️ لم أتمكن من إرسال رسالة خاصة إلى ${member.user.tag}`
      );
    }

    // الرسالة في الشات بدون السبب
    await interaction.reply({
      content:
        `🔇 تم إعطاء Timeout للعضو ${member} بنجاح.\n` +
        `📩 تم إرسال تفاصيل الـ Timeout إلى الخاص.\n` +
        `⏱️ المدة: **${minutes} دقيقة**`
    });

  } catch (error) {
    console.error("Timeout Error:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content:
          "❌ حدث خطأ أثناء إعطاء Timeout.\n" +
          "تأكد من صلاحيات البوت وترتيب الرتب.",
        ephemeral: true
      });
    }
  }
}