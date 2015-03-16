'use strict';

var request = require('superagent');

var TopicsApi = function(client){
  this.client = client;
};

TopicsApi.prototype.list = function(callback){
  return request
    .get(this.client.urlFor('/topics'))
    .accept(this.client.defaultContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

TopicsApi.prototype.get = function(topicName, callback) {
  return request
    .get(this.client.urlFor('/topics/' + topicName))
    .accept(this.client.defaultContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

TopicsApi.prototype.produceMessage = function(topicName, payload, callback) {
  return request
    .post(this.client.urlFor('/topics/' + topicName))
    .type(this.client.avroContentType)
    .send(JSON.stringify(payload))
    .end(this.client.responseHandler.withCallback(callback));
};

module.exports = function(client){
  return new TopicsApi(client);
};