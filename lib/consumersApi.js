'use strict';

var _ = require('underscore');
var request = require('superagent');

var ConsumersApi = function(client){
  this.client = client;
};

ConsumersApi.prototype.create = function(groupName, options, callback) {
  _.defaults(options, {
    format: 'avro'
  });

  return request
    .post(this.client.urlFor('/consumers/' + groupName))
    .type(this.client.defaultContentType)
    .send(JSON.stringify(options))
    .end(this.client.responseHandler.withCallback(callback));
};

ConsumersApi.prototype.createStreamingConsumer = function(pollInterval, topicName, groupName, options, callback) {
  var client = this.client;
  this.create(groupName, options, function(err, res){
    if(err) { return callback(err, null); }
    var consumer = client.consumer(groupName, res.instance_id);
    callback(null, consumer.createStreamingConsumer(pollInterval, topicName));
  });
};

module.exports = function(client){
  return new ConsumersApi(client);
};