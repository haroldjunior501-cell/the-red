// @ts-check
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const upstreamGetTransformOptions = config.transformer?.getTransformOptions;
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => {
    const opts = upstreamGetTransformOptions ? await upstreamGetTransformOptions() : {};
    return {
      ...opts,
      transform: {
        ...opts.transform,
        /** inlineRequires peut provoquer des « unknown module » au hot reload sur le Hub. */
        inlineRequires: false,
      },
    };
  },
};

module.exports = config;
