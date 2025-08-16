import { BadgeCheck, Heart, MessageCircle, Share2, Trash2, Send } from 'lucide-react'
import React, { useState } from 'react'
import moment from 'moment'
import { dummyUserData } from '../assets/assets';
import {useNavigate} from 'react-router-dom'

const PostCard = ({ post }) => {
  const postWithHashtags = post.content.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>');

  const currentUser = dummyUserData;



  // Likes state
  const [likes, setLikes] = useState(post.likes_count || []);

  // Comments state
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState("");

  // Show/hide comment box
  const [showCommentBox, setShowCommentBox] = useState(false);


  // Like / Unlike
  const handleLike = () => {
    if (likes.includes(currentUser._id)) {
      setLikes(likes.filter(id => id !== currentUser._id)); // unlike
    } 
    else {
      setLikes([...likes, currentUser._id]); // like
    }
  };


  // Add comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const commentObj = {
      id: Date.now(),
      user: currentUser,
      text: newComment.trim(),
    };
    setComments([...comments, commentObj]);
    setNewComment("");
  };

  // Delete comment
  const handleDeleteComment = (id) => {
    setComments(comments.filter(c => c.id !== id));
  };

  const navigate=useNavigate();
  


  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
      {/* user info */}
      <div onClick={()=>navigate('/profile' + post.user._id)} className="inline-flex items-center gap-3 cursor-pointer">
        <img src={post.user.profile_picture} alt="" className='w-10 h-10 rounded-full shadow' />
        <div>
          <div className="flex items-center space-x-1">
            <span>{post.user.full_name}</span>
            <BadgeCheck className='w-4 h-4 text-blue-500' />
          </div>
          <div className="text-gray-500 text-sm">
            @{post.user.username} · {moment(post.createdAt).fromNow()}
          </div>
        </div>
      </div>

      {/* content */}
      {post.content && (
        <div className='text-gray-800 text-sm whitespace-pre-line'
          dangerouslySetInnerHTML={{ __html: postWithHashtags }} />
      )}

      {/* images */}
      <div className="grid grid-cols-2 gap-2">
        {post.image_urls.map((img, index) => (
          <img key={index} src={img} alt="" className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 && "col-span-2 h-auto"}`} />
        ))}
      </div>


      {/* actions */}
      <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
          <Heart
            className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser._id) && 'text-red-500 fill-red-500'}`}
            onClick={handleLike}
          />
          <span>{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle
            className='w-4 h-4 cursor-pointer'
            onClick={() => setShowCommentBox(prev => !prev)}
          />
          <span>{comments.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className='w-4 h-4 cursor-pointer' />
          <span>{7}</span>
        </div>
      </div>




      {/* comment section */}
      {showCommentBox && (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <div>
                <strong>{c.user.full_name}:</strong> {c.text}
              </div>
              {c.user._id === currentUser._id && (
                <Trash2 className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => handleDeleteComment(c.id)} />
              )}
            </div>
          ))}

          {/* add comment box */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 border rounded px-2 py-1 text-sm"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Send className="w-5 h-5 text-blue-500 cursor-pointer" onClick={handleAddComment} />
          </div>
        </div>
      )}

    </div>
  );
};

export default PostCard;
