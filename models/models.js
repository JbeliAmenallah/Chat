const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    chatRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ChatRoom' }]
});

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    createdAt: { type: Date, default: Date.now },
});

const chatRoomSchema = new mongoose.Schema({
    name: String,
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the User model
    }],
     messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);
const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = { User, Message, ChatRoom };