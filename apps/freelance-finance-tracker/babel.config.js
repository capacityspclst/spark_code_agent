export default function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // other babel config if needed
  };
}