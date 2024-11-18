import Matter from 'matter-js';
import Cat from './flappy/Cat';
import Floor from './flappy/Floor';
import Obstacles from './flappy/Obstacles';
import {Dimensions} from 'react-native';
import {getPipeSizePosPair} from '../utils/random';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default restart => {
  let engine = Matter.Engine.create({enableSleeping: false});
  let world = engine.world;
  world.gravity.y = 1;

  // Define spaced positions for each obstacle
  const spacing = windowWidth * 1.2; // Horizontal space between each set
  const pipeSizePosA = getPipeSizePosPair();
  const pipeSizePosB = getPipeSizePosPair(spacing);
  const pipeSizePosC = getPipeSizePosPair(spacing * 2);
  const pipeSizePosD = getPipeSizePosPair(spacing * 3);
  const pipeSizePosE = getPipeSizePosPair(spacing * 4);

  const catEntity = Cat(
    world,
    'orange',
    {x: 80, y: 200},
    {height: 50, width: 50},
  );

  const obstacleTop1Entity = Obstacles(
    world,
    'obstacleTop1Entity',
    ['#90ee90', '#006400'],
    pipeSizePosA.pipeTop.pos,
    pipeSizePosA.pipeTop.size,
  );
  const obstacleBottom1Entity = Obstacles(
    world,
    'obstacleBottom1Entity',
    ['#006400', '#90ee90'],
    pipeSizePosA.pipeBottom.pos,
    pipeSizePosA.pipeBottom.size,
  );

  const obstacleTop2Entity = Obstacles(
    world,
    'obstacleTop2Entity',
    ['#90ee90', '#006400'],
    pipeSizePosB.pipeTop.pos,
    pipeSizePosB.pipeTop.size,
  );
  const obstacleBottom2Entity = Obstacles(
    world,
    'obstacleBottom2Entity',
    ['#006400', '#90ee90'],
    pipeSizePosB.pipeBottom.pos,
    pipeSizePosB.pipeBottom.size,
  );

  const obstacleTop3Entity = Obstacles(
    world,
    'obstacleTop3Entity',
    ['#90ee90', '#006400'],
    pipeSizePosC.pipeTop.pos,
    pipeSizePosC.pipeTop.size,
  );
  const obstacleBottom3Entity = Obstacles(
    world,
    'obstacleBottom3Entity',
    ['#006400', '#90ee90'],
    pipeSizePosC.pipeBottom.pos,
    pipeSizePosC.pipeBottom.size,
  );

  const obstacleTop4Entity = Obstacles(
    world,
    'obstacleTop4Entity',
    ['#90ee90', '#006400'],
    pipeSizePosD.pipeTop.pos,
    pipeSizePosD.pipeTop.size,
  );
  const obstacleBottom4Entity = Obstacles(
    world,
    'obstacleBottom4Entity',
    ['#006400', '#90ee90'],
    pipeSizePosD.pipeBottom.pos,
    pipeSizePosD.pipeBottom.size,
  );

  const obstacleTop5Entity = Obstacles(
    world,
    'obstacleTop5Entity',
    ['#90ee90', '#006400'],
    pipeSizePosE.pipeTop.pos,
    pipeSizePosE.pipeTop.size,
  );
  const obstacleBottom5Entity = Obstacles(
    world,
    'obstacleBottom5Entity',
    ['#006400', '#90ee90'],
    pipeSizePosE.pipeBottom.pos,
    pipeSizePosE.pipeBottom.size,
  );

  const floorEntity = Floor(
    world,
    'darkgreen',
    {x: windowWidth / 2, y: windowHeight},
    {height: 200, width: windowWidth},
  );

  return {
    physics: {engine, world},
    ObstacleTop1: obstacleTop1Entity,
    ObstacleBottom1: obstacleBottom1Entity,
    ObstacleTop2: obstacleTop2Entity,
    ObstacleBottom2: obstacleBottom2Entity,
    ObstacleTop3: obstacleTop3Entity,
    ObstacleBottom3: obstacleBottom3Entity,
    ObstacleTop4: obstacleTop4Entity,
    ObstacleBottom4: obstacleBottom4Entity,
    ObstacleTop5: obstacleTop5Entity,
    ObstacleBottom5: obstacleBottom5Entity,
    Floor: floorEntity,
    Cat: catEntity,
  };
};
