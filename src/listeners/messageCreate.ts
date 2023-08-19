import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from "discord.js";
import { ServerValue } from 'firebase-admin/database';
import { getAllowedMentions, react, sendError } from '../misc/misc';
import { isMissingAltText, applyAltText, checkLoserboard, getAltsAndContent, verifyAltTexts, getImages } from './messageUtil';
import { db } from '../raiha';
import { startApplyTextListener } from "./altButtons";

export default async function (message: Message) {
  if (message.author.bot || !message.inGuild()) return;
  if (message.attachments.size) {
    if (await handleAttachments(message)) return;
    await db.ref(`/Leaderboard/Loserboard/`)
      .child(message.author.id)
      .set(ServerValue.increment(1));
    checkLoserboard(message.author.id, message.guild.id);
    startApplyTextListener(message);
  }
  else handleNoAttachments(message);
};

async function handleAttachments(message: Message<true>): Promise<boolean> {
  const noAltText = isMissingAltText(message);
  if (noAltText) {
    await react(message, 'ERR_MISSING_ALT_TEXT');
    return false;
  }
  // The message HAS attachments with alt text
  if (getImages(message).length) {
    await db.ref(`/Leaderboard/Native/`)
      .child(message.author.id)
      .set(ServerValue.increment(1));
    return true;
  }

  const { alts, content } = getAltsAndContent(message);
  // The user posted an image without alt text and did not call the bot :(
  if (!alts.length) return false;
  return await postAltText(message, message, alts, content);
}

async function handleNoAttachments(message: Message<true>) {
  // This message DOES NOT have attachments
  const { alts, content: replyContent } = getAltsAndContent(message);
  if (replyContent) return; // Reply trigger must be at start of message (if it exists)
  if (!message.reference) {
    // Trigger message is not a reply
    await react(message, 'ERR_NOT_REPLY');
    return;
  }
  // ----- THIS IS A REPLY TRIGGER (Scenario 2) -----
  // Get the parent (OP)
  const original = await message.channel.messages.fetch(message.reference.messageId!)
  if (!original || !isMissingAltText(original)) return;
  const { content } = getAltsAndContent(original);
  const successfulPost = await postAltText(message, original, alts, content);
  if (successfulPost && message.author.id == original.author.id) {
    await db.ref(`/Leaderboard/Loserboard/`)
      .child(message.author.id)
      .set(ServerValue.increment(-1));
  }
}

// Function that posts the original text with alt text, returns if the post was successful or not
export async function postAltText(
  message: Message<true>,
  original: Message<true>,
  altTexts: string[],
  content: string,
  altPoster = message.author.id
): Promise<boolean> {
  const isSameMessage = message == original;
  const isSameAuthor = altPoster == original.author.id;

  if (!verifyAltTexts(message, original, altTexts)) return false;

  // We have the correct number of alts
  const messageContent = {
    files: await applyAltText(original, altTexts),
    content: `_From <@${original.author.id}>${!isSameAuthor ? ` With alt text by <@${altPoster}>` : ""}` +
      `${content ? `:_\n\n${content}` : '._'}`,
    allowedMentions: getAllowedMentions(message.mentions)
  };

  // Send the message by its appropriate response
  const sentMessage = original.reference ?
    await original.reply(messageContent) :
    await original.channel.send(messageContent);

  try {
    await message.delete();
    if (!isSameMessage) await original.delete();
  } catch (err) {
    sendError(message.guild.id, "Could not delete", (err as Error).message, altPoster, message.url);
  }

  await db.ref(`/Actions/${message.guild.id}/${message.channel.id}/`)
    .child(sentMessage.id)
    .set({
      Alt: altPoster,
      OP: original.author.id,
      Parent: sentMessage.id,
      Request: content
    });
  await db.ref(`/Leaderboard/Raiha/`)
    .child(altPoster)
    .set(ServerValue.increment(1));
  await db.ref(`/Statistics/`)
    .child('Requests')
    .set(ServerValue.increment(1));
  return true;
}