'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
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
console.log('Using topic %s for testing.', TEST_TOPIC);

// Produce a message to a new topic
var produceMessagesAsync = function(){
  return client.topics.produceMessagesAsync(TEST_TOPIC, {
    value_schema: JSON.stringify({
      type: 'record', 
      name: 'User',
      fields: [{
        name: 'name',
        type: 'string'
      }]
    }),
    records: [
      { value: { 'name': 'testUser' } },
      { value: { 'name': 'testUser2' } },
      { value: { 'name': 'testUser3' } }
    ]
  }).then(function(result){
    expect(result.value_schema_id).to.exist;
    console.log('Created a schema with ID %s', result.value_schema_id);
    return client.topics.listAsync();
  }).then(function(topics){
    expect(topics).to.include(TEST_TOPIC);
  });
};

// Create a new consumer and consume all messages from the test topic
var consumeMessagesAsync = function(){
  return client.consumers.createAsync(CONSUMER_GROUP_NAME, {'auto.offset.reset': 'smallest'}).then(function(result){
    expect(result.instance_id).to.exist;
    expect(result.base_uri).to.exist;
    console.log('Created consumer instance %s with base uri "%s"', result.instance_id, result.base_uri);
    return result.instance_id;
  }).then(function(consumerInstanceId){
    var consumerApi = client.consumer(CONSUMER_GROUP_NAME, consumerInstanceId);
    Promise.promisifyAll(consumerApi);
    return consumerApi.consumeAsync(TEST_TOPIC, {});
  }).then(function(messages){
    expect(messages.length).to.eql(3);
    console.log('Consumed messages: %s', JSON.stringify(_.pluck(messages, 'value')));
  });
};

produceMessagesAsync()
  .then(consumeMessagesAsync)
  .catch(function(err){
    console.log(err);
    process.exit(1);
  });