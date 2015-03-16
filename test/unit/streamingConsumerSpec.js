'use strict';

var nock = require('nock');
// var expect = require('chai').expect;
var Promise = require('bluebird');
var client = require('../../lib/client');

var GROUP_NAME = 'testGroup';
var CONSUMER_ID = 'testConsumer';
var TOPIC_NAME = 'testTopic';
var POLL_INTERVAL = 250;
var consumerInstance = client.consumer(GROUP_NAME, CONSUMER_ID);
Promise.promisifyAll(consumerInstance);

client.setHost('http://test.confluent-rest-js.io');
  
describe('Streaming Consumer', function(){

  beforeEach(function(){
    nock.cleanAll();
  });

  describe('POST /consumers/:groupName (Creating a consumer)', function(){

    var numReceived = 0;

    it('should work', function(done){
      
      var makeRecordsAvailable = function(){
        nock('http://test.confluent-rest-js.io')
          .matchHeader('Accept', 'application/vnd.kafka.avro.v1+json')
          .get('/consumers/testGroup/instances/testConsumer/topics/testTopic')
          .thrice()
          .replyWithFile(200, 'test/unit/responses/consumerInstance/consume.json', {
           'Content-Type': 'application/vnd.kafka.avro.v1+json'
          });
      };
      
      makeRecordsAvailable();
      var streamingConsumer = consumerInstance.createStreamingConsumer(POLL_INTERVAL, TOPIC_NAME);
      streamingConsumer.start();

      streamingConsumer.on('data', function(record){
        makeRecordsAvailable();
        numReceived += 1;
        if(numReceived === 5) {
          return done();
        } 
      });

      streamingConsumer.on('error', function(error){
        done(error);
      });

    });

  });

});