'use strict';

var request = require('superagent');
var url = require('url');
var streamingConsumerFactory = require('./streamingConsumer');

var ConsumerInstanceApi = function(client, groupName, instanceId){
  this.client = client;
  this.baseUri = client.urlFor(['/consumers', groupName, 'instances', instanceId].join('/')) + '/';
};

ConsumerInstanceApi.prototype.commitOffsets = function(callback) {
  return request
    .post(url.resolve(this.baseUri, 'offsets'))
    .accept(this.client.defaultContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

ConsumerInstanceApi.prototype.delete = function(callback) {
  return request
    .del(this.baseUri.slice(0,-1))
    .accept(this.client.defaultContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

ConsumerInstanceApi.prototype.consume = function(topicName, options, callback) {
  return request
    .get(url.resolve(this.baseUri, 'topics/' + topicName))
    .query(options)
    .accept(this.client.avroContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

ConsumerInstanceApi.prototype.createStreamingConsumer = function(pollInterval, topicName) {
  return streamingConsumerFactory(this, pollInterval, topicName);
};

module.exports = function(client, groupName, instanceId){
  return new ConsumerInstanceApi(client, groupName, instanceId);
};