
import { Message, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { getPlayer } from '../../src/database/connection';

export const name = 'hunt';
export const description = 'Hunt specific types of monsters';
export const aliases = ['target', 'seek'];
export const cooldown = 5;

export async function execute(message: Message, args: string[]) {
    const player = await getPlayer(message.author.id);
    
    if (!player) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 No Character Found')
            .setDescription('Create a character first with `$startrpg`!')
            .setColor('#FF6B6B');
        
        return message.reply({ embeds: [embed] });
    }
    
    if (player.currentHealth <= 0) {
        const embed = new EmbedBuilder()
            .setTitle('💀 Too Weak to Hunt')
            .setDescription('You need to heal before hunting monsters!')
            .setColor('#FF0000');
        
        return message.reply({ embeds: [embed] });
    }
    
    const embed = new EmbedBuilder()
        .setTitle('🦌 Monster Hunting')
        .setDescription('*Choose your prey wisely! Different monsters offer different rewards and challenges.*')
        .setColor('#8B4513')
        .addFields(
            { name: '🐺 Available Hunts', value: 'Select a monster type to hunt from the dropdown below!', inline: false },
            { name: '❤️ Your Health', value: `${player.currentHealth}/${player.maxHealth}`, inline: true },
            { name: '📊 Your Level', value: `${player.level}`, inline: true }
        )
        .setFooter({ text: 'Plagg: "Good hunting! Try not to become the hunted."' });
    
    const huntSelect = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('hunt_monster_select')
                .setPlaceholder('Choose a monster to hunt...')
                .addOptions([
                    { label: 'Goblin Raiders', description: 'Weak but numerous (Level 1-5)', value: 'goblin', emoji: '👹' },
                    { label: 'Forest Wolves', description: 'Pack hunters (Level 3-8)', value: 'wolf', emoji: '🐺' },
                    { label: 'Stone Golems', description: 'Tough defenders (Level 5-12)', value: 'golem', emoji: '🗿' },
                    { label: 'Shadow Wraiths', description: 'Elusive spirits (Level 8-15)', value: 'wraith', emoji: '👻' },
                    { label: 'Fire Drakes', description: 'Dangerous dragons (Level 12-20)', value: 'drake', emoji: '🐉' },
                    { label: 'Random Encounter', description: 'Let fate decide your opponent!', value: 'random', emoji: '🎲' }
                ])
        );
    
    await message.reply({
        embeds: [embed],
        components: [huntSelect]
    });
}
