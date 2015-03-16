'use strict';

var request = require('superagent');
var url = require('url');

var ConsumerInstanceApi = function(client, groupName, instanceId){
  this.client = client;
  this.baseUri = client.urlFor(['/consumers', groupName, 'instances', instanceId].join('/')) + '/';
};

ConsumerInstanceApi.prototype.commitOffsets = function(callback) {
  return request
    .post(url.resolve(this.baseUri, 'offsets'))
    .type(this.client.defaultContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

ConsumerInstanceApi.prototype.delete = function(callback) {
  return request
    .del(this.baseUri.slice(0,-1))
    .type(this.client.defaultContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

ConsumerInstanceApi.prototype.consume = function(topicName, options, callback) {
  return request
    .get(url.resolve(this.baseUri, 'topics/' + topicName))
    .query(options)
    .accept(this.client.avroContentType)
    .end(this.client.responseHandler.withCallback(callback));
};

module.exports = function(client, groupName, instanceId){
  return new ConsumerInstanceApi(client, groupName, instanceId);
};