const mySocket = (socket) => {
    socket.on('identify', username => {
        socket.username = username;
    });
}

module.exports = mySocket;