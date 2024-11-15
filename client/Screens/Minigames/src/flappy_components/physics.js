import Matter from 'matter-js';
import {Dimensions} from 'react-native';

const windowWidth = Dimensions.get('window').width;
const MAX_DELTA = 16.667;

const Physics = (entities, {touches, time, dispatch}) => {
  let engine = entities.physics.engine;

  const maxObstacles = 5;
  let passedObstacles = entities.passedObstacles || 0;
  let gameWon = entities.gameWon || false;
  let gameLost = entities.gameLost || false;

  // Handle touch input for jumping
  touches
    .filter(t => t.type === 'press')
    .forEach(t => {
      if (!gameWon && !gameLost) {
        Matter.Body.setVelocity(entities.Cat.body, {x: 0, y: -8});
      }
    });

  // Throttle the delta time to MAX_DELTA to avoid large time steps
  const delta = Math.min(time.delta, MAX_DELTA);

  // Update the Matter.js engine with the throttled delta
  Matter.Engine.update(engine, delta);

  // Move obstacles and log their positions
  for (let index = 1; index <= maxObstacles; index++) {
    const obstacleTop = entities[`ObstacleTop${index}`];
    const obstacleBottom = entities[`ObstacleBottom${index}`];

    if (obstacleTop && obstacleBottom && !gameWon && !gameLost) {
      // Move obstacles to the left
      Matter.Body.translate(obstacleTop.body, {x: -3, y: 0});
      Matter.Body.translate(obstacleBottom.body, {x: -3, y: 0});

      // Log entry and exit for obstacles
      if (
        obstacleTop.body.position.x < windowWidth &&
        !obstacleTop.hasEntered
      ) {
        console.log(`Obstacle ${index} has entered the screen.`);
        obstacleTop.hasEntered = true; // Mark as entered
      }
      if (obstacleTop.body.position.x < -50 && !obstacleTop.hasExited) {
        console.log(`Obstacle ${index} has exited the screen.`);
        obstacleTop.hasExited = true; // Mark as exited
        passedObstacles += 1;

        // Check for win condition
        if (passedObstacles >= maxObstacles) {
          dispatch({type: 'game_won'});
          gameWon = true;
        }
      }
    }
  }

  // Collision detection for game over
  Matter.Events.on(engine, 'collisionStart', event => {
    if (!gameWon && !gameLost) {
      const pairs = event.pairs;
      pairs.forEach(pair => {
        const {bodyA, bodyB} = pair;
        if (bodyA.label === 'Cat' || bodyB.label === 'Cat') {
          dispatch({type: 'game_over'});
          gameLost = true;
        }
      });
    }
  });

  // Update entities with the latest game state
  entities.passedObstacles = passedObstacles;
  entities.gameWon = gameWon;
  entities.gameLost = gameLost;

  return entities;
};

export default Physics;
