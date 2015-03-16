'use strict';

var nock = require('nock');
var expect = require('chai').expect;
var Promise = require('bluebird');
var client = require('../../lib/client');
var consumersApi = client.consumers;

client.setHost('http://test.confluent-rest-js.io');
Promise.promisifyAll(consumersApi);


describe('Consumers Api', function(){

  beforeEach(function(){
    nock.cleanAll();
  });

  describe('POST /consumers/:groupName (Creating a consumer)', function(){

    var groupName = 'testGroup';

    it('should work', function(){
       nock('http://test.confluent-rest-js.io')
        .post('/consumers/' + groupName)
        .matchHeader('Content-Type', 'application/vnd.kafka.v1+json')
        .reply(200, {
          instance_id: 'my_consumer',
          base_uri: 'http://test.confluent-rest-js.io/consumers/testGroup/instances/my_consumer'
        }, {
          'Content-Type': 'application/vnd.kafka.v1+json'
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