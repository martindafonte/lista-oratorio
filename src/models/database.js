const Datastore = require('nedb');

// Security note: the database is saved to the file `datafile` on the local filesystem. It's deliberately placed in the `.data` directory
// which doesn't get copied if someone remixes the project.
const users = new Datastore({ filename: '.data/users_datafile', autoload: true });
const webhooks = new Datastore({ filename: '.data/webhooks_datafile', autoload: true });

/*
db.ensureIndex({ fieldName: 'cardId', unique: true }, function (err) {
  if (err) {
    console.error('Error setting up index on cardId');
    console.error(err.message);
  } else {
    console.log('🛠 Built unique index on cardId');
  }
});

db.ensureIndex({ fieldName: 'snoozeTime' }, function (err) {
  if (err) {
    console.error('Error setting up index on snoozeTime');
    console.error(err.message);
  } else {
    console.log('🛠 Built index on snoozeTime');
  }
});*/

users.count({}, (err, count) => {
  if (err) {
    console.error(err);
  } else {
    console.info(`DB currently has ${count} users`);
  }
});

webhooks.count({}, (err, count) => {
  if (err) {
    console.error(err);
  } else {
    console.info(`DB currently has ${count} webhooks`);
  }
});

module.exports = { users: users, webhooks: webhooks };