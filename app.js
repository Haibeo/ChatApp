const express = require('express');
const app = express();
const Server = require('http').createServer(app);
const io = require('socket.io')(Server, {
    cors: {
        origin: "*"
    }
});

const AppRouter = require('./Route/AppRouter');
const mongoose = require('mongoose');
const cors = require('cors');



const mongoUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myDb';
const port = process.env.PORT || 3000;

//CORS
app.use(
    cors({
        origin: "*"
    })
)


app.use(express.urlencoded({extended: true}));
app.use(express.json());



app.use('/', AppRouter);


mongoose.connect(mongoUrl)
.then(res => {
    console.log('Database connected!');
})
.catch(err => {
    console.log('Database connection failed!');
})


Server.listen(3000, () => {
    console.log('Server is running!');
});




const onlineUsers = {};
const availableRooms = {};

io.on('connection', socket => {
    socket.on('identify', username => {
        socket.username = username;
        onlineUsers[username] = socket.id;
        io.emit('send-list', onlineUsers);
        io.emit('send-rooms', availableRooms);
    });

    socket.on('disconnecting', () => {
        let change = false;
        delete onlineUsers[socket.username];
        for(let room of socket.rooms){
            if(availableRooms.hasOwnProperty(room)){
                availableRooms[room]--;
                if(availableRooms[room] == 0){
                    delete availableRooms[room];
                    change = true;
                }
            }
        }
        io.emit('send-list', onlineUsers);
        if(change){
            io.emit('send-rooms', availableRooms);
        }
    });

    socket.on('send-room-message', (message, roomId) => {
        if(roomId == 'General'){
            socket.broadcast.emit('receive-room-message', socket.username, message, roomId);
        }else{
            socket.to(roomId).emit('receive-room-message', socket.username, message, roomId);
        }
    });

    socket.on('send-private-message', (message, userId) => {
        socket.to(userId).emit('receive-private-message', socket.username, message, socket.id);
    });

    socket.on('create-room', roomName => {
        availableRooms[roomName] = 1;
        socket.join(roomName);
        io.emit('send-rooms', availableRooms);
    });

    socket.on('join-room', roomName => {
        socket.join(roomName);
        availableRooms[roomName]++;
    });

    socket.on('leave-room', roomName => {
        availableRooms[roomName]--;
        if(availableRooms[roomName] == 0){
            delete availableRooms[roomName];
            io.emit('send-rooms', availableRooms);
        }
        socket.leave(roomName);
        io.to(roomName).emit(`${socket.username} has left the room.`);
    })
});