import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Zap } from 'lucide-react';

const ProgressView = ({ username }) => {
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
      <style>{`
        @media (max-width: 768px) {
          .progress-header { flex-direction: column !important; align-items: flex-start !important; gap: 0.75rem !important; }
        }
      `}</style>

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
            <h3 style={{ margin: '0 0 2rem 0', color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Learning Consistency</h3>
            
            <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', width: '100%' }}>
              {/* Current Streak */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--engine-text-main)' }}>0</span>
                  <span style={{ fontSize: '2rem' }}>🔥</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--engine-text-muted)', letterSpacing: '1px' }}>CURRENT STREAK</span>
              </div>
              
              {/* Max Streak */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--engine-text-main)' }}>0</span>
                  <span style={{ fontSize: '2rem' }}>✨</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--engine-text-muted)', letterSpacing: '1px' }}>MAX STREAK</span>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '1px', backgroundColor: 'var(--engine-border)' }} />

          {/* Progress Distribution */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ margin: '0 0 2rem 0', color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Progress Distribution</h3>
            
            <div style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'var(--engine-panel-bg)',
              border: '8px solid var(--engine-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--engine-text-muted)' }}>0%</span>
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
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <Clock size={20} color="var(--engine-accent)" />
              <h3 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Recent Activity</h3>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--engine-text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                No recent activity found. Start learning to build your timeline!
              </p>
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
              <h3 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>AI Recommendation</h3>
            </div>
            
            <div style={{ 
              backgroundColor: 'color-mix(in srgb, var(--engine-accent) 15%, transparent)', 
              border: '1px solid var(--engine-border)',
              borderRadius: '8px', 
              padding: '1.5rem',
              margin: 'auto 0'
            }}>
              <p style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Keep asking the AI Mentor questions to generate your personalized recommendations!
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default ProgressView;
