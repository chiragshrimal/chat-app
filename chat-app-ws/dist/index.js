"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSocket = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        // always parse incoming JSON string
        // @ts-ignore
        const parseMessage = JSON.parse(message);
        if (parseMessage.type === "join") {
            allSocket.push({
                socket,
                room: parseMessage.payload.roomId,
                name: parseMessage.payload.sender // make sure frontend sends this
            });
        }
        else if (parseMessage.type === "chat") {
            // find the sender's details
            const currentUser = allSocket.find((x) => x.socket === socket);
            if (!currentUser)
                return;
            // send message to all others in the same room
            for (let user of allSocket) {
                if (user.socket === socket)
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
