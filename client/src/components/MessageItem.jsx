// src/components/MessageItem.jsx
import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";

const MessageItem = ({ message, currentUser, onEdit, onDeleteForMe, onDeleteForEveryone }) => {
  const [hovered, setHovered] = useState(false);
  const isOwner = message.senderId === currentUser.id;

  return (
    <div
      className={`flex w-full ${isOwner ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative p-2 my-1 rounded-lg max-w-xs ${
          isOwner ? "bg-blue-100 ml-auto" : "bg-gray-100 mr-auto"
        }`}
      >
        {/* Render text, image, or video */}
        {message.type === "text" && <p>{message.content}</p>}
        {message.type === "image" && (
          <img src={message.content} alt="media" className="rounded-lg max-w-full" />
        )}
        {message.type === "video" && (
          <video src={message.content} controls className="rounded-lg max-w-full" />
        )}

        {/* Hover Menu */}
        {hovered && (
          <div
            className={`absolute top-1 ${
              isOwner ? "left-1" : "right-1"
            } flex flex-col bg-white shadow rounded-md`}
          >
            <button
              onClick={() => onDeleteForMe(message.id)}
              className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100"
            >
              <Trash2 size={14} /> Delete for me
            </button>

            {isOwner && (
              <>
                <button
                  onClick={() => onDeleteForEveryone(message.id)}
                  className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100"
                >
                  <Trash2 size={14} /> Delete for everyone
                </button>
                {message.type === "text" && (
                  <button
                    onClick={() => onEdit(message)}
                    className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;
