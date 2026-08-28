
import { useEffect, useState } from "react";

import socket from "../socket/socket";

import {
  createChat,
  getChats,
  getMessages
} from "../api/api.jsx";


const Home = () => {

  const [chats, setChats] = useState([]);

  const [currentChat, setCurrentChat] = useState(null);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);


  /*
   * =========================
   * FETCH CHATS
   * =========================
   */

  useEffect(() => {

    const fetchChats = async () => {

      try {

        const response = await getChats();

        setChats(response.data.chats);

      } catch (error) {

        console.log(error);

      }

    };


    fetchChats();

  }, []);


  /*
   * =========================
   * SOCKET CONNECTION
   * =========================
   */

  useEffect(() => {

    socket.connect();


    const handleConnect = () => {

      console.log(
        "Socket connected:",
        socket.id
      );

    };


    const handleConnectError = (error) => {

      console.log(
        "Socket connection error:",
        error.message
      );

    };


    const handleAIResponse = (data) => {

      setMessages((prev) => [
        ...prev,

        {
          role: "model",
          content: data.content
        }
      ]);

      setLoading(false);

    };


    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "ai-response",
      handleAIResponse
    );


    return () => {

      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "ai-response",
        handleAIResponse
      );

      socket.disconnect();

    };

  }, []);


  /*
   * =========================
   * CREATE NEW CHAT
   * =========================
   */

  const handleNewChat = async () => {

    try {

      const response = await createChat(
        "New Chat"
      );


      const newChat = {

        _id: response.data.chatId,

        title: response.data.title,

        lastActivity:
          response.data.lastActivity

      };


      setChats((prev) => [
        newChat,
        ...prev
      ]);


      setCurrentChat(newChat);

      setMessages([]);

    } catch (error) {

      console.log(error);

      alert("Could not create chat");

    }

  };


  /*
   * =========================
   * SELECT CHAT
   * =========================
   */

  const handleSelectChat = async (chat) => {

    try {
  
      setCurrentChat(chat);
  
      setMessages([]);
  
      const response = await getMessages(chat._id);
  
      setMessages(response.data.messages);
  
    } catch (error) {
  
      console.log(error);
  
      alert("Could not load messages");
  
    }
  
  };


  /*
   * =========================
   * SEND MESSAGE
   * =========================
   */

  const handleSubmit = (e) => {

    e.preventDefault();


    if (!message.trim()) {
      return;
    }


    if (!currentChat) {

      alert("Create a chat first");

      return;

    }


    const content = message.trim();


    /*
     * Show user's message immediately
     */

    setMessages((prev) => [

      ...prev,

      {
        role: "user",
        content
      }

    ]);


    /*
     * Send to backend through Socket.IO
     */

    socket.emit(
      "ai-message",
      {
        chat: currentChat._id,
        content
      }
    );


    setMessage("");

    setLoading(true);

  };


  return (

    <main className="h-dvh flex bg-gray-100">


      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className="
          w-64
          bg-gray-900
          text-white
          flex
          flex-col
        "
      >


        {/* New Chat */}

        <div className="p-4">

          <button
            onClick={handleNewChat}
            className="
              w-full
              border
              border-gray-700
              rounded-lg
              py-2
              hover:bg-gray-800
              transition
            "
          >

            + New Chat

          </button>

        </div>


        {/* Recent Chats */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-3
          "
        >

          <h2
            className="
              text-xs
              text-gray-400
              uppercase
              px-2
              py-3
            "
          >

            Recent Chats

          </h2>


          {chats.length === 0 ? (

            <p
              className="
                text-sm
                text-gray-500
                px-2
              "
            >

              No chats yet

            </p>

          ) : (

            <div className="flex flex-col gap-1">

              {chats.map((chat) => (

                <button
                  key={chat._id}

                  onClick={() =>
                    handleSelectChat(chat)
                  }

                  className={`
                    text-left
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    truncate
                    transition
                    hover:bg-gray-800

                    ${
                      currentChat?._id === chat._id
                        ? "bg-gray-800"
                        : ""
                    }
                  `}
                >

                  {chat.title}

                </button>

              ))}

            </div>

          )}

        </div>


        {/* User */}

        <div
          className="
            border-t
            border-gray-700
            p-4
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                w-9
                h-9
                rounded-full
                bg-gray-700
                flex
                items-center
                justify-center
              "
            >

              U

            </div>


            <div>

              <p className="text-sm font-medium">

                User

              </p>


              <p
                className="
                  text-xs
                  text-gray-400
                "
              >

                Account

              </p>

            </div>

          </div>

        </div>

      </aside>


      {/* =========================
          CHAT AREA
      ========================= */}

      <section className="flex-1 flex flex-col">


        {/* Header */}

        <header
          className="
            h-14
            border-b
            bg-white
            flex
            items-center
            px-6
          "
        >

          <h1 className="font-semibold">

            {currentChat?.title ||
              "AI Assistant"}

          </h1>

        </header>


        {/* Messages */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-6
            py-8
          "
        >

          <div
            className="
              max-w-3xl
              mx-auto
            "
          >


            {/* Empty state */}

            {messages.length === 0 && (

              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                "
              >

                <div className="text-center">

                  <h2
                    className="
                      text-2xl
                      font-semibold
                    "
                  >

                    {currentChat
                      ? "Start a conversation"
                      : "How can I help you?"}

                  </h2>


                  <p
                    className="
                      text-gray-500
                      mt-2
                    "
                  >

                    {currentChat
                      ? "Send a message below."
                      : "Create a new chat to get started."}

                  </p>

                </div>

              </div>

            )}


            {/* Messages */}

            {messages.map(
              (msg, index) => (

                <div
                  key={index}
                  className={`
                    flex
                    mb-6

                    ${
                      msg.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >

                  <div
                    className={`
                      max-w-xl
                      px-4
                      py-3
                      rounded-2xl
                      whitespace-pre-wrap

                      ${
                        msg.role === "user"
                          ? "bg-black text-white"
                          : "bg-white border text-gray-800"
                      }
                    `}
                  >

                    {msg.content}

                  </div>

                </div>

              )
            )}


            {/* Loading */}

            {loading && (

              <div className="flex mb-6">

                <div
                  className="
                    bg-white
                    border
                    px-4
                    py-3
                    rounded-2xl
                    text-gray-500
                  "
                >

                  Thinking...

                </div>

              </div>

            )}

          </div>

        </div>


        {/* Input */}

        <div
          className="
            border-t
            bg-white
            p-4
          "
        >

          <form
            onSubmit={handleSubmit}
            className="
              max-w-3xl
              mx-auto
            "
          >

            <div
              className="
                flex
                items-center
                border
                rounded-2xl
                px-4
                py-2
                shadow-sm
                focus-within:ring-2
                focus-within:ring-gray-300
              "
            >

              <input
                type="text"
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                placeholder={
                  currentChat
                    ? "Ask anything..."
                    : "Create a chat first..."
                }
                disabled={
                  !currentChat ||
                  loading
                }
                className="
                  flex-1
                  outline-none
                  py-2
                  bg-transparent
                  disabled:cursor-not-allowed
                "
              />


              <button
                type="submit"
                disabled={
                  !message.trim() ||
                  !currentChat ||
                  loading
                }
                className="
                  bg-black
                  text-white
                  rounded-xl
                  px-4
                  py-2
                  transition
                  hover:bg-gray-700
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >

                ↑

              </button>

            </div>

          </form>

        </div>

      </section>

    </main>

  );

};


export default Home;

