const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve files from the "public" folder
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // EVENT 1: Handle Subscription
    socket.on('subscribe', (topic) => {
        socket.join(topic);
        console.log(`User ${socket.id} joined topic: ${topic}`);
        // Optional: Tell the user they successfully subscribed
        socket.emit('system_message', `You are now subscribed to ${topic}`);
    });

    // EVENT 2: Handle Unsubscription
    socket.on('unsubscribe', (topic) => {
        socket.leave(topic);
        console.log(`User ${socket.id} left topic: ${topic}`);
        socket.emit('system_message', `You unsubscribed from ${topic}`);
    });

    // EVENT 3: Handle Publishing (The "News" sending part)
    socket.on('publish_news', (data) => {
        const { topic, message } = data;
        
        console.log(`New Alert on [${topic}]: ${message}`);

        // Broadcast ONLY to people in that specific topic room
        io.to(topic).emit('notification', {
            topic: topic,
            text: message,
            timestamp: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('--------------------------------------');
    console.log('BROKER RUNNING ON http://localhost:3000');
    console.log('--------------------------------------');
});