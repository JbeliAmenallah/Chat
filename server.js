const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors'); // Import the cors middleware
const mongoose = require("mongoose");
const { User, Message, ChatRoom } = require("./models/models"); // Adjust the path as needed
const chatRoutes = require('./routes/routes');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200", // Allow requests from your Angular app
    methods: ["GET", "POST"], // Specify the methods allowed
    credentials: true, // Allow credentials
  },
});

mongoose
  .connect("mongodb://localhost:27017/chatApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("join", async ({ username, recipient }) => {
    try {
      // Check if users exist in the database
      let [user1, user2] = await Promise.all([
        User.findOne({ username }),
        User.findOne({ username: recipient }),
      ]);

      // If users don't exist, create them
      if (!user1) {
        user1 = await User.create({ username });
      }
      if (!user2) {
        user2 = await User.create({ username: recipient });
      }

      // Check if chat room exists, if not create one
      let chatRoom = await ChatRoom.findOne({
        participants: { $all: [user1._id, user2._id] },
      }).populate("messages"); // Populate messages to get old messages

      if (!chatRoom) {
        chatRoom = await ChatRoom.create({
          name: `${user1.username}-${user2.username}`,
          participants: [user1._id, user2._id],
        });
      }

      // Emit old messages to the user
      socket.emit("oldMessages", chatRoom.messages);

      // Update users' chatRooms arrays with chat room ID
      if (user1) {
        user1.chatRooms.push(chatRoom._id);
        await user1.save();
      }
      if (user2) {
        user2.chatRooms.push(chatRoom._id);
        await user2.save();
      }

      socket.join(chatRoom.name);
      console.log(`${user1.username} joined the chat with ${user2.username}`);
      // **Added Notification for Join Event**
      io.to(chatRoom.name).emit("notification", `${user1.username} has joined the chat`);
    } catch (error) {
      console.error("Error joining chat:", error);
      // Handle error appropriately, such as emitting an error event to the client
    }
  });

  socket.on("message", async ({ message, sender, recipient }) => {
    try {
        // Find sender and recipient in the database
        const [senderUser, recipientUser] = await Promise.all([
            User.findOne({ username: sender }),
            User.findOne({ username: recipient }),
        ]);

        // Create message in the database with _id generated automatically
        const newMessage = await Message.create({
            sender: senderUser._id,
            recipient: recipientUser._id,
            message,
        });

        // Add the message to the chat room
        const chatRoom = await ChatRoom.findOne({
            participants: { $all: [senderUser._id, recipientUser._id] },
        });

        chatRoom.messages.push(newMessage);
        await chatRoom.save();

        // Update users' chatRooms arrays with chat room ID
        senderUser.chatRooms.push(chatRoom._id);
        recipientUser.chatRooms.push(chatRoom._id);
        await Promise.all([senderUser.save(), recipientUser.save()]);

        // Emit the new message to the chat room with its generated _id
        io.to(chatRoom.name).emit("message", {
            _id: newMessage._id, // Include the _id field
            message: newMessage.message,
            sender: senderUser.username,
        });

        // Emit notification of new message
        io.to(chatRoom.name).emit("notification", `New message from ${sender}`);

    } catch (error) {
        console.error("Error sending message:", error);
        // Handle error appropriately, such as emitting an error event to the client
    }
});
  socket.on("editMessage", async ({ messageId, newContent, sender }) => {
    try {
      console.log("Received editMessage request");
      console.log("Message ID:", messageId);
      console.log("New content:", newContent);
      console.log("Sender:", sender);

      const message = await Message.findById(messageId);
      console.log("Retrieved message:", message);

      if (!message) {
        console.log("Message not found");
        return socket.emit("error", "Message not found");
      }

      const senderUser = await User.findOne({ username: sender });
      if (!senderUser || message.sender.toString() !== senderUser._id.toString()) {
        console.log("Not authorized to edit this message");
        return socket.emit("error", "Not authorized to edit this message");
      }

      message.message = newContent;
      await message.save();

      console.log("Message content updated successfully");

      const chatRoom = await ChatRoom.findOne({
        participants: { $all: [message.sender, message.recipient] },
      });

      console.log("Chat room found:", chatRoom);

      io.to(chatRoom.name).emit("messageEdited", {
        messageId: message._id,
        newContent,
        sender: senderUser.username,
      });
      io.to(chatRoom.name).emit("notification", `${sender} has Edited Their Message`);

      console.log("Message edited event emitted");

    } catch (error) {
      console.error("Error editing message:", error);
      socket.emit("error", "An error occurred while editing the message");
    }
  });
  // Server-side code
  // Server-side code
  socket.on("typing", ({ sender, recipient, isTyping }) => {
    console.log(`${sender} is typing to ${recipient}`);
    io.to(recipient).emit("typing", { sender, recipient, isTyping });
    console.log("Typing event emitted to recipient:", recipient);
  });
  

  

  
      
  
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
    
});

app.use(express.json());
app.use(cors()); // Use the cors middleware
// Routes
app.use('/api', chatRoutes);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
