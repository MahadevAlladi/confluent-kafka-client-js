'use strict';

var Promise = require('bluebird');
var util = require('util');
var events = require('events');

var StreamingConsumer = function(consumerInstance, pollInterval, topicName){
  this.pollInterval = pollInterval;
  this.topicName = topicName;
  this.consumerInstance = consumerInstance;
  Promise.promisifyAll(this.consumerInstance);
};

util.inherits(StreamingConsumer, events.EventEmitter);

StreamingConsumer.prototype.pull = function() {
  var streamingConsumer = this;
  this.consumerInstance
    .consumeAsync(this.topicName, {})
    .then(function(data){
      data.forEach(function(record){
        streamingConsumer.emit('data', record);
      });
    }).catch(function(err){
      streamingConsumer.emit('error', err);
    });
};

StreamingConsumer.prototype.start = function() {
  this.interval = setInterval(this.pull.bind(this), this.pollInterval);
};

StreamingConsumer.prototype.stop = function() {
  clearInterval(this.interval);
  this.interval = null;
};

module.exports = function(consumerInstance, pollInterval, topicName){
  return new StreamingConsumer(consumerInstance, pollInterval, topicName);
};