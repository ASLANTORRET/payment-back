exports.client = function(redis, bluebird, url) {
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);
  let client = redis.createClient({
      url: url,
      retry_strategy: function(options) {
          if (options.error.code === 'ECONNREFUSED') {
              // End reconnecting on a specific error and flush all commands with a individual error
              return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
              // End reconnecting after a specific timeout and flush all commands with a individual error
              return new Error('Retry time exhausted');
          }
          if (options.times_connected > 10) {
              // End reconnecting with built in error
              return undefined;
          }
          // reconnect after
          return Math.max(options.attempt * 100, 3000);
      }
  });

  client.on('error', function(err) {
      loggerHelper.error(err);
  });
  return client;
};
