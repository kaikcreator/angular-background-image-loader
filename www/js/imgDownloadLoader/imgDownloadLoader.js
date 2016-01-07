angular.module('imgDownloadLoaderModule', ['downgularJS', 'LocalStorageModule'])


  .provider('imgLoaderConfig', function () {

    //cache related config
    this.clearOldCacheOnLoad = false;
    this.periodToKeepAliveInMs = 60*1000;//1 minute
    
    this.setClearOldCache = function(doClear){
        this.clearOldCacheOnLoad = doClear;
    }
    
    this.setPeriodToKeepAliveInMs = function(ms){
        this.periodToKeepAliveInMs = ms;
    };
    
    //image directive related config
    this.fallbackImage = null;
    
    this.setFallbackImage = function (src) {
      this.fallbackImage = src;
    };

    this.$get = function () {
      return this;
    };

  })
