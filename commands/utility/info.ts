
import { Message, EmbedBuilder } from 'discord.js';
import { version } from '../../package.json';

export const name = 'info';
export const description = 'Display bot information and statistics';
export const aliases = ['about', 'version'];
export const cooldown = 10;

export async function execute(message: Message, args: string[]) {
    const embed = new EmbedBuilder()
        .setTitle('🧀 Plagg Bot Ultimate Edition')
        .setDescription('*The most chaotic and cheese-obsessed RPG bot in existence!*')
        .setColor('#9400D3')
        .addFields(
            { name: '📊 Version', value: `v${version || '1.0.0'}`, inline: true },
            { name: '⚡ Node.js', value: process.version, inline: true },
            { name: '🤖 Discord.js', value: 'v14', inline: true },
            { name: '⏱️ Uptime', value: formatUptime(process.uptime()), inline: true },
            { name: '💾 Memory', value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`, inline: true },
            { name: '🏟️ Servers', value: `${message.client.guilds.cache.size}`, inline: true },
            { name: '👥 Users', value: `${message.client.users.cache.size}`, inline: true },
            { name: '🎮 Commands', value: '50+ RPG Commands', inline: true },
            { name: '🧀 Cheese Level', value: 'Maximum!', inline: true }
        )
        .setThumbnail(message.client.user?.displayAvatarURL())
        .setFooter({ text: 'Plagg: "Impressive stats! Almost as good as my cheese collection."' });
    
    await message.reply({ embeds: [embed] });
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor(seconds % 86400 / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
