var azure = require('azure-storage');

var account = "zjor";
var accessKey = "pgFKgm3MRVcypZP1HFev+97nUR8SOflbm3Xj8MORDwFakAt9dW3O8XKezZEyR13TdabmrF7IfjNNNrevceUuWw==";
var serviceUrl = "https://zjor.blob.core.windows.net/";
var container = "images";

module.exports = function() {

	var service = azure.createBlobService(account, accessKey, serviceUrl);

	this.upload = function(filename, stream, length, callback) {
		service.createContainerIfNotExists(container, function(error, result, response){
		  if(!error) {
			service.createBlockBlobFromStream(container, filename, stream, length, null, callback);
		  } else {
		  	return callback(error);
		  }
		});
	};

	return this;
}

