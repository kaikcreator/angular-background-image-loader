angular.module('imgDownloadLoaderModule')


.directive('imgLoader', ['imgLoaderConfig', '$parse', 'imgDownloadCache', function(imgLoaderConfig, $parse, imgDownloadCache) {
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
                console.log("error loading img from " + this.src + " lets load default img");
            };			

            //image is downloaded to a file through a service, that register downloads in cache
            var src = $parse(attrs.src)(scope.$parent);
            imgDownloadCache.get(src).then(function(uri){
                img.src = uri;
            });
		}
	}
}])
