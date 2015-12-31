angular.module('imgDownloadLoaderModule')


  .provider('imgLoaderConfig', function () {

    this.fallbackImage = null;
    
    this.setFallbackImage = function (src) {
      this.fallbackImage = src;
    };

    this.$get = function () {
      return this;
    };

  })


.directive('imgLoader', ['imgLoaderConfig', '$parse', function(imgLoaderConfig, $parse) {
	return {
        restrict: "EA",
        scope:{},
		link: function(scope, element, attrs) {
            
            //if no display property has been set, set display:block
            if(element.css('display') === "")
                element.css({'display': 'block'});
            
            
            //recover fallback image from attributes or config
            var fallbackImg = imgLoaderConfig.fallbackImage;
            if(attrs.fallbackImg && attrs.fallbackImg === "")
                fallbackImg = attrs.fallbackImg;
            
            //start background-image with fallback image
            if(fallbackImg){
                element.css({
		            'backgroundImage': 'url(' + fallbackImg +')',
		        });
            }
            
			
            //Try to load src image
			var img = new Image();
			img.onload = function(){
		        element.css({
		            'backgroundImage': 'url(' + this.src +')',
		        });
			}
            img.onerror = function(e) {
                console.log("error loading contact.photo, lets load default img");
            };			
            img.src = $parse(attrs.src)(scope.$parent);
		}
	}
}])
