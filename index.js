var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Server listening at port %d", port);
});

var users = [];
var numUsers = 0;

io.on("connection", (socket) => {
    var addedUser = false;

    socket.on("new message", (data) => {
        socket.broadcast.emit("new message", {
            username: socket.username,
            message: data,
        });
    });

    socket.on("add user", (username) => {
        if (addedUser) return;
        socket.username = username;
        users[numUsers] = username;
        ++numUsers;
        addedUser = true;

        socket.broadcast.emit("user joined", {
            users: users,
            username: socket.username,
            numUsers: numUsers,
        });
    });

    socket.on("typing", () => {
        socket.broadcast.emit("typing", {
            username: socket.username,
        });
    });

    socket.on("stop typing", () => {
        socket.broadcast.emit("stop typing", {
            username: socket.username,
        });
    });

    socket.on("disconnect", () => {
        if (addedUser) {
            --numUsers;

            socket.broadcast.emit("user left", {
                username: socket.username,
                numUsers: numUsers,
            });
        }
    });
});