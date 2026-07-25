module.exports = function (api) {
    api.cache(true);

    // Set expo-router app root before any transforms
    // Set expo-router app root before any transforms
    // process.env.EXPO_ROUTER_APP_ROOT = "./app";

    return {
        presets: ['babel-preset-expo'],
    };
};
