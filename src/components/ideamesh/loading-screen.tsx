'use client';

import { useState, useEffect } from 'react';

const quotes = [
  { quote: "The best way to have a good idea is to have a lot of ideas.", author: "Linus Pauling" },
  { quote: "Ideas are like rabbits. You get a couple and learn how to handle them, and pretty soon you have a dozen.", author: "John Steinbeck" },
  { quote: "An idea that is not dangerous is unworthy of being called an idea at all.", author: "Oscar Wilde" },
  { quote: "A new idea is delicate. It can be killed by a sneer or a yawn; it can be stabbed to death by a quip and worried to death by a frown on the right manâ€™s brow.", author: "Charles Brower" },
  { quote: "The difficulty lies not so much in developing new ideas as in escaping from old ones.", author: "John Maynard Keynes" },
  { quote: "Every great idea was once a crazy idea.", author: "Unknown" },
  { quote: "Creativity is intelligence having fun.", author: "Albert Einstein" },
];

export default function LoadingScreen() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(
    Math.floor(Math.random() * quotes.length)
  );

  useEffect(() => {
    const selectRandomQuote = () => {
      setCurrentQuoteIndex(prevIndex => {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * quotes.length);
        } while (newIndex === prevIndex);
        return newIndex;
      });
    };

    const interval = setInterval(selectRandomQuote, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-transparent text-center">
      <div className="relative flex h-48 w-48 items-center justify-center mb-12">
        {/* Animated Nodes */}
        <div className="absolute h-12 w-12 rounded-full bg-primary/80 animate-pulse-glow" style={{ animationDelay: '0s' }}></div>
        <div className="absolute h-8 w-8 rounded-lg bg-accent/80 animate-pulse-glow" style={{ animationDelay: '1.0s', transform: 'translate(60px, -60px)' }}></div>
        <div className="absolute h-10 w-10 rounded-full bg-primary/60 animate-pulse-glow" style={{ animationDelay: '2.0s', transform: 'translate(-70px, 10px)' }}></div>
        <div className="absolute h-6 w-6 rounded-lg bg-accent/60 animate-pulse-glow" style={{ animationDelay: '3.0s', transform: 'translate(20px, 70px)' }}></div>
        <div className="absolute h-7 w-7 rounded-full bg-primary/70 animate-pulse-glow" style={{ animationDelay: '4.0s', transform: 'translate(-30px, -70px)' }}></div>
      </div>

      <div className="w-full max-w-2xl px-4">
        <div className="h-24 relative">
          {quotes.map((item, index) => (
            <div
              key={index}
              className={`absolute w-full transition-opacity duration-1000 ease-in-out ${
                index === currentQuoteIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <p className="text-xl font-medium text-foreground">
                "{item.quote}"
              </p>
              <p className="mt-4 text-md text-muted-foreground">- {item.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
