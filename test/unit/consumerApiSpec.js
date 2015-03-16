'use strict';

var nock = require('nock');
var expect = require('chai').expect;
var Promise = require('bluebird');
var client = require('../../lib/client');
var consumersApi = client.consumers;

client.setHost('http://test.confluent-rest-js.io');
Promise.promisifyAll(consumersApi);

var nockScope = nock('http://test.confluent-rest-js.io').defaultReplyHeaders({
  'Content-Type': 'application/vnd.kafka.v1+json'
});

describe('Consumers Api', function(){

  describe('POST /consumers/:groupName (Creating a consumer)', function(){

    var groupName = 'testGroup';

    it('should work', function(){
      nockScope.post('/consumers/' + groupName)
        .matchHeader('Content-Type', 'application/vnd.kafka.v1+json')
        .reply(200, {
          instance_id: 'my_consumer',
          base_uri: 'http://test.confluent-rest-js.io/consumers/testGroup/instances/my_consumer'
        });
      
      return consumersApi.createAsync(groupName, {
        id: 'my_consumer',
        format: 'avro'
      }).then(function(result){
        expect(result.instance_id).to.eql('my_consumer');
      });
    });

  });

});