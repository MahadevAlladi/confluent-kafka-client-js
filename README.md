[![Circle CI](https://circleci.com/gh/blikkhq/confluent-kafka-client-js.svg?style=svg)](https://circleci.com/gh/blikkhq/confluent-kafka-client-js)

A lightweight Javascript wrapper for the [Confluent Kafka REST API](http://confluent.io/docs/current/kafka-rest/docs/intro.html). 

**This library is under construction, so there will be bugs and missing features.(* Pull requests welcome!

## Usage

The example below show standard node.js callback-based methods. The library can also be promisified with [Bluebird](https://github.com/petkaantonov/bluebird). Take a look at the tests to see what thay may look like.

```javascript
var client = require('confluent-kafka-client');
client.setHost('http://your-kafka-rest-api.io:8082');

var valueSchema = {
  name: 'int',
  type: 'int'
};

// Produce some messages
client.topics.produceMessages('YOUR_TOPIC', {
  value_schema: JSON.stringify(valueSchema),
  records: [{value: 10}, {value: 100}]
}, function(err, res){
  // ...
});

// Create a consumer
client.consumers.create('YOUR_CONSUMER_GROUP', 
  {'auto.offset.reset': 'smallest'}, function(err, res){
  return client.consumer(res.instance_id).consume('YOUR_TOPIC', function(err, data){
    console.log(data);
  });
});

```

## Polling/Streaming consumer

A wrapper around the consumer that periodically polls for new records.

```javascript
var client = require('confluent-kafka-client');
client.setHost('http://your-kafka-rest-api.io:8082');

// 500ms poll interval
client.consumers.createStreamingConsumerAsync(500, 'YOUR_TOPIC', 
  'YOUR_CONSUMER_GROUP', {'auto.offset.reset': 'smallest'}, function(err, streamingConsumer){
  streamingConsumer.start();
  streamingConsumer.on('data', function(data){
    console.log(data);
  });
  streamingConsumer.on('error', function(error){
    console.log(error);
  });
});
```


## TODO

- Implement the [Partitions API](http://confluent.io/docs/current/kafka-rest/docs/api.html#partitions)
- Implement the [Brokers API](http://confluent.io/docs/current/kafka-rest/docs/api.html#brokers)
- Implement request batching features [as described in the documentation](http://confluent.io/docs/current/app-development.html#non-java-applications-rest-proxy)
- Be smart about re-using schema ids when possible?