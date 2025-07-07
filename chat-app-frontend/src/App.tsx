import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [roomId, setRoomId] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [mode, setMode] = useState(""); // "join" or "create"
  const inputRef = useRef();

  function generateRandomRoomId() {
    return Math.random().toString(36).substring(2, 8);
  }

  function sendMessage() {
    const currentMessage = inputRef.current.value;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      alert("Socket not connected yet");
      return;
    }
    const msgPayload = {
      type: "chat",
      payload: {
        message: currentMessage,
        sender: name,
      },
    };
    socket.send(JSON.stringify(msgPayload));
    setMessages((m) => [...m, { from: "self", sender: name, message: currentMessage }]);
    inputRef.current.value = "";
  }

  useEffect(() => {
    if (!connected || !roomId) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: roomId,
            sender: name,
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((m) => [...m, { from: "other", sender: data.sender, message: data.message }]);
      } catch {
        setMessages((m) => [...m, { from: "other", sender: "Unknown", message: event.data }]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setConnected(false);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [connected, roomId, name]);

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {!connected ? (
        <div className="m-auto text-center">
          {!mode && (
            <>
              <h2 className="mb-4">Do you want to:</h2>
              <button
                onClick={() => setMode("join")}
                className="bg-purple-600 p-2 m-2 rounded"
              >
                Join Existing Room
              </button>
              <button
                onClick={() => {
                  const newRoomId = generateRandomRoomId();
                  setRoomId(newRoomId);
                  setMode("create");
                }}
                className="bg-green-600 p-2 m-2 rounded"
              >
                Create New Room
              </button>
            </>
          )}

          {mode === "join" && (
            <div className="mt-4">
              <h3>Enter Your Name</h3>
              <input
                type="text"
                className="text-black p-2 rounded mt-2"
                placeholder="Your Name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
              <h3 className="mt-4">Enter Room ID to Join</h3>
              <input
                type="text"
                className="text-black p-2 rounded mt-2"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!inputName) {
                    alert("Please enter your name before connecting.");
                    return;
                  }
                  setRoomId(inputRoomId);
                  setName(inputName);
                  setConnected(true);
                }}
                disabled={!inputName}
                className={`p-2 m-2 rounded ${
                  inputName ? "bg-blue-600" : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Connect to Room
              </button>
            </div>
          )}

          {mode === "create" && (
            <div className="mt-4">
              <h3>Enter Your Name</h3>
              <input
                type="text"
                className="text-black p-2 rounded mt-2"
                placeholder="Your Name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
              />
              <button
                onClick={() => {
                  if (!inputName) {
                    alert("Please enter your name before creating room.");
                    return;
                  }
                  setName(inputName);
                  setConnected(true);
                }}
                disabled={!inputName}
                className={`p-2 m-2 rounded ${
                  inputName ? "bg-green-600" : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Create Room
              </button>
              <div className="mt-4">
                <p>Room ID:</p>
                <div className="text-xl mt-2">{roomId}</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="w-full bg-gray-800 text-center p-2">
            <span className="text-sm text-gray-300">
              Connected to Room:{" "}
              <span className="font-bold text-white">{roomId}</span> as{" "}
              <span className="font-bold text-green-400">{name}</span>
            </span>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "self" ? "justify-start" : "justify-end"}`}
              >
                <div className="flex flex-col max-w-xs">
                  <span className="text-xs text-gray-400 mb-1 ml-1">
                    {msg.sender}
                  </span>
                  <span className="bg-white text-black rounded p-4 m-1">
                    {msg.message}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full bg-white flex">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 p-4 text-black"
              placeholder="Type a message"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 text-white p-4 rounded"
            >
              Send message
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
