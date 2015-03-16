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

var nockScope = nock('http://test.confluent-rest-js.io')
  .defaultReplyHeaders({
    'Content-Type': 'application/vnd.kafka.v1+json'
  });

describe('Topics Api', function(){

  describe('GET /topics (Listing topics)', function(){

    it('should work', function(){
      nockScope.get('/topics').reply(200, ['topic1', 'topic2'])
      return topicsApi.listAsync().then(function(result){
        expect(result).to.eql(['topic1', 'topic2']);
      });
    });

  });

  describe('GET /topics/:id (Getting topic metadata)', function(){

    it('should work', function(){
      var topicId = 'test';
      nockScope.get('/topics/' + topicId).replyWithFile(200, responsesDir + '/topics/show.json');
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
      nockScope.post('/topics/' + topicId).replyWithFile(200, responsesDir + '/topics/produceMessage.json');
      return topicsApi.produceMessageAsync(topicId, testMessage).then(function(result){
        expect(result.value_schema_id).to.not.be.empty;
      });
    });

  });    

});