"use client";
import { useEffect } from "react";
import io from "socket.io-client";

let socket;

const Home = () => {
  useEffect(() => {
    socket = io("http://localhost:3000", {
      path: "/api/socket",
      transports: ["polling", "websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to Socket.IO server:", socket.id);
    });

    socket.on("message", (data) => {
      console.log("Message from server:", data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server.");
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return <div>Socket.IO Client</div>;
};

export default Home;
