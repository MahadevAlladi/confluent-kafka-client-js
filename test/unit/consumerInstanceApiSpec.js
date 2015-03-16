'use strict';

var nock = require('nock');
var expect = require('chai').expect;
var Promise = require('bluebird');
var client = require('../../lib/client');

var GROUP_NAME = 'testGroup';
var CONSUMER_ID = 'testConsumer';

client.setHost('http://test.confluent-rest-js.io');
var consumerInstanceApi = client.consumer(GROUP_NAME, CONSUMER_ID);
Promise.promisifyAll(consumerInstanceApi);

describe('Consumer Instance Api', function(){

  beforeEach(function(){
    nock.cleanAll();
  });

  describe('POST /consumers/:groupName/instances/:instanceId/offsets (Committing offsets)', function(){

    it('should work', function(){
      nock('http://test.confluent-rest-js.io')
        .matchHeader('Accept', 'application/vnd.kafka.v1+json')
        .post('/consumers/testGroup/instances/testConsumer/offsets')
        .replyWithFile(200, 'test/unit/responses/consumerInstance/offsets.json', {
          'Content-Type': 'application/vnd.kafka.v1+json'
        });

      return consumerInstanceApi.commitOffsetsAsync().then(function(result){
        expect(result.length).to.eql(3);
      });

    });
  });

  describe('GET /consumers/:groupName/instances/:instanceId/topics/:topic (Consuming messages)', function(){

    var topicName = 'testTopic';

    it('should work', function(){
      nock('http://test.confluent-rest-js.io')
        .matchHeader('Accept', 'application/vnd.kafka.avro.v1+json')
        .get('/consumers/testGroup/instances/testConsumer/topics/testTopic')
        .replyWithFile(200, 'test/unit/responses/consumerInstance/consume.json', {
         'Content-Type': 'application/vnd.kafka.avro.v1+json'
        });

      return consumerInstanceApi.consumeAsync(topicName, {}).then(function(result){
        expect(result.length).to.eql(2);
      });
    
    });

  });

  describe('DELETE /consumers/:groupName/instances/:instanceId (Deleting a consumer)', function(){

    it('should work', function(){
      nock('http://test.confluent-rest-js.io')
        .matchHeader('Accept', 'application/vnd.kafka.v1+json')
        .delete('/consumers/testGroup/instances/testConsumer')
        .reply(204, {}, {
          'Content-Type': 'application/vnd.kafka.v1+json'
        });
      return consumerInstanceApi.deleteAsync();
    });

  });


});