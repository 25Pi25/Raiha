import { Message, ModalSubmitInteraction } from "discord.js";
import { ServerValue } from "firebase-admin/database";
import { db } from "../raiha";
import { altTextButtons, getAltTextModal } from "./altButtonsUtil";
import { postAltText } from "./messageCreate";
import { getImages } from "./messageUtil";

export async function startApplyTextListener(message: Message<true>) {
  const buttonsMessage = await message.reply({ components: [altTextButtons] });

  const collector = buttonsMessage.createMessageComponentCollector({
    filter: ({ customId }) => customId == 'applyText',
    time: 300_000
  })
  collector.on('end', () => {
    buttonsMessage.delete().catch(() => console.error("Could not delete buttons."));
  })

  collector.on('collect', async interaction => {
    await interaction.showModal(getAltTextModal(getImages(message).length));
    const modal = await interaction.awaitModalSubmit({
      filter: ({ customId, user: { id } }) => customId == 'applyAltText' && interaction.user.id == id,
      time: 300_000
    }).catch(() => null);
    if (!modal) return;
    handleModalSubmit(message, buttonsMessage, modal)
  })
}

async function handleModalSubmit(message: Message<true>, buttonsMessage: Message<true>, interaction: ModalSubmitInteraction) {
  const alts = Array.from(interaction.fields.fields.values()).map(x => x.value as string);
  const success = await postAltText(message, message, alts, message.content, interaction.user.id);
  if (!success) return;
  if (interaction.user.id == message.author.id) {
    await db.ref(`/Leaderboard/Loserboard/`)
      .child(message.author.id)
      .set(ServerValue.increment(-1));
  }
  try {
    await buttonsMessage.delete();
    await interaction.reply({ content: "Successfully applied alt text!", ephemeral: true });
  } catch {
    await interaction.reply({ content: "Could not delete the messages.", ephemeral: true });
  }
}