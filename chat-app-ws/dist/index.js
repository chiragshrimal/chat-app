"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSocket = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parseMessage = JSON.parse(message.toString());
        if (parseMessage.type === "join") {
            allSocket.push({
                socket,
                room: parseMessage.payload.roomId,
                name: parseMessage.payload.sender
            });
        }
        else if (parseMessage.type === "chat") {
            const currentUser = allSocket.find((x) => x.socket === socket);
            if (!currentUser)
                return;
            for (let user of allSocket) {
                if (user.socket == socket)
                    continue;
                if (user.room === currentUser.room) {
                    user.socket.send(JSON.stringify({
                        sender: currentUser.name,
                        message: parseMessage.payload.message
                    }));
                }
            }
        }
    });
    socket.on("close", () => {
        allSocket = allSocket.filter((x) => x.socket !== socket);
    });
});
