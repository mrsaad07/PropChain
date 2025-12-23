import React, { useMemo } from 'react';
import '../styles/animations.css';

const FloatingEmojis = () => {
  const emojis = useMemo(() => {
    const emojiList = ['🏠', '🏢', '🔑', '🚗', '🌳', '🏘️'];
    const items = [];
    for (let i = 0; i < 15; i++) {
      items.push({
        id: i,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        style: {
          left: `${Math.random() * 100}vw`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${10 + Math.random() * 10}s`,
          fontSize: `${1.5 + Math.random()}rem`,
          opacity: Math.random() * 0.5 + 0.2,
        }
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
      {emojis.map(item => (
        <span key={item.id} className="emoji-float" style={item.style}>
          {item.emoji}
        </span>
      ))}
    </div>
  );
};

export default FloatingEmojis;
