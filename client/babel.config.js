module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'module:react-native-dotenv', 
    [
      '@babel/plugin-transform-runtime',
      {
        absoluteRuntime: false,
        corejs: false,
        helpers: true,
        regenerator: true,
        version: '7.0.0-beta.0',
      },
    ],
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-optional-chaining',
    'react-native-reanimated/plugin',
  ],
};
