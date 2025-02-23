"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, ArrowRight, Check, X } from 'lucide-react';

// Complete cards database
const CARDS = [
  // Everyday Objects
  {
    word: "MIRROR",
    tabooWords: ["Reflection", "Glass", "Look", "Wall", "Bathroom"]
  },
  {
    word: "UMBRELLA",
    tabooWords: ["Rain", "Wet", "Cover", "Storm", "Handle"]
  },
  // ... rest of your CARDS array ...
];

const TabooGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTeam, setCurrentTeam] = useState('A');
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [wordsPerTurn, setWordsPerTurn] = useState(5);
  const [wordsRemaining, setWordsRemaining] = useState(5);
  const [usedCards, setUsedCards] = useState(new Set());
  
  const [shuffledIndices, setShuffledIndices] = useState(() => {
    return [...Array(CARDS.length).keys()].sort(() => Math.random() - 0.5);
  });

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endTurn();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setIsTimerRunning(true);
    setWordsRemaining(wordsPerTurn);
    setUsedCards(new Set());
  };

  const endTurn = () => {
    setIsTimerRunning(false);
    setTimeLeft(60);
    setCurrentTeam(currentTeam === 'A' ? 'B' : 'A');
    setWordsRemaining(wordsPerTurn);
  };

  const getNextUnusedCardIndex = () => {
    let nextIndex = currentCardIndex;
    while (usedCards.has(shuffledIndices[nextIndex % CARDS.length])) {
      nextIndex++;
      if (usedCards.size >= CARDS.length) {
        setUsedCards(new Set());
        setShuffledIndices([...Array(CARDS.length).keys()].sort(() => Math.random() - 0.5));
        break;
      }
    }
    return nextIndex % CARDS.length;
  };

  const shuffleToNextCard = () => {
    const nextIndex = getNextUnusedCardIndex();
    setCurrentCardIndex(nextIndex);
    setUsedCards(prev => new Set([...prev, shuffledIndices[nextIndex]]));
    
    setWordsRemaining((prev) => {
      const remaining = prev - 1;
      if (remaining <= 0) {
        endTurn();
      }
      return remaining;
    });
  };

  const handleCorrect = () => {
    setScores(prev => ({
      ...prev,
      [currentTeam]: prev[currentTeam] + 1
    }));
    shuffleToNextCard();
  };

  const handleTaboo = () => {
    setScores(prev => ({
      ...prev,
      [currentTeam]: Math.max(0, prev[currentTeam] - 1)
    }));
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Taboo Game</h1>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Words per Turn:
              </label>
              <div className="flex gap-2 justify-center">
                {[3, 5, 7, 10].map((num) => (
                  <Button
                    key={num}
                    className={`${
                      wordsPerTurn === num 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => setWordsPerTurn(num)}
                  >
                    {num}
                  </Button>
                ))}
              </div>
            </div>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              onClick={startGame}
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = CARDS[shuffledIndices[currentCardIndex]];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <div className={`text-lg font-bold ${currentTeam === 'A' ? 'text-blue-600' : ''}`}>
              Team A: {scores.A}
            </div>
            <div className={`text-lg font-bold ${currentTeam === 'B' ? 'text-blue-600' : ''}`}>
              Team B: {scores.B}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium">
              Words: {wordsRemaining}/{wordsPerTurn}
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span className="text-lg font-bold">{timeLeft}s</span>
            </div>
          </div>
        </div>

        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-center mb-6">
              {currentCard.word}
            </div>
            <div className="space-y-2">
              {currentCard.tabooWords.map((word, index) => (
                <div 
                  key={index}
                  className="text-lg text-center text-red-600"
                >
                  {word}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleCorrect}
          >
            <Check className="w-5 h-5 mr-2" />
            Correct
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={handleTaboo}
          >
            <X className="w-5 h-5 mr-2" />
            Taboo
          </Button>
          <Button
            className="bg-yellow-600 hover:bg-yellow-700"
            onClick={shuffleToNextCard}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Skip
          </Button>
        </div>

        <Button
          className="w-full mt-4 bg-gray-600 hover:bg-gray-700"
          onClick={endTurn}
        >
          End Turn
        </Button>
      </div>
    </div>
  );
};

export default TabooGame; 