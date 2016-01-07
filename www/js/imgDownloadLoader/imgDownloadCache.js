angular.module('imgDownloadLoaderModule')


.config(function(downgularFileToolsProvider){
    
    if(!window.cordova){
        downgularFileToolsProvider.usePersistentMemory(false);
        downgularFileToolsProvider.setStorageQuota(50*1024*1024);
    }
    else{
        downgularFileToolsProvider.usePersistentMemory(true);
        downgularFileToolsProvider.setStorageQuota(0);
    }
})


.constant('imgDownloadStorage', {
    prefix:'imgDownload',
    keys: 'keys'
})


.factory('imgDownloadCache', ['$q', '$window', '$rootScope', 'imgLoaderConfig', 'downgularFileTools', 'localStorageService', 'downgularQueue', 'imgDownloadStorage', function($q, $window, $rootScope, imgLoaderConfig, downgularFileTools, localStorageService, downgularQueue, imgDownloadStorage){
    
    var Service = {};
    
    
    //private pub-sub methods, to notify downloads
    var onURLdownload = function(url, callback) {
        return $rootScope.$on(url, function(){
           callback();
        });
    };
    var notifyURLdownload =  function(url){
    	$rootScope.$emit(url);
    };
    
    
    //private method to store a url in localstorage
    var saveToLocalStorage = function(url, fileUrl){
        //save relation url - fileUrl
        localStorageService.set(imgDownloadStorage.prefix + url, fileUrl);
        //save url in currentKeys item, to be able to retrieve it for cache clearance
        var currentKeys = localStorageService.get(imgDownloadStorage.prefix + imgDownloadStorage.keys);
        if(currentKeys === null){
            currentKeys = {};
        }
        currentKeys[url] = {timestamp: Date.now()};
        localStorageService.set(imgDownloadStorage.prefix + imgDownloadStorage.keys, currentKeys);
    }
    
    
    //private method to get fileUri from url in local storage
    var getFromLocalStorage = function(url){
        return localStorageService.get(imgDownloadStorage.prefix + url);
    }
    
    
    //private method to remove file from system and its url from localstorage. Optionally updates also currentkeys
    var removeWithFileFromLocalStorage = function(url, updateCurrentKeys){
        var deferred = $q.defer();
        //internal method to remove url from localstorage
        var removeFromLocalStorage = function(){
            localStorageService.remove(imgDownloadStorage.prefix + url);
            if(updateCurrentKeys){
                var currentKeys = localStorageService.get(imgDownloadStorage.prefix + imgDownloadStorage.keys);
                if(currentKeys != null){
                    delete currentKeys[url];
                    localStorageService.set(imgDownloadStorage.prefix + imgDownloadStorage.keys, currentKeys);
                }
            }
        };
        //delete file, and delete urls on success and error callbacks
        downgularFileTools.deleteFileFromSystemGivenURI(
            getFromLocalStorage(url),
            function(successData){
                removeFromLocalStorage();
                deferred.resolve();
            },
            function(error){
                console.log("Error removing file" + angular.toJson(error));
                removeFromLocalStorage();
                deferred.reject();
            }
        );
        
        return deferred.promise;
    };
    
    
    //private method to call when each image is downloaded
    var downloadCallback = function(data){
        saveToLocalStorage(data.url, data.fileUrl);
        notifyURLdownload(data.url);
    };
    
    
    //private method to create a download queue
    var imgQueue = downgularQueue.build('imgDownloadQueue', '.img', downloadCallback);
    //activate queue
    imgQueue.startDownloading();
    
    
    //public method to get an image file URI from a local or remote image URL
    Service.get = function(url){
        //file URI
        var fileUri = null;
        var subscriptionCancel = null;
        var invalidFileCounter = 0;
        
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
            fileUri = getFromLocalStorage(url);
            $window.resolveLocalFileSystemURI(fileUri, resolveWithFileUrl, fileNotFound);
        }
        
        //file not found callback
        var fileNotFound = function(err){
            //perform some action to download file from url, because file has not been found
            if(url === fileUri){
                //url belongs to local file, and it fails, so there's no way to download it another time
                deferred.reject(err);
            }else{
                //try to reload in case of not found error
                console.log("Warning: file error detected, err code: " + err.code);
                if(invalidFileCounter == 0){
                    invalidFileCounter++;
                    imgQueue.addFileDownload({}, url, null);
                    subscriptionCancel = onURLdownload(url, onImageDownloaded);
                }
                 else{
                    //if we already tried to download the image, but resultIng image still fails, REJECT
                    if(subscriptionCancel !== null){
                        subscriptionCancel();  
                    }
                    deferred.reject(err);
                }
            }
        };
        
        //PERFORM STUFF
        //try to recover file from url
        if(url.indexOf("file") === 0 || url.indexOf("blob") === 0 || url.indexOf("filesystem") === 0){
            //if image URL is already from system, return it
            fileUri = url;
            //downgularFileTools.getFileFromSystemGivenURI(url, resolveWithFileUrl, fileNotFound);
            $window.resolveLocalFileSystemURI(fileUri, resolveWithFileUrl, fileNotFound);
        }
        else{
            //if image URL is a link, check if it is already cached
            var fileUri = getFromLocalStorage(url);
            if(fileUri !== null && fileUri !== ""){
                //check if file exists, and in that case, resolve promise with it
                $window.resolveLocalFileSystemURI(fileUri, resolveWithFileUrl, fileNotFound);
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
    
    
    //public static method to clear imgDownload cache
    Service.clearCache = function(){
        var deferred = $q.defer();
        var remainingKeys;
        var errorDetected = false;
        var resolver = function(success){
            remainingKeys--;
            if(remainingKeys == 0){
                if(!errorDetected){
                    deferred.resolve();
                }
                else{
                    deferred.reject();
                }
            }
        };
        //bucle over currentKeys in order to delete its files
        var currentKeys = localStorageService.get(imgDownloadStorage.prefix + imgDownloadStorage.keys);
        if(currentKeys != null){
            remainingKeys = Object.keys(currentKeys).length;
            for(var key in currentKeys){
                if(currentKeys.hasOwnProperty(key)){
                    //we do not update currentKeys, because we'll clear anyway keys from LS
                    removeWithFileFromLocalStorage(key, false)
                    .then(
                        function(success){resolver(true);},
                        function(error){resolver(false);}
                    );
                }
            }
        }
        //delete currentKeys from localstorage
        localStorageService.remove(imgDownloadStorage.prefix + imgDownloadStorage.keys);
        
        return deferred.promise;
    }
        
    
    //public method to resume downloads
    Service.resumeDownloads = function(){
        imgQueue.startDownloading();
    };
    
    
    //public method to pause downloads
    Service.pauseDownloads = function(){
        imgQueue.stopDownloading();
    };   
    
    
    //public method to clear old cache
    Service.clearOldCache = function(){
        //perform cache clearance if need
        var time = Date.now();
        //bucle over currentKeys in order to delete the ones that have expired
        var currentKeys = localStorageService.get(imgDownloadStorage.prefix + imgDownloadStorage.keys);
        if(currentKeys != null){
            for(var key in currentKeys){
                if(currentKeys.hasOwnProperty(key)){
                    var timestamp = currentKeys[key].timestamp;
                    if(time-timestamp > imgLoaderConfig.periodToKeepAliveInMs){
                        removeWithFileFromLocalStorage(key, true);
                    }
                }
            }
        }
    };

    
    //TODO: improve clearOldCache to return a promise, and emit a signal when it's cleared
    //perform cache clearance if need
    if(imgLoaderConfig.clearOldCacheOnLoad === true){
        Service.clearOldCache();
    }
     
    
    return Service;
    
}]);



