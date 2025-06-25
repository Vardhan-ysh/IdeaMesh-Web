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
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // On mount (client-side only), immediately pick a random quote to start the sequence.
    // This avoids the hydration error, as the initial server and client render match.
    setCurrentQuoteIndex(Math.floor(Math.random() * quotes.length));
    
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
        <div className="absolute h-full w-full rounded-full border border-primary/50 animate-ripple" style={{ animationDelay: '0s' }}></div>
        <div className="absolute h-full w-full rounded-full border border-primary/50 animate-ripple" style={{ animationDelay: '1s' }}></div>
        <div className="absolute h-full w-full rounded-full border border-primary/50 animate-ripple" style={{ animationDelay: '2s' }}></div>
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
