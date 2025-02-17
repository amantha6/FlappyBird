import React, { useState, useEffect, useCallback } from 'react';

const FlappyBird = () => {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  
  const gravity = 0.5;
  const jumpStrength = -8;
  const gameWidth = 400;
  const gameHeight = 500;
  const birdSize = 20;
  const obstacleWidth = 50;
  const gapSize = 150;
  
  const jump = useCallback(() => {
    if (!gameOver) {
      setVelocity(jumpStrength);
      if (!gameHasStarted) {
        setGameHasStarted(true);
      }
    }
  }, [gameOver, gameHasStarted]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (gameHasStarted && !gameOver) {
      const gameLoop = setInterval(() => {
        setBirdPosition((prevPosition) => {
          const newPosition = prevPosition + velocity;
          if (newPosition < 0 || newPosition > gameHeight - birdSize) {
            setGameOver(true);
            return prevPosition;
          }
          return newPosition;
        });

        setVelocity(prevVelocity => prevVelocity + gravity);

        setObstacles(prevObstacles => {
          let newObstacles = prevObstacles
            .map(obstacle => ({ ...obstacle, x: obstacle.x - 2 }))
            .filter(obstacle => obstacle.x + obstacleWidth > 0);

          if (newObstacles.length === 0 || 
              newObstacles[newObstacles.length - 1].x < gameWidth - 250) {
            newObstacles.push({
              x: gameWidth,
              gapStart: Math.random() * (gameHeight - gapSize - 40) + 20
            });
          }

          newObstacles.forEach(obstacle => {
            if (
              obstacle.x < birdSize + 20 &&
              obstacle.x + obstacleWidth > 20 &&
              (birdPosition < obstacle.gapStart || 
               birdPosition + birdSize > obstacle.gapStart + gapSize)
            ) {
              setGameOver(true);
            }
          });

          newObstacles.forEach(obstacle => {
            if (obstacle.x + obstacleWidth < 20 && !obstacle.passed) {
              setScore(prev => prev + 1);
              obstacle.passed = true;
            }
          });

          return newObstacles;
        });
      }, 20);

      return () => clearInterval(gameLoop);
    }
  }, [gameHasStarted, gameOver, velocity, birdPosition]);

  const resetGame = () => {
    setBirdPosition(250);
    setGameHasStarted(false);
    setGameOver(false);
    setScore(0);
    setVelocity(0);
    setObstacles([]);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-800 p-4">
      <div 
        className="relative bg-sky-400 overflow-hidden border-4 border-white rounded-lg shadow-lg"
        style={{ width: gameWidth, height: gameHeight }}
        onClick={jump}
      >
        {/* Bird */}
        <div
          className="absolute bg-yellow-400 rounded-full shadow-md"
          style={{
            width: birdSize,
            height: birdSize,
            left: 20,
            top: birdPosition,
            transition: 'top 0.1s'
          }}
        />
        
        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <React.Fragment key={index}>
            <div
              className="absolute bg-green-500 border-r-4 border-green-700"
              style={{
                left: obstacle.x,
                top: 0,
                width: obstacleWidth,
                height: obstacle.gapStart
              }}
            />
            <div
              className="absolute bg-green-500 border-r-4 border-green-700"
              style={{
                left: obstacle.x,
                top: obstacle.gapStart + gapSize,
                width: obstacleWidth,
                height: gameHeight - (obstacle.gapStart + gapSize)
              }}
            />
          </React.Fragment>
        ))}

        {/* Game over screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center p-6 bg-white rounded-lg shadow-xl">
              <div className="text-3xl font-bold text-red-500 mb-4">Game Over!</div>
              <div className="text-2xl text-gray-700 mb-4">Score: {score}</div>
              <button
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Start screen */}
        {!gameHasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-2xl font-bold text-white text-center">
              Click or Press Space to Start
            </div>
          </div>
        )}

        {/* Score */}
        <div className="absolute top-4 left-4 text-4xl font-bold text-white drop-shadow-lg">
          {score}
        </div>
      </div>
    </div>
  );
};

export default FlappyBird;