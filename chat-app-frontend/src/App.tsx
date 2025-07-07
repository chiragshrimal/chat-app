import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState(["hi there", "hello"]);
  const [socket, setSocket] = useState();
  const inputRef = useRef();

  function sendMessage() {
    const currentMessage = inputRef.current.value;
    if (!socket) {
      return;
    }
    socket.send(
      JSON.stringify({
        type: "chat",
        payload: {
          message: currentMessage,
        },
      })
    );
  }

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      setMessage(m =>[...m , event.data]);
    };

    setSocket(ws);

    // we can not directly write ws.send we have to first write onopen because connection bnne m time lgta hai
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "join",
          payload: {
            roomId: "red",
          },
        })
      );
    };
  }, []);

  return (
    <div className="h-screen bg-black">
      {/* br line isliye add kari hai because white linee aa rhi thi  */}
      <br />
      <div className="h-[85vh] bg-black">
        {message.map((message) => (
          <div className="m-10">
            <span className="bg-white text-black rounded p-4">{message}</span>
          </div>
        ))}
      </div>
      <div className="w-full bg-white flex">
        <input ref={inputRef} type="text" className="flex-1 p-4"></input>
        <button onClick={sendMessage} className="bg-purple-600 text-white p-4 rounded">
          Send message
        </button>
      </div>
    </div>
  );
}

export default App;
