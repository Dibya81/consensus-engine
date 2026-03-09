import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Link2, BookOpen, Shield, Code, Cpu } from 'lucide-react';

const paths = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    desc: 'Learn problem solving and algorithms used in technical interviews.',
    icon: <BookOpen size={18} />,
    skills: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming'],
    resources: [
      { name: 'leetcode.com', url: '#' },
      { name: 'www.geeksforgeeks.org', url: '#' },
      { name: 'takeuforward.org', url: '#' }
    ]
  },
  {
    id: 'cyber',
    title: 'Cyber Security',
    desc: 'Learn how to protect systems and perform penetration testing.',
    icon: <Shield size={18} />,
    skills: ['Network Fundamentals', 'Cryptography', 'Penetration Testing', 'Malware Analysis'],
    resources: [
      { name: 'tryhackme.com', url: '#' },
      { name: 'hackthebox.com', url: '#' }
    ]
  },
  {
    id: 'web',
    title: 'Full Stack Web Development',
    desc: 'Build modern web applications using frontend and backend technologies.',
    icon: <Code size={18} />,
    skills: ['HTML/CSS', 'JavaScript/TypeScript', 'React', 'Node.js', 'Databases'],
    resources: [
      { name: 'freecodecamp.org', url: '#' },
      { name: 'theodinproject.com', url: '#' }
    ]
  },
  {
    id: 'ai',
    title: 'Artificial Intelligence / Machine Learning',
    desc: 'Develop intelligent systems using machine learning and deep learning.',
    icon: <Cpu size={18} />,
    skills: ['Python', 'Linear Algebra', 'TensorFlow/PyTorch', 'Data Processing'],
    resources: [
      { name: 'kaggle.com', url: '#' },
      { name: 'fast.ai', url: '#' }
    ]
  }
];

const CareerView = ({ username }) => {
  const [activePathId, setActivePathId] = useState('dsa');

  const activePath = paths.find(p => p.id === activePathId);

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
        maxWidth: '1200px',
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
        fontWeight: 'bold'
      }}>
        Career Roadmaps
      </h1>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Sidebar: Explore Paths */}
        <div style={{
          flex: '0 0 300px',
          backgroundColor: 'gray',
          backgroundColor: 'color-mix(in srgb, var(--engine-text-muted) 20%, var(--engine-panel-bg))',
          borderRadius: '24px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minWidth: '250px'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Explore Paths</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {paths.map(path => (
              <div 
                key={path.id}
                onClick={() => setActivePathId(path.id)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '16px',
                  backgroundColor: activePathId === path.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  border: activePathId === path.id ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <h4 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1rem', fontWeight: 600 }}>{path.title}</h4>
                <p style={{ margin: 0, color: 'var(--engine-text-muted)', fontSize: '0.85rem', lineHeight: 1.4 }}>{path.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: '1 1 500px',
          backgroundColor: 'color-mix(in srgb, var(--engine-text-muted) 20%, var(--engine-panel-bg))',
          borderRadius: '24px',
          padding: '2.5rem',
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <motion.div
            key={activePath.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--engine-text-main)', fontSize: '1.8rem', fontWeight: 'bold' }}>
              {activePath.title}
            </h2>
            <p style={{ margin: '0 0 2rem 0', color: 'var(--engine-text-muted)', fontSize: '1rem' }}>
              {activePath.desc}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Required Skills */}
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.03)',
                border: '1px solid var(--engine-border)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#8b5cf6' }}>
                  <Activity size={18} />
                  <h3 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Required Skills</h3>
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 1.25rem', color: 'var(--engine-text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                  {activePath.skills.map((skill, idx) => (
                    <li key={idx} style={{ paddingLeft: '0.5rem' }}>{skill}</li>
                  ))}
                </ul>
              </div>

              {/* Learning Resources */}
              <div style={{
                backgroundColor: 'rgba(0,0,0,0.03)',
                border: '1px solid var(--engine-border)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#3b82f6' }}>
                  <Link2 size={18} />
                  <h3 style={{ margin: 0, color: 'var(--engine-text-main)', fontSize: '1.1rem', fontWeight: 600 }}>Learning Resources</h3>
                </div>
                <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.95rem' }}>
                  {activePath.resources.map((res, idx) => (
                    <li key={idx} style={{ paddingLeft: '0.5rem', color: 'var(--engine-text-muted)' }}>
                      <a href={res.url} style={{ color: '#8b5cf6', textDecoration: 'none' }}>{res.name}</a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CareerView;
