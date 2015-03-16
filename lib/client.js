'use strict';

var _ = require('underscore');
var url = require('url');
var consumerInstanceApi = require('./consumerInstanceApi');

var ConfluentKafkaRestClient = function(){
  this.responseHandler = require('./responseHandler');
  this.defaultContentType = 'application/vnd.kafka.v1+json';
  this.avroContentType = 'application/vnd.kafka.avro.v1+json';
};

ConfluentKafkaRestClient.prototype.setHost = function(host) {
  this.host = host;
};

ConfluentKafkaRestClient.prototype.urlFor = function(){
  var pathSegments = _.values(arguments);
  pathSegments.unshift(this.host);
  return url.resolve.apply(url, pathSegments);
};

ConfluentKafkaRestClient.prototype.consumer = function(groupName, consumerId){
  return consumerInstanceApi(this, groupName, consumerId);
};

module.exports = function(){
  var instance = new ConfluentKafkaRestClient();
  instance.topics = require('./topicsApi')(instance);
  instance.consumers = require('./consumersApi')(instance);
  return instance;
}();
