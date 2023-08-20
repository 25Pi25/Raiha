import { ChatInputCommandInteraction, Client, CommandInteractionOptionResolver, GuildMember, User } from 'discord.js';
import rank from './commands/rank';
import leaderboard from './commands/leaderboard';
import loserboard from './commands/loserboard';
import deleteAltMessage from './commands/deleteAltMessage';
import set from './commands/set';
import showEmbed from './commands/showEmbed';

export default {
  rank,
  leaderboard,
  loserboard,
  delete: deleteAltMessage,
  set,
  help: showEmbed,
  why: showEmbed,
  about: showEmbed
} satisfies CommandModule as CommandModule;

interface CommandModule {
  [key: string]: (interaction: ChatInputCommandInteraction, options: OptionalCommandArguments) => void
}

export interface OptionalCommandArguments {
  commandName: string;
  options: Omit<CommandInteractionOptionResolver, 'getMessage' | 'getFocused'>;
  user: User;
  member: GuildMember
}