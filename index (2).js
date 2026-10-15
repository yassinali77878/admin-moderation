import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  REST,
  Routes,
  ActivityType,
  ChannelType,
  EmbedBuilder,
  PermissionsBitField
} from "discord.js";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commandsPath = path.join(__dirname, "commands");

const CREATE_VOICE_CHANNEL_ID = "1542161899192455248";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

client.commands = new Collection();
client.prayerSettings = new Map();
client.autoModSettings = new Map();
client.adhkarSettings = new Map();
client.tempVoiceRooms = new Map();

const spamTracker = new Map();
const sentPrayerNotifications = new Set();

const prayerNames = {
  Fajr: "الفجر 🌙",
  Dhuhr: "الظهر 🕌",
  Asr: "العصر 🌤️",
  Maghrib: "المغرب 🌅",
  Isha: "العشاء 🌙"
};

const adhkar = [
  "سبحان الله",
  "الحمد لله",
  "الله أكبر",
  "لا إله إلا الله",
  "سبحان الله وبحمده",
  "سبحان الله العظيم",
  "أستغفر الله وأتوب إليه",
  "لا حول ولا قوة إلا بالله",
  "اللهم صل وسلم على نبينا محمد",
  "رب اغفر لي وتب علي إنك أنت التواب الرحيم"
];

// =========================
// 🕌 مواقيت الصلاة والأذكار
// =========================

async function getPrayerTimes(city, country) {
  try {
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=5`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data || data.code !== 200 || !data.data || !data.data.timings) throw new Error("خطأ في البيانات");
    return data.data;
  } catch (error) {
    console.error("❌ خطأ في جلب مواقيت الصلاة:", error.message);
    return null;
  }
}

function getEgyptTime() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(now);

  const hour = parts.find(p => p.type === "hour")?.value || "00";
  const minute = parts.find(p => p.type === "minute")?.value || "00";
  const second = parts.find(p => p.type === "second")?.value || "00";

  return { hour, minute, second, time: `${hour}:${minute}` };
}

function getEgyptDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date());
}

async function checkPrayerTimes() {
  if (client.prayerSettings.size === 0) return;
  const current = getEgyptTime();
  const today = getEgyptDate();

  for (const [guildId, settings] of client.prayerSettings) {
    try {
      if (!settings?.city || !settings?.country || !settings?.channelId) continue;
      const prayerData = await getPrayerTimes(settings.city, settings.country);
      if (!prayerData) continue;

      const timings = prayerData.timings;
      for (const [prayerKey, prayerName] of Object.entries(prayerNames)) {
        if (!timings[prayerKey]) continue;
        const prayerTime = timings[prayerKey].replace(/\s*\([^)]*\)/g, "").trim().slice(0, 5);

        if (prayerTime !== current.time) continue;
        const notificationKey = `${guildId}-${today}-${prayerKey}`;
        if (sentPrayerNotifications.has(notificationKey)) continue;

        sentPrayerNotifications.add(notificationKey);
        const guild = client.guilds.cache.get(guildId);
        if (!guild) continue;
        const channel = guild.channels.cache.get(settings.channelId);
        if (!channel || !channel.isTextBased()) continue;

        const embed = new EmbedBuilder()
          .setTitle(`🕌 حان الآن وقت صلاة ${prayerName}`)
          .setDescription(`🔔 حان الآن موعد صلاة **${prayerName}**.\n\n📍 **المدينة:** ${settings.city}\n🌍 **الدولة:** ${settings.country}\n🕐 **الوقت:** ${prayerTime}\n\n🤲 تقبل الله منا ومنكم صالح الأعمال.`)
          .setFooter({ text: "YassinAli Noor 🌙 • Prayer System" })
          .setTimestamp();

        await channel.send({ content: "@everyone", embeds: [embed], allowedMentions: { parse: ["everyone"] } });
      }
    } catch (error) {
      console.error(`❌ خطأ في فحص الصلاة للسيرفر ${guildId}:`, error.message);
    }
  }
}

setInterval(checkPrayerTimes, 60 * 1000);

async function sendAutomaticAdhkar() {
  if (client.adhkarSettings.size === 0) return;
  for (const [guildId, settings] of client.adhkarSettings) {
    try {
      if (!settings?.channelId) continue;
      const guild = client.guilds.cache.get(guildId);
      if (!guild) continue;
      const channel = guild.channels.cache.get(settings.channelId);
      if (!channel || !channel.isTextBased()) continue;

      const dhikr = adhkar[Math.floor(Math.random() * adhkar.length)];
      const embed = new EmbedBuilder()
        .setTitle("🤲 ذكر من أذكار الله")
        .setDescription(`> **${dhikr}**\n\n🌙 **YassinAli Noor**`)
        .setFooter({ text: "🤍 تذكير بذكر الله" })
        .setTimestamp();

      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error(`❌ خطأ في إرسال الأذكار:`, error.message);
    }
  }
}

setInterval(sendAutomaticAdhkar, 60 * 1000);

// =========================
// 🎤 الرومات الصوتية التلقائية
// =========================

client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  try {
    const guild = newState.guild;
    if (!guild || newState.member?.user.bot) return;

    const createVoiceChannel = guild.channels.cache.get(CREATE_VOICE_CHANNEL_ID);

    if (createVoiceChannel && newState.channelId === createVoiceChannel.id && oldState.channelId !== newState.channelId) {
      const member = newState.member;
      if (!member) return;

      const oldRoomId = client.tempVoiceRooms.get(member.id);
      if (oldRoomId) {
        const oldRoom = guild.channels.cache.get(oldRoomId);
        if (oldRoom) {
          await member.voice.setChannel(oldRoom).catch(() => {});
          return;
        }
        client.tempVoiceRooms.delete(member.id);
      }

      const room = await guild.channels.create({
        name: `🔊・${member.displayName}`,
        type: ChannelType.GuildVoice,
        parent: createVoiceChannel.parentId || null,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect]
          },
          {
            id: member.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.Connect,
              PermissionsBitField.Flags.Speak,
              PermissionsBitField.Flags.Stream,
              PermissionsBitField.Flags.UseVAD,
              PermissionsBitField.Flags.MoveMembers,
              PermissionsBitField.Flags.ManageChannels
            ]
          }
        ]
      });

      client.tempVoiceRooms.set(member.id, room.id);
      await member.voice.setChannel(room).catch(() => {});
    }

    const oldChannel = oldState.channel;
    if (oldChannel && oldChannel.type === ChannelType.GuildVoice) {
      const ownerEntry = [...client.tempVoiceRooms.entries()].find(([, channelId]) => channelId === oldChannel.id);
      if (ownerEntry && oldChannel.members.size === 0) {
        const [ownerId] = ownerEntry;
        client.tempVoiceRooms.delete(ownerId);
        await oldChannel.delete().catch(() => {});
      }
    }
  } catch (error) {
    console.error("❌ خطأ في نظام الرومات الصوتية:", error);
  }
});

// =========================
// 🛡️ AutoMod & Auto Reactions
// =========================

client.on(Events.MessageCreate, async message => {
  try {
    if (!message.guild || message.author.bot) return;

    // 🤖 إضافة رياكشن عند المنشن لكل الأعضاء (everyone)
    if (message.mentions.everyone) {
      await message.react("🤖").catch(() => {});
    }

    const settings = client.autoModSettings.get(message.guild.id);
    if (!settings?.enabled) return;

    const content = message.content.toLowerCase();

    // حظر منشن everyone/here من قبل الأعضاء (لو الخيار مفعل في AutoMod)
    if (content.includes("@everyone") || content.includes("@here")) {
      await message.delete().catch(() => {});
      return;
    }

    if (/(https?:\/\/|www\.)\S+/i.test(message.content)) {
      await message.delete().catch(() => {});
      return;
    }

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    let messages = (spamTracker.get(key) || []).filter(t => now - t < 5000);
    messages.push(now);
    spamTracker.set(key, messages);

    if (messages.length >= 5) {
      await message.delete().catch(() => {});
      spamTracker.delete(key);
    }
  } catch (error) {
    console.error("❌ خطأ في AutoMod:", error.message);
  }
});

// =========================
// 📂 تحميل وتسجيل الأوامر العامة (Global Registration)
// =========================

async function registerCommands() {
  const token = process.env.TOKEN || process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token || !clientId) {
    console.error("❌ بيانات .env غائبة! تأكد من وجود TOKEN و CLIENT_ID");
    return;
  }

  if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath, { recursive: true });
  }

  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));
  const uniqueCommandsMap = new Map();

  for (const file of commandFiles) {
    try {
      const command = await import(`./commands/${file}?update=${Date.now()}`);
      if (!command.data || !command.execute) continue;

      const commandName = command.data.name;

      if (uniqueCommandsMap.has(commandName)) {
        console.warn(`⚠️ تم تجاهل الملف المكرر "${file}" لأن الأمر "${commandName}" مسجل مسبقاً.`);
        continue;
      }

      client.commands.set(commandName, command);
      uniqueCommandsMap.set(commandName, command.data.toJSON());
    } catch (error) {
      console.error(`❌ خطأ في تحميل ${file}:`, error);
    }
  }

  const rest = new REST({ version: "10" }).setToken(token);
  const commandsList = Array.from(uniqueCommandsMap.values());

  try {
    console.log("🌐 جاري تسجيل أوامر السلاش العامة (Global Commands)...");

    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commandsList }
    );

    console.log(`✅ تم تسجيل ${commandsList.length} أمر عام بنجاح!`);
  } catch (error) {
    console.error("❌ خطأ في تسجيل أوامر السلاش:", error);
  }
}

// =========================
// 🎯 Interaction Handler
// =========================

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`❌ خطأ في تنفيذ /${interaction.commandName}:`, error);
      const replyOptions = { content: "❌ حدث خطأ أثناء تنفيذ الأمر.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply(replyOptions).catch(() => {});
      } else {
        await interaction.reply(replyOptions).catch(() => {});
      }
    }
  }
});

// =========================
// 🟢 التشغيل
// =========================

client.once(Events.ClientReady, async readyClient => {
  console.log(`🌙 ${readyClient.user.tag} Online!`);
  await registerCommands();
});

const botToken = process.env.TOKEN || process.env.DISCORD_TOKEN;
if (!botToken) {
  console.error("❌ TOKEN غير موجود داخل ملف .env");
  process.exit(1);
}

client.login(botToken);