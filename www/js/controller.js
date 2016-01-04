angular.module('imgDownloader')


.config(function($compileProvider, imgLoaderConfigProvider, downgularFileToolsProvider){
    
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|filesystem):|data:image\//);
    imgLoaderConfigProvider.setFallbackImage('img/gradient.gif');
    if(!window.cordova)
        downgularFileToolsProvider.usePersistentMemory(false);

})

.controller('ViewController', function($scope, $sce, $window){
    

    var images = [
        "http://false.jpg",
        "http://www.hdwallpapers.in/walls/sleepy_kitten-wide.jpg",
        "http://kpbs.media.clients.ellingtoncms.com/img/news/tease/2014/08/20/Cute_grey_kitten.jpg",
        "http://upload.wikimedia.org/wikipedia/commons/a/a5/Red_Kitten_01.jpg",
        "http://www.androscogginanimalhospital.com/blog/wp-content/uploads/2013/12/kitten-photo.jpg",
        "http://upload.wikimedia.org/wikipedia/commons/d/d3/Little_kitten.jpg",
        "http://www.sfgov2.org/ftp/uploadedimages/acc/Adoption_Center/Foster%20Kitten%2012007.jpg",
        "http://upload.wikimedia.org/wikipedia/commons/b/bd/Golden_tabby_and_white_kitten_n01.jpg",
        "http://www.hdwallpaperscool.com/wp-content/uploads/2015/02/kitten-wool-ball-high-definition-wallpaper-for-desktop-background.jpg",
        "http://miriadna.com/desctopwalls/images/max/Grey-kitten.jpg",
        "http://img1.wikia.nocookie.net/__cb20140227161247/creepypasta/images/f/f0/Cats-and-kittens-wallpapers-hdkitten-cat-big-cat-baby-kitten-sleep-2560x1024px-hd-wallpaper--cat-umizfbaa.jpg",
        "http://bestieawards.com/wp-content/uploads/2014/08/funny-cat-photo.jpg",
        "http://thatfunnyblog.com/wp-content/uploads/2014/03/funny-videos-funny-cats-funny-ca.jpg",
        "http://7-themes.com/data_images/out/65/6992858-two-funny-cats.jpg",
        "http://www.mrwallpaper.com/wallpapers/funny-cat.jpg",
        "http://images2.fanpop.com/image/photos/9400000/Funny-Cats-cats-9473850-1600-1200.jpg",
        "http://www.ellf.ru/uploads/posts/2012-10/1350376110_010.jpeg",
        "http://www.hd-wallpapersdownload.com/upload/bulk-upload/funny-cats-pics-full-download-wallpaper.jpg",
        "http://www.gibbahouse.com/wp-content/uploads/2014/12/10-esilarant-funny-cats-7.jpg",
        "http://hdwallpaperia.com/wp-content/uploads/2013/11/Funny-Cat-Sleeping.jpg",
        "http://3.bp.blogspot.com/-hxoSFpLrEVI/VS6rvWyY3sI/AAAAAAABVw0/XiUOTPRaxBc/s1600/funny-cat-150-38.jpg",
        "http://www.hdwallpaperscool.com/wp-content/uploads/2014/07/funny-cats-beautiful-cool-hd-wallpapers-for-background.jpg"
                      ];
    
//    for(var i=0; i< $scope.imageURLs; i++){
//        $sce.trustAsResourceUrl($scope.imageURLs[i]);
//    }
    
    $scope.imageURLs = [];
    
    //include corsproxy in urls
    if(!$window.cordova){
        for(var i=0; i< images.length; i++){
            var pos = 7;
            if(images[i].indexOf('https://') === 0){
                pos++;
            }

            var result = [images[i].slice(0,pos), 'localhost:1337/', images[i].slice(pos)].join('');

            $scope.imageURLs.push(result);
        }
    }
    else{
        $scope.imageURLs = images;
    }
        
});