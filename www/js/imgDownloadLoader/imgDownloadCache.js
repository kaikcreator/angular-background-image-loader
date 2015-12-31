angular.module('imgDownloadLoaderModule')

.config(function(downgularFileToolsProvider){
    downgularFileToolsProvider.usePersistentMemory(true);
    if(!window.cordova)
        downgularFileToolsProvider.setStorageQuota(50*1024*1024);
    else{
        downgularFileToolsProvider.setStorageQuota(0);
    }
})

.factory('imgDownloadCache', ['$q', '$rootScope', 'downgularFileTools', 'localStorageService', 'downgularQueue', function($q, $rootScope, downgularFileTools, localStorageService, downgularQueue){
    
    var Service = {};
    
    //private pub-sub methods, to notify downloads
    var onURLdownload = function(url, callback) {
        return $rootScope.$on(url, function(){
           callback();
        });
    };
    var notifyURLdownload=  function(url){
    	$rootScope.$emit(url);
    };
    
    //private method to call when each image is downloaded
    var downloadCallback = function(data){
        console.log(data.url);
        console.log(data.fileUrl);
        localStorageService.set(data.url, data.fileUrl);
        notifyURLdownload(data.url);
    }
    
    //private method to create a download queue
    var imgQueue = downgularQueue.build('imgDownloadQueue', '.img', downloadCallback);
    //activate queue
    imgQueue.startDownloading();
    
    
    
    //public method to get an image file URI from a local or remote image URL
    Service.get = function(url){
        //file URI
        var fileUri = null;
        var subscriptionCancel = null;
        
        //create a promise
        var deferred = $q.defer();
        
        //resolve promise with file URI
        var resolveWithFileUrl = function(){
            deferred.resolve(fileUri);
        }
        
        //download success callback
        var onImageDownloaded = function(){
            if(subscriptionCancel !== null)
                subscriptionCancel();
            //retrieve file URL from localstorage (as it's been updated after img download)
            fileUri = localStorageService.get(url);
            resolveWithFileUrl();
        }
        
        
        //file not found callback
        var fileNotFound = function(){
            //perform some action to download file from url, because file has not been found
        }
        
        //try to recover file from url
        if(url.indexOf("file") === 0 || url.indexOf("blob") === 0 || url.indexOf("filesystem") === 0){
            //if image URL is already from system, return it
            fileUri = url;
            //TODO: do st different, as this is recovering the whole file as blob
            downgularFileTools.getFileFromSystemGivenURI(url, resolveWithFileUrl, fileNotFound);
        }
        else{
            //if image URL is a link, check if it is already cached
            var fileUri = localStorageService.get(url);
            if(fileUri !== null && fileUri !== ""){
                //if image URI is found, return it
                resolveWithFileUrl();
            }
            else{
                //otherwise, download the image
                imgQueue.addFileDownload({}, url, null);
                subscriptionCancel = onURLdownload(url, onImageDownloaded);
                
            }
            
        }
        
        //return promise
        return deferred.promise;
    };
    
    //public method to resume downloads
    Service.resumeDownloads = function(){
        imgQueue.startDownloading();
    }
    
    //public method to pause downloads
    Service.pauseDownloads = function(){
        imgQueue.stopDownloading();
    }    
     
    
    return Service;
    
}]);