import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { OptionalCommandArguments } from '../commands';
import { getAllowedMentions, helpText, whyText } from '../misc/misc';
import { VERSION } from '../raiha';

export default async function (interaction: ChatInputCommandInteraction, { commandName }: OptionalCommandArguments) {
  const embed = selectEmbed(commandName as InfoEmbeds)
  await interaction.reply({ embeds: [embed], allowedMentions: getAllowedMentions() });
}

export type InfoEmbeds = 'help' | 'why' | 'about';
export function selectEmbed(embedType: InfoEmbeds) {
  switch (embedType) {
    case 'help':
      return new EmbedBuilder()
        .setTitle("Raiha Help")
        .setDescription(helpText)
        .setColor(0xd797ff);
    case 'why':
      return new EmbedBuilder()
        .setTitle("Why Use Alt Text?")
        .setDescription(whyText)
        .setURL("https://moz.com/learn/seo/alt-text")
        .setColor(0xd797ff);
    case 'about':
    default:
      return new EmbedBuilder()
        .setTitle("Raiha Accessibility Bot")
        .setDescription(`Version: ${VERSION}\nAuthor: <@248600185423396866>`)
        .setURL("https://github.com/9vult/Raiha")
        .setColor(0xd797ff);
  }
}