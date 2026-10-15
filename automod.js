import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";

// =========================
// 🛡️ أمر AutoMod
// =========================

export const data = new SlashCommandBuilder()
  .setName("automod")
  .setDescription("إدارة نظام الحماية AutoMod")

  // تشغيل
  .addSubcommand(subcommand =>
    subcommand
      .setName("on")
      .setDescription("تشغيل AutoMod")
  )

  // إيقاف
  .addSubcommand(subcommand =>
    subcommand
      .setName("off")
      .setDescription("إيقاف AutoMod")
  )

  // الحالة
  .addSubcommand(subcommand =>
    subcommand
      .setName("status")
      .setDescription("عرض حالة AutoMod")
  )

  .setDefaultMemberPermissions(
    PermissionFlagsBits.ManageGuild
  );

// =========================
// ⚙️ تنفيذ الأمر
// =========================

export async function execute(interaction) {
  if (!interaction.guild) {
    return interaction.reply({
      content:
        "❌ هذا الأمر يعمل داخل السيرفر فقط.",
      ephemeral: true
    });
  }

  const subcommand =
    interaction.options.getSubcommand();

  // =========================
  // 🟢 تشغيل AutoMod
  // =========================

  if (subcommand === "on") {
    interaction.client.autoModSettings.set(
      interaction.guild.id,
      {
        enabled: true
      }
    );

    const embed =
      new EmbedBuilder()
        .setTitle(
          "🛡️ AutoMod"
        )
        .setDescription(
          "🟢 **تم تشغيل AutoMod بنجاح!**\n\n" +
          "سيتم تطبيق قواعد الحماية تلقائيًا:\n\n" +
          "🔗 منع الروابط\n" +
          "📢 منع `@everyone` و `@here`\n" +
          "💬 منع الرسائل المتكررة بسرعة\n\n" +
          "🛡️ نظام الحماية يعمل الآن."
        )
        .setFooter({
          text:
            "YassinAli Noor 🌙 • AutoMod"
        })
        .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });

    console.log(
      `🛡️ تم تشغيل AutoMod في ${interaction.guild.name}`
    );

    return;
  }

  // =========================
  // 🔴 إيقاف AutoMod
  // =========================

  if (subcommand === "off") {
    interaction.client.autoModSettings.set(
      interaction.guild.id,
      {
        enabled: false
      }
    );

    const embed =
      new EmbedBuilder()
        .setTitle(
          "🛡️ AutoMod"
        )
        .setDescription(
          "🔴 **تم إيقاف AutoMod.**\n\n" +
          "لن يقوم النظام بحذف الروابط أو منع المنشن الجماعي أو كشف السبام."
        )
        .setFooter({
          text:
            "YassinAli Noor 🌙 • AutoMod"
        })
        .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });

    console.log(
      `🔴 تم إيقاف AutoMod في ${interaction.guild.name}`
    );

    return;
  }

  // =========================
  // 📊 حالة AutoMod
  // =========================

  if (subcommand === "status") {
    const settings =
      interaction.client.autoModSettings.get(
        interaction.guild.id
      );

    const enabled =
      settings?.enabled === true;

    const embed =
      new EmbedBuilder()
        .setTitle(
          "🛡️ حالة AutoMod"
        )
        .setDescription(
          enabled
            ? "🟢 **AutoMod يعمل حاليًا.**"
            : "🔴 **AutoMod متوقف حاليًا.**"
        )
        .addFields(
          {
            name: "🔗 الروابط",
            value: enabled
              ? "🟢 مفعلة"
              : "🔴 متوقفة",
            inline: true
          },
          {
            name: "📢 Everyone / Here",
            value: enabled
              ? "🟢 مفعلة"
              : "🔴 متوقفة",
            inline: true
          },
          {
            name: "💬 Anti-Spam",
            value: enabled
              ? "🟢 مفعل"
              : "🔴 متوقف",
            inline: true
          }
        )
        .setFooter({
          text:
            "YassinAli Noor 🌙 • AutoMod"
        })
        .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
}