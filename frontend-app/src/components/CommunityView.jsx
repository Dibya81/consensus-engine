import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, MessageSquare, Share2 } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: 1,
    avatar: 'G',
    avatarBg: '#8b5cf6',
    author: 'Guest User',
    timestamp: '3/8/2026, 7:26:38 PM',
    content: 'i love modi ji',
    likes: 0
  }
];

const CommunityView = ({ username }) => {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [inputValue, setInputValue] = useState('');

  const handlePost = () => {
    if (!inputValue.trim()) return;

    const newPost = {
      id: Date.now(),
      avatar: username ? username.charAt(0).toUpperCase() : 'U',
      avatarBg: '#3b82f6',
      author: username || 'Guest User',
      timestamp: new Date().toLocaleString(),
      content: inputValue,
      likes: 0
    };

    setPosts([newPost, ...posts]);
    setInputValue('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        flex: 1,
        padding: 'clamp(2rem, 5vw, 4rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <h1 style={{ 
        fontFamily: 'var(--font-heading)', 
        margin: '0 0 1rem 0', 
        color: '#8b5cf6', 
        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Community Feed
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Input Box Card */}
        <div style={{
          backgroundColor: 'gray',
          backgroundColor: 'color-mix(in srgb, var(--engine-text-muted) 20%, var(--engine-panel-bg))',
          borderRadius: '24px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              {username ? username.charAt(0).toUpperCase() : 'U'}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--engine-text-main)' }}>{username || 'Guest User'}</span>
          </div>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Share your thoughts with the community..."
            style={{
              width: '100%',
              minHeight: '80px',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--engine-text-main)',
              fontSize: '1rem',
              resize: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--engine-border)', paddingTop: '1rem' }}>
            <button
              onClick={handlePost}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#8b5cf6',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.5rem',
                borderRadius: '99px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Send size={16} /> Post
            </button>
          </div>
        </div>

        {/* Feed Items */}
        {posts.map(post => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: 'rgba(0,0,0,0.02)',
              backgroundColor: 'color-mix(in srgb, var(--engine-text-muted) 20%, var(--engine-panel-bg))',
              borderRadius: '24px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: post.avatarBg,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}>
                {post.avatar}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--engine-text-main)', fontSize: '1rem' }}>{post.author}</span>
                <span style={{ color: 'var(--engine-text-muted)', fontSize: '0.8rem' }}>{post.timestamp}</span>
              </div>
            </div>

            <p style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1rem', lineHeight: 1.5 }}>
              {post.content}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--engine-border)', paddingTop: '1rem', color: 'var(--engine-text-muted)' }}>
              <button style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Heart size={18} /> {post.likes}
              </button>
              <button style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <MessageSquare size={18} /> Comment
              </button>
              <button style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Share2 size={18} /> Share
              </button>
            </div>
          </motion.div>
        ))}

      </div>
    </motion.div>
  );
};

export default CommunityView;
