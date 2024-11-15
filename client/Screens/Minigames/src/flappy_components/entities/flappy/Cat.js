import React from 'react';
import Matter from 'matter-js';
import { View, ImageBackground } from 'react-native';

const Cat = props => {
  const widthBody = props.body.bounds.max.x - props.body.bounds.min.x;
  const heightBody = props.body.bounds.max.y - props.body.bounds.min.y;

  const xBody = props.body.position.x - widthBody / 2;
  const yBody = props.body.position.y - heightBody / 2;

  const { color } = props;

  return (
    <ImageBackground
      source={require('../../cat.png')} // Directly using require here
      resizeMode="contain"
      style={{
        position: 'absolute',
        left: xBody,
        top: yBody,
        width: widthBody,
        height: heightBody,
      }}
    />
  );
};

export default (world, color, pos, size) => {
  const initialCat = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    { label: 'Cat' }
  );
  Matter.World.add(world, initialCat);

  return {
    body: initialCat,
    color,
    pos,
    renderer: Cat,
  };
};
