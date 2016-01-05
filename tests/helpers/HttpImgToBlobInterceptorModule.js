angular.module('HttpImgToBlobInterceptorModule', [])

.config(function($httpProvider){
	$httpProvider.interceptors.push('httpToBlobInterceptor');
})



.factory('httpToBlobInterceptor', function (){
    
    var _blobPerUrl = {};

    var interceptor = {};
    
    interceptor.response = function(response){
        if(response.config.url in _blobPerUrl){
            response.data = _blobPerUrl[response.config.url];    
        }
        return response;
    }

    interceptor.setBlobForUrl = function(blob, url){
        _blobPerUrl[url] = blob;
    };
    
    return interceptor;
});





