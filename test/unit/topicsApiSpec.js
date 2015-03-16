'use strict';

var path = require('path');
var nock = require('nock');
var expect = require('chai').expect;
var Promise = require('bluebird');
var client = require('../../lib/client');
var topicsApi = client.topics;

var responsesDir = path.join(path.dirname(__filename), '/responses');

client.setHost('http://test.confluent-rest-js.io');
Promise.promisifyAll(topicsApi);

describe('Topics Api', function(){

  beforeEach(function(){
    nock.cleanAll();
  })

  describe('GET /topics (Listing topics)', function(){

    it('should work', function(){
      
      nock('http://test.confluent-rest-js.io')
        .get('/topics')
        .matchHeader('Accept', 'application/vnd.kafka.v1+json')
        .reply(200, ['topic1', 'topic2'], {
          'Content-Type': 'application/vnd.kafka.v1+json'
        });

      return topicsApi.listAsync().then(function(result){
        expect(result).to.eql(['topic1', 'topic2']);
      });
    });

  });

  describe('GET /topics/:id (Getting topic metadata)', function(){

    it('should work', function(){
      var topicId = 'test';
      
      nock('http://test.confluent-rest-js.io')
        .get('/topics/' + topicId)
        .matchHeader('Accept', 'application/vnd.kafka.v1+json')
        .replyWithFile(200, responsesDir + '/topics/show.json', {
          'Content-Type': 'application/vnd.kafka.v1+json'
        });

      return topicsApi.getAsync(topicId).then(function(result){
        expect(result.name).to.eql('test');
        expect(result.partitions.length).to.eql(2);
      });
    });

  });

  describe('POST /topics (Producing messages)', function(){

    it('should work', function(){
      var topicId = 'test';
      var testMessage = {
        value_schema: JSON.stringify({name: 'int', type: 'int'}),
        records: [{
          value: 12
        },{
          value: 24,
          partition: 1
        }]
      };
      
      nock('http://test.confluent-rest-js.io')
        .post('/topics/' + topicId)
        .matchHeader('Content-Type', 'application/vnd.kafka.avro.v1+json')
        .matchHeader('Accept', 'application/vnd.kafka.v1+json')
        .replyWithFile(200, responsesDir + '/topics/produceMessage.json', {
          'Content-Type': 'application/vnd.kafka.v1+json'
        });

      return topicsApi.produceMessageAsync(topicId, testMessage).then(function(result){
        expect(result.value_schema_id).to.not.be.empty;
      });
    });

  });    

});