// Import LinearGradient
import LinearGradient from 'react-native-linear-gradient';
import { View } from 'react-native';
import Matter from 'matter-js';

const Obstacles = props => {
  const widthBody = props.body.bounds.max.x - props.body.bounds.min.x;
  const heightBody = props.body.bounds.max.y - props.body.bounds.min.y;

  const xBody = props.body.position.x - widthBody / 2;
  const yBody = props.body.position.y - heightBody / 2;

  // Check if props.color is a gradient (array of colors) or a single color
  const isGradient = Array.isArray(props.color);

  return (
    <View
      style={{
        position: 'absolute',
        left: xBody,
        top: yBody,
        width: widthBody,
        height: heightBody,
        overflow: 'hidden',
      }}
    >
      {isGradient ? (
        <LinearGradient
          colors={props.color} // gradient colors
          style={{  flex: 1, width: '100%', height: '100%' }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      ) : (
        <View
          style={{
            backgroundColor: props.color, // fallback to solid color if no gradient
            width: '100%',
            height: '100%',
          }}
        />
      )}
    </View>
  );
};

// Matter.js setup for the obstacle
export default (world, label, color, pos, size) => {
  const initialObstacles = Matter.Bodies.rectangle(
    pos.x,
    pos.y,
    size.width,
    size.height,
    {
      label,
      isStatic: true,
    }
  );
  Matter.World.add(world, initialObstacles);

  return {
    body: initialObstacles,
    color,
    pos,
    renderer: Obstacles, // Use custom Obstacles renderer
  };
};
