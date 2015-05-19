/**
 * This is the CitySDK USDA SNAP Retailer API Module
 * This module requires no key.
 * Using same programming methodology as the Farmer's Market data.
 */

//Attach a new module object to the CitySDK prototype.
//It is advised to keep the filenames and module property names the same
CitySDK.prototype.modules.snapRetailer= new SnapRetailerModule();

//Module object definition. Every module should have an "enabled" property and an "enable"  function.
function SnapRetailerModule() {
    this.enabled = false;
};

//Enable function. Stores the API key for this module and sets it as enabled
SnapRetailerModule.prototype.enable = function() {
    this.enabled = true;
};

/**
 * Searches near a specified lat/lng or zipcode
 *
 * request = { lat: 34, lng: 77 }
 * Or
 * request = { zip: 20002 }
 *
 * Response:
 *
 * {
 *   "results": [
 *       {
 *           "layerId": 0,
 *           "layerName": "retailer",
 *           "displayFieldName": "store_name",
 *           "foundFieldName": "ZIP5",
 *           "value": "20010",
 *           "attributes": {
 *               "OBJECTID": "5438",
 *               "STORE_NAME": "GIANT FOOD 378",
 *               "longitude": "-77.031128",
 *               "latitude": "38.930901",
 *               "ADDRESS": "1345 Park Rd NW",
 *               "ADDRESS2": "Null",
 *               "CITY": "Washington",
 *               "STATE": "DC",
 *               "ZIP5": "20010",
 *               "zip4": "2307",
 *               "County": "DIST OF COLUMBIA",
 *               "Shape": "Point"
 *           },
 *           "geometryType": "esriGeometryPoint",
 *           "geometry": {
 *               "x": -8575065.9442,
 *               "y": 4711778.5613,
 *               "spatialReference": {
 *                   "wkid": 102100
 *               }
 *           }
 *       }
 *   ]
 

 /*
    http://snap-load-balancer-244858692.us-east-1.elb.amazonaws.com/ArcGIS/
    rest/services/retailer/MapServer
    /find?searchText=20010&contains=true&searchFields=&sr=&layers=0,2&returnGeometry=true
    search fields:  ZIP5, longtitude, latitutde
*/
/*
 *
 * @param request
 * @param callback
 */
SnapRetailerModule.prototype.search = function(request, callback) {
    var latPattern = /({lat})/;
    var lngPattern = /({lng})/;
    var zipPattern = /({zip})/;

    var fragmentPattern = /({fragment})/;

    //Check for geographical data
    //Allow the users to use either x,y; lat,lng; latitude,longitude to sepecify co-ordinates
    if(!("lat" in request)) {
        if("latitude" in request) {
            request.lat = request.latitude;
            delete request.latitude;
        } else if ("y" in request) {
            request.lat = request.y;
            delete request.y;
        }
    }

    if(!("lng" in request)) {
        if("longitude" in request) {
            request.lng = request.longitude;
            delete request.longitude;
        } else if("x" in request) {
            request.lng = request.x;
            delete request.x;
        }
    }
   
    var zipFragment = "searchFields=ZIP5&searchText={zip}";
    var locFragment = "searchFields=longtitude,latitutde&searchText={loc},{lang}";

    var snapRetailerURL = " http://snap-load-balancer-244858692.us-east-1.elb.amazonaws.com/ArcGIS/rest/services/retailer/MapServer/find?searchText=20010&contains=true&searchFields=&sr=&layers=0,2&returnGeometry=true{fragment}";
    if("lat" in request && "lng" in request) {
        snapRetailerURL = snapRetailerURL.replace(fragmentPattern, locFragment);
    } else {
        snapRetailertURL = snapRetailerURL.replace(fragmentPattern, zipFragment);
    }

    snapRetailerURL = snapRetailerURL.replace(zipPattern, request.zip);
    snapRetailerURL = snapRetailerURL.replace(latPattern, request.lat);
    snapRetailerURL = snapRetailerURL.replace(lngPattern, request.lng);

    CitySDK.prototype.sdkInstance.jsonpRequest(snapRetailerURL).done(
        function(response) {
            callback(response);
        }
    );
};


/**
 * Requests details about the farmer's market with specified id
 *
 * Example request: {
 *                      id: 2201
 *                  }
 *
 * Response:
 * {
 *  "feature" : 
 *  {
 *   "attributes" : {
 *     "OBJECTID" : 46465, 
 *     "STORE_NAME" : "Dollar giant", 
 *     "longitude" : -74.781265, 
 *     "latitude" : 39.642338, 
 *     "ADDRESS" : "240 South White Horse Pike", 
 *     "ADDRESS2" : null, 
 *     "CITY" : "Hammonton", 
 *     "STATE" : "NJ", 
 *     "ZIP5" : "08037", 
 *     "zip4" : "1156", 
 *     "County" : "ATLANTIC"
 *   }
 *   , 
 *   "geometry" : 
 *   {
 *     "x" : -8324612.3407, 
 *     "y" : 4814103.1241
 *   }
 * }
 * }
 * @param request
 * @param callback
 */
SnapRetailerModule.prototype.detail = function(request, callback) {
    var idPattern = /({id})/;

    var detailURL = "http://snap-load-balancer-244858692.us-east-1.elb.amazonaws.com/ArcGIS/rest/services/retailer/MapServer/0/{id}?f=json";

    detailURL = detailURL.replace(idPattern, request.id);

    CitySDK.prototype.sdkInstance.jsonpRequest(detailURL).done(
        function(response) {
            callback(response);
        }
    );
};

//After this point the module is all up to you
//References to an instance of the SDK should be called as:
CitySDK.prototype.sdkInstance;
//And references to this module should be called as
CitySDK.prototype.modules.snapRetailer;
//when 'this' is ambiguous