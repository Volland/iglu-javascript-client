const conf = {
    "schema": "iglu:com.snowplowanalytics.iglu/resolver-config/jsonschema/1-0-0",
    "data": {
      "cacheSize": 800,
      "repositories": [
        {
          "name": "Iglu Central",
          "priority": 0,
          "vendorPrefixes": [
            "com.snowplowanalytics"
          ],
          "connection": {
            "http": {
              "uri": "http://iglucentral.com"
            }
          }
        },{
          "name": "Iglu LiveIntent",
          "priority": 5,
          "vendorPrefixes": [
            "com.retentiongrid",
            "com.liveintent"
          ],
          "connection": {
            "http": {
              "uri": "http://b-iglu.liadm.com"
            }
          }
        }
      ]
    }
  };
  
  const context =  {
    "schema": "iglu:com.snowplowanalytics.snowplow/contexts/jsonschema/1-0-0",
    "data": [
        {
            "schema": "iglu:com.google.analytics/cookies/jsonschema/1-0-0",
            "data": {
                "_ga": "_ga-1ctfgs6nl.1ctfgs6nl.1ctfgs6nl",
                "__utma": "__utma-1ctfgs6nl.1ctfgs6nl.1ctfgs6nl",
                "__utmb": "__utmb-1ctfgs6nl.1ctfgs6nl.1ctfgs6nl",
                "__utmc": "__utmc-1ctfgs6nl.1ctfgs6nl.1ctfgs6nl",
                "__utmv": "__utmv-1ctfgs6nl.1ctfgs6nl.1ctfgs6nl",
                "__utmz": "__utmz-1ctfgs6nl.1ctfgs6nl.1ctfgs6nl"
            }
        },
        {
            "schema": "iglu:com.liveintent/source_live_event/jsonschema/2-0-0",
            "data": {
                "pushedData": "{\"event\":\"viewCart\",\"items\":[{\"currency\":\"EUR\",\"id\":\"ITM1\",\"price\":12.32,\"quantity\":1}]}"
            }
        },
        {
            "schema": "iglu:com.liveintent/engagement/jsonschema/1-1-0",
            "data": {
                "tag": "add_product_to_cart",
                "contentId": "ITM1",
                "price": 12.32,
                "quantity": 1,
                "currency": "EUR"
            }
        },
        {
            "schema": "iglu:com.liveintent/live_event/jsonschema/2-0-0",
            "data": {
                "eventName": "addToCart",
                "segmentId": "dMuxANo5o-4"
            }
        },
        {
            "schema": "iglu:com.liveintent/conversion/jsonschema/3-0-1",
            "data": {
                "uServerConversionIds": [
                    100,
                    101
                ]
            }
        }
    ]
};

const IglueClient  = require('./src/iglu/iglu-client.js');
const contextValidator = new IglueClient(conf);

contextValidator.validateObject(context).then((validationResult) => {
    // self.goodContext[curretntContext] = validationResult;
     console.log('good context', validationResult);
 }).catch((validationError) => {
    // self.badContext[curretntContext] = validationError;
     console.log('bad context', validationError);
 });