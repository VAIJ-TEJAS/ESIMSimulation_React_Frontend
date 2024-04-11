import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "peerjs";
import { confirmation } from "./components/Confirmation";
import { Button, Modal } from "antd";
import { Form } from "antd";
import { Input } from "antd";
import { message } from "antd";

const SERVER_URL = "https://13.233.126.47:443/";
const PEER_SERVER_HOST = "13.233.126.47";
const PEER_SERVER_PORT = "9000";
const socket = io(SERVER_URL, {
  transports: ["websocket"], 
});

let user_id = null

function App() {

  const [username, setUsername] = useState("");
  const [users, setUsers] = useState({});
  const myId = useRef("");
  const myVideoStream = useRef(null);
  const peerRef = useRef(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Request permissions and get the stream
    navigator.mediaDevices
      .getUserMedia({ video: false, audio: true })
      .then((stream) => {
        myVideoStream.current = stream;

        peerRef.current = new Peer(undefined, {
          path: "/peerjs",
          host: PEER_SERVER_HOST,
          port: PEER_SERVER_PORT,
        });

        peerRef.current.on("open", (id) => {
          myId.current = id;
          socket.emit("new-user", id);
        });

        peerRef.current.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            addAudioStream(userVideoStream);
          });
        });

        socket.on("auth", (data) => {
          console.log(data.message); // Log the messa
          setIsModalVisible(true);
          // Show modal here for login or registration
          
        });

        socket.on("login-success", (data) => {
          console.log(data.message);
          setUsername(data.username);
          setIsModalVisible(false); 
        });

        socket.on("call-made", async (data) => {
          if (!callAccepted) {
            confirmation(
              `User ${data.from} is calling you. Accept this call?`
            ).then((confirmed) => {
              if (confirmed) {

                socket.emit("accept-call", {
                  to: data.from,
                  from: myId.current,
                });

                // setCallAccepted(true);
              }
            });
          }
        });

        socket.on("call-accepted", (data) => {
          const call = peerRef.current.call(data.from, myVideoStream.current);
          call.on("stream", (userVideoStream) => {
            addAudioStream(userVideoStream);
          });
          setCallAccepted(true);
        });

        socket.on("all-users", (currentUsers) => {
          setUsers(currentUsers);
        });

        socket.on("disconnected", (data) => {
          message.error(data.message); 
        
          setTimeout(() => {
            window.location.reload();
        }, 3000);
        });
      });

    return () => {
      if (myVideoStream.current) {
        myVideoStream.current.getTracks().forEach((track) => track.stop());
      }
      socket.disconnect();
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  const callUser = (userId) => {
    user_id = userId
    if (myVideoStream.current) {
      socket.emit("call-user", {
        userToCall: userId,
        from: myId.current,
      });
    }
  };

  const handleLoginSignup = (values) => {
    console.log('Received values of form: ', values);
    // Here, send the username back to the server for either login or signup
    socket.emit("login-signup", { username: values.username });
  };

  useEffect(() => {
    if (callAccepted) {
      // Create a call to the specified user
      const call = peerRef.current.call(user_id, myVideoStream.current);
      call.on("stream", (userStream) => {
        // This ensures the caller can also receive the callee's audio stream.
        addAudioStream(userStream);
      });
    }
  }, [callAccepted]);

  /// This is a new function to handle adding audio streams to the DOM.
  function addAudioStream(stream) {
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    document.body.appendChild(audio);
    audio.play();
  }

  return (
    <div>
      <Modal title="Login / Signup" visible={isModalVisible} footer={null}>
        <Form onFinish={handleLoginSignup}>
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input placeholder="Username" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Login/Signup
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <h2>E-Sim Simulation</h2>
      <h2>Welcome, {username}</h2>
      <h3>{myId.current}</h3>
      {Object.keys(users).map(
        (socketId) =>
          users[socketId].id !== myId.current && (
            <button key={socketId} onClick={() => callUser(users[socketId].id)}>
              Call {users[socketId].username}
            </button>
          )
      )}
    </div>
  );
}

export default App;
