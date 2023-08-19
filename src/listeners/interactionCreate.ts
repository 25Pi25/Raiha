import { ButtonInteraction, GuildMember, Interaction } from "discord.js";
import commands from '../commands';
import { selectEmbed } from "../commands/showEmbed";

export default async (interaction: Interaction) => {
  if (interaction.isChatInputCommand() && interaction.inGuild()) {
    const { commandName, options, user, member } = interaction;
    if (!(member instanceof GuildMember)) return; // if commands need to be used outside a server remove this guard
    commands[commandName]?.(interaction, { commandName, options, user, member });
  }
  else if (interaction.isButton()) handleButton(interaction);
};

async function handleButton(interaction: ButtonInteraction) {
  switch (interaction.customId) {
    case 'why':
      await interaction.reply({
        embeds: [selectEmbed('why')],
        ephemeral: true
      });
      break;
    case 'remove':
      await interaction.message.delete()
      .catch(() => console.error("Could not delete reply."));
      break;
  }
}