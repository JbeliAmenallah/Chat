const express = require('express');
const router = express.Router();
const { ChatRoom } = require('../models/models');
const { User } = require('../models/models');

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
        const user = await User.findOne({ username }); // Find the user by username
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
module.exports = router;