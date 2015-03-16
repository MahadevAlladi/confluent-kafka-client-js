'use strict';

// var _ = require('underscore');
// var expect = require('chai').expect;
var Promise = require('bluebird');
var client = require('../../lib/client');
var uuid = require('node-uuid');

if(!process.env.CONFLUENT_TEST_URI){
  console.log('You must set the CONFLUENT_TEST_URI environment variable.');
  process.exit(1);
}
client.setHost(process.env.CONFLUENT_TEST_URI);

Promise.promisifyAll(client.topics);
Promise.promisifyAll(client.consumers);

var TEST_TOPIC = 'topic-' + uuid.v1();
var CONSUMER_GROUP_NAME = 'consumer-group-' + uuid.v1();
var POLL_INTERVAL = 250;
console.log('Using topic %s for testing.', TEST_TOPIC);

// Create a new streaming consumer and listen for data
client.consumers.createStreamingConsumerAsync(POLL_INTERVAL, TEST_TOPIC, 
  CONSUMER_GROUP_NAME, {'auto.offset.reset': 'smallest'}).then(function(streamingConsumer){
    streamingConsumer.start();
    streamingConsumer.on('data', function(record){
      console.log('Got data: %s', JSON.stringify(record));
      if(record.value === 100){
        process.exit(0);
      }
    });
    streamingConsumer.on('error', function(error){
      console.log(error);
      process.exit(1);
    });
  });

// Produce message to the topic
var produceMessagesAsync = function(messages){
  return client.topics.produceMessagesAsync(TEST_TOPIC, {
    value_schema: JSON.stringify({
      name: 'int',
      type: 'int', 
    }),
    records: messages
  });
};

produceMessagesAsync([{value: 1}, {value: 2}])
  .delay(1000)
  .then(function(){
    return produceMessagesAsync([{value: 3}, {value: 4}, {value: 5}]);
  }).delay(1000)
  .then(function(){
    return produceMessagesAsync([{value: 100}]);
  }).catch(function(err){
    console.log(err);
    process.exit(1);
  });