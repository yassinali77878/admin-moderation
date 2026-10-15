import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("كتم عضو")
  .addUserOption(option =>
    option
      .setName("member")
      .setDescription("العضو المطلوب كتمه")
      .setRequired(true)
  )
  .addStringOption(option =>
    option
      .setName("reason")
      .setDescription("سبب الكتم")
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export async function execute(interaction) {

  if (!interaction.memberPermissions.has(
    PermissionFlagsBits.ManageRoles
  )) {
    return interaction.reply({
      content: "❌ ليس لديك صلاحية استخدام أمر الميوت.",
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
      content: "❌ لا يمكنك عمل Mute لنفسك.",
      ephemeral: true
    });
  }

  if (member.user.bot) {
    return interaction.reply({
      content: "❌ لا يمكن عمل Mute لبوت.",
      ephemeral: true
    });
  }

  if (!member.manageable) {
    return interaction.reply({
      content:
        "❌ لا أستطيع كتم هذا العضو.\n" +
        "تأكد أن رتبة البوت أعلى من رتبة العضو.",
      ephemeral: true
    });
  }

  try {

    let muteRole = interaction.guild.roles.cache.find(
      role => role.name === "Muted"
    );

    // إنشاء رتبة Muted إذا لم تكن موجودة
    if (!muteRole) {

      if (!interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.ManageRoles
      )) {
        return interaction.reply({
          content:
            "❌ البوت لا يمتلك صلاحية **Manage Roles** لإنشاء رتبة Muted.",
          ephemeral: true
        });
      }

      muteRole = await interaction.guild.roles.create({
        name: "Muted",
        reason: "إنشاء رتبة الميوت تلقائيًا بواسطة YassinAli Bot"
      });

      // منع الكتابة والتحدث في الرومات الموجودة
      const channels = interaction.guild.channels.cache;

      for (const [, channel] of channels) {

        if (
          channel.type === ChannelType.GuildText ||
          channel.type === ChannelType.GuildAnnouncement ||
          channel.type === ChannelType.GuildVoice ||
          channel.type === ChannelType.GuildStageVoice
        ) {

          await channel.permissionOverwrites.edit(
            muteRole,
            {
              SendMessages: false,
              AddReactions: false,
              Speak: false
            }
          ).catch(() => {});
        }
      }
    }

    // التأكد أن العضو ليس مكتومًا بالفعل
    if (member.roles.cache.has(muteRole.id)) {
      return interaction.reply({
        content: "ℹ️ هذا العضو مكتوم بالفعل.",
        ephemeral: true
      });
    }

    await member.roles.add(
      muteRole,
      reason
    );

    await interaction.reply({
      content:
        `🔇 تم كتم ${member} بنجاح.\n\n` +
        `📝 السبب: **${reason}**\n` +
        `👮 بواسطة: ${YassinAliNoor}
                            لانك تخطيت نظام الحمايه`
    });

  } catch (error) {

    console.error("Mute Error:", error);

    await interaction.reply({
      content:
        "❌ حدث خطأ أثناء كتم العضو.\n" +
        "تأكد أن البوت يمتلك **Manage Roles** وأن رتبته أعلى من رتبة Muted.",
      ephemeral: true
    });
  }
}