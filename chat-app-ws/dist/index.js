"use strict";
// remember  in the websocket you can not communicate with json object
// hmesha hmare pass string ya binary m baat kar skte hai
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
// let allSocket: WebSocket[]=[]; // [socket1 , socket2, socket3]
// User is the type of the array we have build it
let allSocket = [];
let count = 0;
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        // {} i want object but message is string type
        // @ts-ignore
        const parseMessage = JSON.parse(message);
        // console.log("hello");
        if (parseMessage.type == "join") {
            count++;
            console.log(count);
            allSocket.push({
                socket,
                room: parseMessage.payload.roomId,
            });
        }
        else {
            // when someone  in the room wants to chat 
            if (parseMessage.type == "chat") {
                //  first find the room of this person  and send message to all the other person which are present in this room
                // 1. first identify that socket corresponding  roomId
                const currentUserRoom = allSocket.find((x) => x.socket == socket);
                // send the message to all other personn which are present in that  room
                for (let i = 0; i < allSocket.length; i++) {
                    if (allSocket[i].room == (currentUserRoom === null || currentUserRoom === void 0 ? void 0 : currentUserRoom.room)) {
                        allSocket[i].socket.send(parseMessage.payload.message);
                    }
                }
            }
        }
    });
    socket.on("disconnect", () => {
        allSocket = allSocket.filter((x) => x.socket != socket);
    });
});
