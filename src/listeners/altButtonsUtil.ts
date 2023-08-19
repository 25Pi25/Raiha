import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export const altTextButtons = new ActionRowBuilder<ButtonBuilder>()
  .addComponents(
    new ButtonBuilder()
      .setCustomId('applyText')
      .setLabel("Apply Alt Text")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('why')
      .setEmoji('❔')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('remove')
      .setEmoji('✖')
      .setStyle(ButtonStyle.Danger),
  )

export function getAltTextModal(alts: number) {
  return new ModalBuilder()
    .setCustomId('applyAltText')
    .setTitle("Apply Alt Text")
    .addComponents(new ActionRowBuilder<TextInputBuilder>()
      .addComponents(
        ...Array.from({ length: alts }, (_, altNum) =>
          new TextInputBuilder()
            .setCustomId(altNum.toString())
            .setLabel(`Alt Text ${altNum + 1}`)
            .setMaxLength(1000)
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
        )
      ))
}
