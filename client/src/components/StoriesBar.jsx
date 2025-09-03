import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModel from "./StoryModel";
import StoryViewer from "./StoryViewer";
import StoryItem from "./StoryItem";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const StoriesBar = () => {
  const { getToken, userId } = useAuth();
  const [stories, setStories] = useState([]);
  const [showModel, setShowModel] = useState(false);
  const [viewStory, setViewStory] = useState(null);

  const fetchStories = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/story/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setStories(data.stories);
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">
        {/* Add story card */}
        <div
          onClick={() => setShowModel(true)}
          className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-slate-700">Create Story</p>
          </div>
        </div>

        {/* Story items */}
        {stories.map((story, index) => (
          <StoryItem
            key={index}
            story={story}
            fetchStories={fetchStories}
            currentUserId={userId}
            onView={setViewStory}
          />
        ))}
      </div>

      {/* Add Story Model */}
      {showModel && (
        <StoryModel setShowModel={setShowModel} fetchStories={fetchStories} />
      )}

      {/* View Story */}
      {viewStory && (
        <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />
      )}
    </div>
  );
};

export default StoriesBar;
