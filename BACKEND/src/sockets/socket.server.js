
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import { userModel } from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

import {
  generateResponse,
  generateVector
} from "../service/ai.service.js";

import {
  createMemory,
  queryMemory
} from "../service/vector.service.js";


function initSocketServer(httpServer) {

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });


  /*
   * ==========================================
   * SOCKET AUTHENTICATION
   * ==========================================
   */

  io.use(async (socket, next) => {

    try {

      const cookies = cookie.parse(
        socket.handshake.headers?.cookie || ""
      );


      // No JWT cookie
      if (!cookies.token) {

        return next(
          new Error(
            "Authentication error: No token provided"
          )
        );

      }


      // Verify JWT
      const decoded = jwt.verify(
        cookies.token,
        process.env.JWT_SECRET
      );


      // Find user
      const user = await userModel.findById(
        decoded.id
      );


      if (!user) {

        return next(
          new Error(
            "Authentication error: User not found"
          )
        );

      }


      // Attach user to socket
      socket.user = user;


      next();


    } catch (error) {

      console.log(
        "Socket authentication error:",
        error
      );


      return next(
        new Error(
          "Authentication error"
        )
      );

    }

  });


  /*
   * ==========================================
   * SOCKET CONNECTION
   * ==========================================
   */

  io.on("connection", (socket) => {

    console.log(
      "User connected:",
      socket.user._id.toString()
    );


    /*
     * ==========================================
     * AI MESSAGE
     * ==========================================
     */

    socket.on(
      "ai-message",
      async (messagePayload) => {

        try {

          /*
           * Validate payload
           */

          if (
            !messagePayload ||
            !messagePayload.chat ||
            !messagePayload.content
          ) {

            return socket.emit(
              "ai-error",
              {
                message:
                  "Invalid message data"
              }
            );

          }


          const chatId =
            messagePayload.chat;

          const content =
            messagePayload.content.trim();


          if (!content) {

            return socket.emit(
              "ai-error",
              {
                message:
                  "Message cannot be empty"
              }
            );

          }


          /*
           * ==================================
           * CHECK CHAT
           * ==================================
           */

          const chat = await chatModel.findOne({
            _id: chatId,
            user: socket.user._id
          });


          if (!chat) {

            return socket.emit(
              "ai-error",
              {
                message:
                  "Chat not found"
              }
            );

          }


          /*
           * ==================================
           * SAVE USER MESSAGE + VECTOR
           * ==================================
           */

          const [
            message,
            vectors
          ] = await Promise.all([

            messageModel.create({

              chat: chatId,

              user: socket.user._id,

              content: content,

              role: "user"

            }),

            generateVector(content)

          ]);


          /*
           * ==================================
           * CREATE LONG TERM MEMORY
           * ==================================
           */

          await createMemory({

            vectors,

            messageId: message._id,

            metadata: {

              chat: chatId,

              user: socket.user._id,

              text: content

            }

          });


          /*
           * ==================================
           * GET MEMORY + CHAT HISTORY
           * ==================================
           */

          const [
            memory,
            chatHistory
          ] = await Promise.all([

            queryMemory({

              queryVector: vectors,

              limit: 3,

              metadata: {
                user: socket.user._id
              }

            }),


            messageModel
              .find({
                chat: chatId
              })
              .sort({
                createdAt: -1
              })
              .limit(20)
              .lean()

          ]);


          /*
           * Reverse history so that
           * oldest message comes first.
           */

          chatHistory.reverse();


          /*
           * ==================================
           * SHORT TERM MEMORY
           * ==================================
           */

          const stm = chatHistory.map(
            (item) => {

              return {

                role: item.role,

                parts: [
                  {
                    text: item.content
                  }
                ]

              };

            }
          );


          /*
           * ==================================
           * LONG TERM MEMORY
           * ==================================
           */

          const ltm = [

            {

              role: "user",

              parts: [

                {
                  text: `
These are some previous messages from this user's conversations.

Use them only when they are relevant to the current question.

${memory
  .map(
    (item) =>
      item.metadata?.text || ""
  )
  .join("\n")}
`
                }

              ]

            }

          ];


          /*
           * ==================================
           * GENERATE AI RESPONSE
           * ==================================
           */

          const response =
            await generateResponse([
              ...ltm,
              ...stm
            ]);


          /*
           * ==================================
           * SEND AI RESPONSE TO FRONTEND
           * ==================================
           */

          socket.emit(
            "ai-response",
            {

              content: response,

              chat: chatId

            }
          );


          /*
           * ==================================
           * SAVE AI RESPONSE + VECTOR
           * ==================================
           */

          const [
            responseMessage,
            responseVectors
          ] = await Promise.all([

            messageModel.create({

              chat: chatId,

              user: socket.user._id,

              content: response,

              role: "model"

            }),

            generateVector(response)

          ]);


          /*
           * ==================================
           * SAVE AI RESPONSE TO MEMORY
           * ==================================
           */

          await createMemory({

            vectors: responseVectors,

            messageId: responseMessage._id,

            metadata: {

              chat: chatId,

              user: socket.user._id,

              text: response

            }

          });


          /*
           * ==================================
           * UPDATE CHAT ACTIVITY
           * ==================================
           */

          await chatModel.findByIdAndUpdate(
            chatId,
            {
              lastActivity: new Date()
            }
          );


        } catch (error) {

          console.log(
            "AI message error:",
            error
          );


          socket.emit(
            "ai-error",
            {
              message:
                "Something went wrong while generating the response."
            }
          );

        }

      }
    );


    /*
     * ==========================================
     * DISCONNECT
     * ==========================================
     */

    socket.on("disconnect", () => {

      console.log(
        "User disconnected:",
        socket.user._id.toString()
      );

    });

  });


  return io;

}


export default initSocketServer;

