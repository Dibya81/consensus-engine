import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, Zap, Search, Plus, CheckCircle, Loader2, Target, Award } from 'lucide-react';

const LAMBDA_URL = "https://6u6a3ub4qmn4qppzc7hdsnflqy0lkold.lambda-url.us-east-1.on.aws/";

const ProgressView = ({ username }) => {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [username]);

  const fetchProgress = async () => {
    try {
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'GET_USER_DATA', username, data_type: 'learning_progress_topics' })
      });
      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setTopics(data.data);
        if (data.data.length > 0) {
          generateRecommendation(data.data);
        }
      }
    } catch (e) {
      console.error("Failed to load progress", e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (updatedTopics) => {
    try {
      await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'SAVE_USER_DATA', 
          username, 
          data_type: 'learning_progress_topics', 
          payload: updatedTopics 
        })
      });
    } catch (e) {
      console.error("Error saving progress:", e);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    
    const topicEntry = {
      id: Date.now().toString(),
      name: newTopic,
      completed: false,
      dateAdded: new Date().toLocaleDateString()
    };
    
    const updatedTopics = [topicEntry, ...topics];
    setTopics(updatedTopics);
    setNewTopic('');
    
    await saveProgress(updatedTopics);
    generateRecommendation(updatedTopics);
  };

  const toggleTopicComplete = async (id) => {
    const updatedTopics = topics.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTopics(updatedTopics);
    await saveProgress(updatedTopics);
  };

  const generateRecommendation = async (currentTopics) => {
    if (currentTopics.length === 0) return;
    setIsAnalyzing(true);
    
    const topicNames = currentTopics.map(t => `${t.name} (${t.completed ? 'Completed' : 'In Progress'})`).join(', ');
    const payload = `User's Topics: ${topicNames}`;
    
    try {
      const response = await fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'ANALYZE_DATA', 
          username, 
          data_type: 'progress', 
          payload: payload 
        })
      });
      const data = await response.json();
      if (data.data && data.data.content) {
        setRecommendation(data.data.content);
      }
    } catch (e) {
      console.error("Recommendation failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const completedCount = topics.filter(t => t.completed).length;
  const progressRatio = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        flex: 1,
        padding: 'clamp(4rem,8vw,5rem) clamp(1rem,4vw,3rem) 2rem clamp(1rem,4vw,3rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        height: '100%',
        overflowY: 'auto'
      }}
    >
      <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', margin: 0, color: 'var(--engine-text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(1.4rem,4vw,2rem)', whiteSpace: 'nowrap' }}>
          <TrendingUp size={24} color="var(--engine-accent)" /> Learning Progress
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Banner */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: '2rem',
          backgroundColor: 'var(--engine-panel-bg)',
          border: '1px solid var(--engine-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 3rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          
          {/* Consistency */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 2rem 0', color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Account Standing</h3>
            
            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--engine-text-main)' }}>{topics.length}</span>
                  <Target size={32} color="var(--engine-accent)" />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--engine-text-muted)', letterSpacing: '1px' }}>TOTAL TOPICS</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--engine-text-main)' }}>{completedCount}</span>
                  <Award size={32} color="#eab308" />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--engine-text-muted)', letterSpacing: '1px' }}>COMPLETED</span>
              </div>
            </div>
          </div>

          <div style={{ width: '1px', backgroundColor: 'var(--engine-border)' }} />

          {/* Progress Distribution */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 2rem 0', color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Mastery Progress</h3>
            
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--engine-panel-bg)',
              border: '8px solid var(--engine-border)',
              borderTopColor: progressRatio > 0 ? 'var(--engine-accent)' : 'var(--engine-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--engine-text-main)' }}>{progressRatio}%</span>
            </div>
          </div>

        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {/* Recent Activity */}
          <div style={{
            backgroundColor: 'var(--engine-panel-bg)',
            border: '1px solid var(--engine-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            minHeight: '200px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Clock size={20} color="var(--engine-accent)" />
              <h3 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Recent Topics Searched</h3>
            </div>
            
            <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                flex: 1,
                backgroundColor: 'color-mix(in srgb, var(--engine-text-muted) 10%, transparent)',
                border: '1px solid var(--engine-border)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Search size={16} color="var(--engine-text-muted)" />
                <input 
                  type="text" 
                  placeholder="Search and add a topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--engine-text-main)',
                    width: '100%',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              <button 
                type="submit"
                disabled={!newTopic.trim()}
                style={{
                  backgroundColor: 'var(--engine-accent)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  padding: '0 1rem',
                  fontWeight: 600,
                  cursor: !newTopic.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: !newTopic.trim() ? 0.5 : 1
                }}
              >
                <Plus size={18} />
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                   <Loader2 size={24} className="spin" color="var(--engine-text-muted)" />
                </div>
              ) : topics.length === 0 ? (
                <p style={{ color: 'var(--engine-text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '1rem' }}>
                  No recent topics found. Search and add one to get started!
                </p>
              ) : (
                <AnimatePresence>
                  {topics.map(topic => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: 'color-mix(in srgb, var(--engine-text-muted) 5%, transparent)',
                        border: '1px solid var(--engine-border)',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ color: 'var(--engine-text-main)', fontWeight: 500, fontSize: '0.95rem', textDecoration: topic.completed ? 'line-through' : 'none', opacity: topic.completed ? 0.6 : 1 }}>
                          {topic.name}
                        </span>
                        <span style={{ color: 'var(--engine-text-muted)', fontSize: '0.75rem' }}>Added: {topic.dateAdded}</span>
                      </div>
                      <button 
                        onClick={() => toggleTopicComplete(topic.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: topic.completed ? '#22c55e' : 'var(--engine-text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title={topic.completed ? "Mark as Incomplete" : "Mark as Completed"}
                      >
                        <CheckCircle size={20} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>

          {/* AI Recommendation */}
          <div style={{
            backgroundColor: 'var(--engine-panel-bg)',
            border: '1px solid var(--engine-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            minHeight: '200px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Zap size={20} color="var(--engine-accent)" />
              <h3 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>AI Roadmap Recommendation</h3>
              {isAnalyzing && <Loader2 size={16} className="spin" color="var(--engine-accent)" style={{ marginLeft: 'auto' }} />}
            </div>
            
            <div style={{ 
              backgroundColor: 'color-mix(in srgb, var(--engine-accent) 15%, transparent)', 
              border: '1px solid var(--engine-border)',
              borderRadius: '8px', 
              padding: '1.5rem',
              flex: 1,
              overflowY: 'auto'
            }}>
              <p style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {recommendation || "Add some topics to your recent activity to get a personalized AI learning roadmap prediction!"}
              </p>
            </div>
          </div>

        </div>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default ProgressView;
