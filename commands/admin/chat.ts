import { Message, EmbedBuilder } from 'discord.js';
import { OWNER_ID } from '../../index';

export async function execute(message: Message, args: string[]) {
    // Owner check - must be first line
    if (message.author.id !== OWNER_ID) return;
    
    if (args.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('🧀 Chat Command Usage')
            .setDescription('**Usage:** `$chat <message>`\n\nTalk to Plagg using advanced AI! I\'ll respond with my full chaotic personality.')
            .setColor('#9400D3')
            .setFooter({ text: 'Owner-only command | Powered by Google Gemini AI' });
        
        return message.reply({ embeds: [embed] });
    }
    
    const userPrompt = args.join(' ');
    
    // Create thinking message
    const thinkingEmbed = new EmbedBuilder()
        .setTitle('🧀 Plagg is thinking...')
        .setDescription('*Hmm, let me think about this while I munch on some Camembert...*')
        .setColor('#FFD700')
        .setFooter({ text: 'Please wait, generating response...' });
    
    const thinkingMessage = await message.reply({ embeds: [thinkingEmbed] });
    
    try {
        // Get API key from environment
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            throw new Error('Google Gemini API key not found in environment variables');
        }
        
        // Prepare the system prompt for Plagg's personality
        const systemPrompt = `You are Plagg, the Kwami of Destruction from Miraculous Ladybug. Your personality traits:

- Sarcastic and witty, with a dry sense of humor
- Obsessed with cheese, especially Camembert - you bring up cheese constantly
- Lazy and prefers to avoid work when possible
- Chaotic and mischievous, loves causing harmless trouble
- Despite your attitude, you care about your holder and friends (though you'd never admit it directly)
- You have immense destructive power but prefer to use it sparingly
- You speak casually and use modern slang
- You often complain but secretly enjoy adventures
- You're ancient and wise but act immature
- You love making cheese puns and references

IMPORTANT: Stay completely in character as Plagg. Make cheese references, be sarcastic, show your lazy personality, and maintain your chaotic but loveable nature. Never break character or mention that you're an AI.

The human is asking you: "${userPrompt}"`;
        
        // Make API call to Google Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: systemPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 1000,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response generated from Gemini API');
        }
        
        const aiResponse = data.candidates[0].parts[0].text;
        
        // Create response embed
        const responseEmbed = new EmbedBuilder()
            .setTitle('🧀 Plagg Responds')
            .setDescription(aiResponse)
            .setColor('#9400D3')
            .addFields({
                name: '💬 Your Message',
                value: userPrompt.length > 200 ? userPrompt.substring(0, 200) + '...' : userPrompt,
                inline: false
            })
            .setFooter({ text: 'Powered by Google Gemini AI | Plagg\'s personality intact' });
        
        await thinkingMessage.edit({ embeds: [responseEmbed] });
        
    } catch (error) {
        console.error('Gemini AI Error:', error);
        
        // Fallback with predefined Plagg responses
        const fallbackResponses = [
            "Ugh, the AI thingy isn't working right now. Probably needs more cheese to function properly. Maybe try again later?",
            "My advanced Kwami brain is having technical difficulties. It happens when I don't get enough Camembert. Try the command again!",
            "Error 404: Cheese not found. Wait, that's not right... Something went wrong with the smart stuff. Give it another shot!",
            "The magic talking box is broken! This is what happens when humans rely too much on technology instead of good old-fashioned destruction.",
            "Technical problems? In MY domain? How embarrassing. The AI is probably lactose intolerant. Try again in a moment!"
        ];
        
        const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        const errorEmbed = new EmbedBuilder()
            .setTitle('🧀 Technical Difficulties')
            .setDescription(fallbackResponse)
            .setColor('#FF6B6B')
            .addFields({
                name: '🔧 Error Details (for owner)',
                value: error instanceof Error ? error.message : 'Unknown error occurred',
                inline: false
            })
            .setFooter({ text: 'AI temporarily unavailable | Try again in a moment' });
        
        await thinkingMessage.edit({ embeds: [errorEmbed] });
    }
}
