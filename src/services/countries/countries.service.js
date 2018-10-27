const createService = require('feathers-mongodb');
const hooks = require('./countries.hooks');

module.exports = function() {
  const app = this;
  const mongoClient = app.get('mongoClient');

  const countryService = createService({});
  app.use('/countries', countryService);

  const service = app.service('countries');

  mongoClient.then(db => {
    service.Model = db.collection('countries');
  });

  service.hooks(hooks);
};
