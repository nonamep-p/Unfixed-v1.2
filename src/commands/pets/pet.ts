import { Message, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../../database/connection';
import { config } from '../../config';

export const name = 'pet';
export const description = 'Manage your loyal pet companions';
export const aliases = ['companion', 'familiar'];
export const cooldown = 5;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);

    if (!player) {
        const embed = new EmbedBuilder()
            .setColor(config.colors.warning)
            .setTitle('🧀 Not Registered')
            .setDescription('You need to start your adventure first! Use `$startrpg` to begin.')
            .setFooter({ text: 'Plagg: "You need to exist before you can have pets!"' });

        await message.reply({ embeds: [embed] });
        return;
    }

    const embed = new EmbedBuilder()
        .setColor(config.colors.success)
        .setTitle('🐾 Pet Companions')
        .setDescription('*The pet system is being trained as we speak! Soon you\'ll have loyal companions to join your adventures.*')
        .addFields(
            { name: '🎾 Coming Soon', value: 'Tame wild creatures\nTrain and evolve pets\nPet battles\nCompanion abilities', inline: false },
            { name: '📊 Your Level', value: `Level ${player.level}`, inline: true }
        )
        .setFooter({ text: 'Plagg: "I\'m technically a pet... sort of. Just don\'t tell Adrien!"' });

    await message.reply({ embeds: [embed] });
}