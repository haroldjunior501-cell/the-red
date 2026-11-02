const appJson = require('./app.json');

module.exports = ({ config }) => ({
  ...config,
  ...appJson.expo,
  owner: 'nguemeta',
  extra: {
    ...(appJson.expo.extra ?? {}),
    eas: {
      projectId: '9ee70df9-8045-4d09-9029-304b6aee291f',
    },
  },
});
