import React, { useState, useEffect, useCallback } from 'react';
import './styles.css';

function App() {
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
    <div className="game-container">
      <div className="game-area" onClick={jump}>
        <div 
          className="bird"
          style={{ top: birdPosition }}
        />
        
        {obstacles.map((obstacle, index) => (
          <React.Fragment key={index}>
            <div
              className="obstacle"
              style={{
                left: obstacle.x,
                top: 0,
                height: obstacle.gapStart
              }}
            />
            <div
              className="obstacle"
              style={{
                left: obstacle.x,
                top: obstacle.gapStart + gapSize,
                height: gameHeight - (obstacle.gapStart + gapSize)
              }}
            />
          </React.Fragment>
        ))}

        <div className="score">{score}</div>

        {gameOver && (
          <div className="screen-overlay">
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Score: {score}</p>
              <button
                className="play-again"
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

        {!gameHasStarted && !gameOver && (
          <div className="screen-overlay">
            <div className="start-message">
              Click or Press Space to Start
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;