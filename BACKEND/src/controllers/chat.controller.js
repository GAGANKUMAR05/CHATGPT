
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";


const createChat = async (req, res) => {

  try {

    const { title } = req.body;

    const user = req.user;


    const chat = await chatModel.create({
      user: user._id,
      title: title || "New Chat"
    });


    res.status(201).json({
      message: "Chat created successfully",
      chatId: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity
    });


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Could not create chat"
    });

  }

};


const getChats = async (req, res) => {

  try {

    const user = req.user;


    const chats = await chatModel
      .find({
        user: user._id
      })
      .sort({
        lastActivity: -1
      });


    res.status(200).json({
      chats
    });


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Could not fetch chats"
    });

  }

};


const getMessages = async (req, res) => {

  try {

    const { chatId } = req.params;

    const user = req.user;


    /*
     * First check that this chat
     * actually belongs to the user.
     */

    const chat = await chatModel.findOne({
      _id: chatId,
      user: user._id
    });


    if (!chat) {

      return res.status(404).json({
        message: "Chat not found"
      });

    }


    /*
     * Get all messages belonging
     * to this chat.
     */

    const messages = await messageModel
      .find({
        chat: chatId,
        user: user._id
      })
      .sort({
        createdAt: 1
      });


    res.status(200).json({
      messages
    });


  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Could not fetch messages"
    });

  }

};


export {
  createChat,
  getChats,
  getMessages
};

