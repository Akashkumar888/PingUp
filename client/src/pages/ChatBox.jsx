// src/pages/ChatBox.jsx
import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import {
  addMessage,
  fetchMessages,
  resetMessages,
  deleteMessage,  // ⬅️ for deleting
  updateMessage,  // ⬅️ for editing
} from "../features/messages/messageSlice";
import MessageItem from "../components/MessageItem";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const connections = useSelector((state) => state.connections.connections);

  const { userId: clerkUserId, getToken } = useAuth(); // ✅ logged-in user
  const { userId: peerId } = useParams(); // ✅ peer user
  const dispatch = useDispatch();

  const [text, setText] = useState("");
  const [user, setUser] = useState(null); 
  const [media, setMedia] = useState(null);
  const containerRef = useRef(null); // 👈 your containerRef

  const MAX_FILE_SIZE_MB = 25;

  // Delete for me
  const handleDeleteForMe = async (id) => {
    try {
      const token = await getToken();
      const { data } = await api.delete(`/api/message/${id}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) dispatch(deleteMessage(id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete for everyone
  const handleDeleteForEveryone = async (id) => {
    try {
      const token = await getToken();
      const { data } = await api.delete(`/api/message/${id}/everyone`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) dispatch(deleteMessage(id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Edit message
  const handleEdit = async (msg) => {
    const newText = prompt("Edit your message:", msg.content);
    if (!newText || !newText.trim()) return;
    try {
      const token = await getToken();
      const { data } = await api.put(
        `/api/message/${msg.id}/edit`,
        { text: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) dispatch(updateMessage(data.message));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // File select
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File size cannot exceed ${MAX_FILE_SIZE_MB} MB.`);
      setMedia(null);
      return;
    }
    if (!file.type.startsWith("image") && !file.type.startsWith("video")) {
      toast.error("Only image and video files are allowed.");
      setMedia(null);
      return;
    }
    setMedia(file);
  };

  // Fetch messages
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId: peerId }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Send message
  const sendMessage = async () => {
    try {
      if (!text && !media) return;

      const token = await getToken();
      const formData = new FormData();
      formData.append("to_user_id", peerId);
      formData.append("text", text);
      if (media) formData.append("media", media);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText("");
        setMedia(null);
        dispatch(addMessage(data.message));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // On mount → fetch messages
  useEffect(() => {
    fetchUserMessages();
    return () => {
      dispatch(resetMessages());
    };
  }, [peerId]);

  // Find peer user
  useEffect(() => {
    if (connections.length > 0) {
      const peer = connections.find((c) => c._id === peerId);
      setUser(peer);
    }
  }, [connections, peerId]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    user && (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
          <img
            src={user.profile_picture}
            alt=""
            className="size-8 rounded-full"
          />
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
          </div>
        </div>

        {/* Messages container */}
        <div
          ref={containerRef} // 👈 containerRef applied
          className="p-5 md:px-10 h-full overflow-y-scroll"
        >
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message) => (
                <MessageItem
                  key={message._id}
                  message={{
                    id: message._id,
                    type: message.message_type, 
                    content: message.text || message.media_url,
                    senderId: message.from_user_id,
                  }}
                  currentUser={{ id: clerkUserId }}
                  onEdit={handleEdit}
                  onDeleteForMe={handleDeleteForMe}
                  onDeleteForEveryone={handleDeleteForEveryone}
                />
              ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4">
          <div className="flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5">
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 outline-none text-slate-700"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <label htmlFor="file" className="cursor-pointer">
              {media ? (
                media.type.startsWith("image") ? (
                  <img
                    src={URL.createObjectURL(media)}
                    alt=""
                    className="h-8 rounded"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(media)}
                    className="h-8 rounded"
                    muted
                  />
                )
              ) : (
                <ImageIcon className="size-7 text-gray-400 cursor-pointer" />
              )}
              <input
                type="file"
                id="file"
                accept="image/*,video/*"
                hidden
                onChange={handleFileSelect}
              />
            </label>

            <button
              onClick={sendMessage}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 cursor-pointer text-white p-2 rounded-full"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatBox;
