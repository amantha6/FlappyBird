import React, { useState, useEffect, useCallback, useRef } from 'react';
import './styles.css';

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [birdRotation, setBirdRotation] = useState(0);
  const [clouds, setClouds] = useState([]);
  
  // Game constants
  const gravity = 0.5;
  const jumpStrength = -8;
  const gameWidth = 400;
  const gameHeight = 500;
  const birdSize = 30; // Better bird size
  const obstacleWidth = 60;
  const gapSize = 150;
  const obstacleSpeed = 3;
  
  // Refs
  const birdRef = useRef(null);
  const scoreRef = useRef(null);
  const gameAreaRef = useRef(null);
  
  // Load high score from localStorage on first render
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  // Jump handler
  const jump = useCallback(() => {
    if (!gameOver) {
      setVelocity(jumpStrength);
      setBirdRotation(-20);
      
      if (birdRef.current) {
        birdRef.current.style.transform = 'scale(0.9, 1.1)';
        setTimeout(() => {
          if (birdRef.current) {
            birdRef.current.style.transform = 'scale(1)';
          }
        }, 100);
      }
      
      if (!gameHasStarted) {
        setGameHasStarted(true);
      }
    }
  }, [gameOver, gameHasStarted]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  // Game loop
  useEffect(() => {
    if (gameHasStarted && !gameOver) {
      const gameLoop = setInterval(() => {
        // Update bird position and rotation
        setBirdPosition((prevPosition) => {
          const newPosition = prevPosition + velocity;
          if (newPosition < 0 || newPosition > gameHeight - birdSize) {
            setGameOver(true);
            return prevPosition;
          }
          return newPosition;
        });

        setVelocity(prevVelocity => {
          const newVelocity = prevVelocity + gravity;
          setBirdRotation(Math.min(30, newVelocity * 3));
          return newVelocity;
        });

        // Update obstacles and check score - IMPORTANT: This fixes the scoring issue
        setObstacles(prevObstacles => {
          // Create copies for immutable updates
          let obstaclesCopy = [...prevObstacles];
          let scoreIncremented = false;
          
          // Move obstacles
          obstaclesCopy = obstaclesCopy
            .map(obstacle => ({ ...obstacle, x: obstacle.x - obstacleSpeed }))
            .filter(obstacle => obstacle.x + obstacleWidth > 0);
          
          // Add new obstacle when needed
          if (obstaclesCopy.length === 0 || 
              obstaclesCopy[obstaclesCopy.length - 1].x < gameWidth - 250) {
            obstaclesCopy.push({
              x: gameWidth,
              gapStart: Math.random() * (gameHeight - gapSize - 80) + 40,
              passed: false
            });
          }
          
          // Check for collisions
          for (let i = 0; i < obstaclesCopy.length; i++) {
            const obstacle = obstaclesCopy[i];
            if (
              obstacle.x < (birdSize/2) + 25 &&
              obstacle.x + obstacleWidth > 25 &&
              (birdPosition < obstacle.gapStart || 
               birdPosition + birdSize > obstacle.gapStart + gapSize)
            ) {
              setGameOver(true);
            }
            
            // Increment score - ONE TIME ONLY per obstacle
            if (!obstacle.passed && obstacle.x + obstacleWidth < 25) {
              obstaclesCopy[i] = { ...obstacle, passed: true };
              if (!scoreIncremented) {
                scoreIncremented = true;
                // We'll update the score outside this loop
              }
            }
          }
          
          // Update score only once per frame if an obstacle was passed
          if (scoreIncremented) {
            setScore(prevScore => {
              const newScore = prevScore + 1;
              
              // Animate score
              if (scoreRef.current) {
                scoreRef.current.style.transform = 'scale(1.3)';
                setTimeout(() => {
                  if (scoreRef.current) {
                    scoreRef.current.style.transform = 'scale(1)';
                  }
                }, 100);
              }
              
              // Update high score if needed
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('flappyBirdHighScore', newScore.toString());
              }
              
              return newScore;
            });
          }
          
          return obstaclesCopy;
        });
      }, 20);

      return () => clearInterval(gameLoop);
    }
  }, [gameHasStarted, gameOver, velocity, birdPosition, highScore, obstacleSpeed, birdSize]);

  // Reset game handler
  const resetGame = () => {
    setBirdPosition(250);
    setGameHasStarted(false);
    setGameOver(false);
    setScore(0);
    setVelocity(0);
    setBirdRotation(0);
    setObstacles([]);
  };

  return (
    <div className="game-container">
      <div ref={gameAreaRef} className="game-area" onClick={jump}>
        {/* Simple bird with better design */}
        <div 
          ref={birdRef}
          className="bird"
          style={{ 
            top: birdPosition,
            transform: `rotate(${birdRotation}deg)`
          }}
        />
        
        {/* Obstacles */}
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

        <div ref={scoreRef} className="score">{score}</div>
        <div className="high-score">Best: {highScore}</div>

        {gameOver && (
          <div className="screen-overlay">
            <div className="game-over">
              <h2>Game Over!</h2>
              <p>Score: {score}</p>
              <p>Best Score: {highScore}</p>
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
