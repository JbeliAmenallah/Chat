const express = require('express');
const router = express.Router();
const { ChatRoom, Message, User } = require('../models/models');

router.get('/chatrooms/:roomId/messages', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const chatRoom = await ChatRoom.findById(roomId).populate('messages');
        if (!chatRoom) {
            return res.status(404).json({ error: 'Chat room not found' });
        }
        res.json(chatRoom.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/chatrooms/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const chatRooms = await ChatRoom.find({ participants: user._id });
        res.json(chatRooms);
    } catch (error) {
        console.error('Error fetching chat rooms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.patch('/messages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { newContent, username } = req.body;

        // Find the message by ID
        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Ensure the sender is the one who created the message
        const senderUser = await User.findOne({ username });
        if (!senderUser || message.sender.toString() !== senderUser._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to edit this message' });
        }

        // Update the message content
        message.message = newContent;
        await message.save();

        // Find the chat room
        const chatRoom = await ChatRoom.findOne({
            participants: { $all: [message.sender, message.recipient] },
        });

        // Emit the updated message to all clients in the chat room
        io.to(chatRoom.name).emit("messageEdited", {
            messageId: message._id,
            newContent,
            sender: senderUser.username,
        });

        res.json(message);
    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
