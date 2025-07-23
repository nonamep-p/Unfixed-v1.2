
import { Message, EmbedBuilder } from 'discord.js';

export const name = 'ping';
export const description = 'Check bot responsiveness and latency';
export const aliases = ['latency'];
export const cooldown = 5;

export async function execute(message: Message, args: string[]) {
    const sent = await message.reply('🧀 Pinging...');
    const ping = sent.createdTimestamp - message.createdTimestamp;
    
    const embed = new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor('#00FF00')
        .addFields(
            { name: '📶 Latency', value: `${ping}ms`, inline: true },
            { name: '💓 Heartbeat', value: `${Math.round(message.client.ws.ping)}ms`, inline: true }
        )
        .setFooter({ text: 'Plagg: "Fast as cheese melting in the sun!"' });
    
    await sent.edit({ content: '', embeds: [embed] });
}
