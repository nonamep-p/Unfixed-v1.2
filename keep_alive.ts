import express from 'express';

const app = express();
const port = parseInt(process.env.PORT as string) || 5000;

app.get('/', (req, res) => {
    res.json({
        status: 'alive',
        message: '🧀 Plagg Bot is running and causing chaos!',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        version: process.version
    });
});

export function keepAlive() {
    app.listen(port, '0.0.0.0', () => {
        console.log(`🌐 Keep-alive server is running on port ${port}`);
    });
}
