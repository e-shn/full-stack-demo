module.exports = {
  default: {
    paths: ['bdd/features/**/*.feature'],
    require: ['bdd/support/**/*.js', 'bdd/steps/**/*.js'],
    format: ['progress'],
    publishQuiet: true,
  },
};
