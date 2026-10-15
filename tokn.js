// ==========================================
// 🔐 أمر معلومات توكن البوت
// commands/tokn.js
// ==========================================

import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";

// ==========================================
// ⚙️ تعريف الأمر
// ==========================================

export const data = new SlashCommandBuilder()
  .setName("tokn")
  .setDescription("عرض معلومات آمنة عن توكن البوت");

// ==========================================
// ▶️ تنفيذ الأمر
// ==========================================

export async function execute(interaction) {
  try {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("🔐 معلومات توكن البوت")
      .setDescription(
        "**⚠️ تنبيه أمني**\n\n" +
        "توكن البوت هو مفتاح سري ولا يجب مشاركته مع أي شخص.\n\n" +

        "**[` 1 `]** ㆍ افتح لوحة إدارة تطبيق البوت.\n\n" +

        "**[` 2 `]** ㆍ اختر تطبيق البوت الخاص بك.\n\n" +

        "**[` 3 `]** ㆍ افتح قسم **Bot** لإدارة إعدادات البوت.\n\n" +

        "**[` 4 `]** ㆍ إذا كان التوكن قد تم تسريبه، قم بإعادة تعيينه بدلًا من مشاركته.\n\n" +

        "**[` 5 `]** ㆍ ضع التوكن الجديد في متغير البيئة باسم:\n" +
        "```env\nDISCORD_TOKEN=توكن_البوت_هنا\n```\n\n" +

        "🔒 **لا ترسل التوكن في السيرفر أو الخاص أو لأي شخص.**"
      )
      .addFields({
        name: "🎥 فيديو شرح",
        value: "[▶️ اضغط هنا لمشاهدة شرح الحصول على التوكن](https://youtu.be/p-iK_tiCqcU)"
      })
      .setFooter({
        text: "🌙 YassinAli Noor"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

  } catch (error) {
    console.error("❌ خطأ في /tokn:", error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ حصل خطأ أثناء تنفيذ الأمر.",
        ephemeral: true
      });
    }
  }
}