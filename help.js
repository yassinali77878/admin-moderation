import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("عرض جميع أوامر YassinAli Noor");

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("📖 YassinAli Noor | Help")
    .setDescription(
      "أهلًا بك في قائمة أوامر البوت 🤖\n\n" +
      "اختر الأمر المناسب لك من القائمة:"
    )

    .addFields(
      {
        name: "🛡️ أوامر الإدارة",
        value:
          "`/timeout` — إعطاء تايم أوت\n" +
          "`/untimeout` — فك التايم أوت\n" +
          "`/warn` — تحذير عضو\n" +
          "`/mute` — ميوت عضو\n" +
          "`/unmute` — فك الميوت\n" +
          "`/ban` — حظر عضو\n"+
          "`/auto mod` — تفعيل نظام الحمايه"
          
      },
      {
        name: "👤 المعلومات",
        value:
          "`/userinfo` — معلومات عضو\n" +
          "`/serverinfo` — معلومات السيرفر"
      },
      {
        name: "🔒 إدارة الرومات",
        value:
          "`/lock` — قفل الروم\n" +
          "`/unlock` — فتح الروم\n" +
          "`/ticket` — إنشاء نظام التذاكر"
      },
      {
        name: "🛡️ الحماية",
        value:
          "`/automod on` — تشغيل AutoMod\n" +
          "`/automod off` — إيقاف AutoMod"
      },
      {
        name: "💰 العملات",
        value:
          "`/daily` — الحصول على العملة اليومية\n" +
          "`/pay` — تحويل عملة إلى عضو"
      }
    )

    .setFooter({
      text: "YassinAli Noort • جميع الحقوق محفوظة"
    })
    .setTimestamp();

  await interaction.reply({
    embeds: [embed]
  });
}