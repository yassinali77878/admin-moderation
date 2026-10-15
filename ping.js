import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("معرفة سرعة استجابة البوت");

export async function execute(interaction) {
  await interaction.reply(`👋 هلا ${interaction.client.ws.ping}ms`);
}