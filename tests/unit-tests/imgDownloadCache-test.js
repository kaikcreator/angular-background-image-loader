
describe('ImgDownloadCache tests', function () {

    var $http;
    var $httpBackend, imgDownloadCache;
    var downgularFileTools;
    var imgDownloadStoragePrefix;
    var $rootScope;
    
    var images = [];
    
    //get original timeout, to manipulate jasmine default timeout interval
    var originalTimeout;    
    
    beforeAll(function(done){
        
        images[0]  = {
            'url': "/fixtures/image1.jpg"
        };

        //Get images as http requests
        var request = new XMLHttpRequest();

        var successCallback = function(){
            images[0].request = {
                status: request.status, 
                response: request.response
            };
            done();
        }
        request.responseType = 'blob',
        request.open('GET', images[0].url, true);
        request.addEventListener("load", successCallback);
        request.send(null);    
    });
    

    //load angular modules
    beforeEach(function(){
        module("imgDownloadLoaderModule");
        module("HttpImgToBlobInterceptorModule");
    });
        
    
    //inject services we are going to use
    beforeEach(inject(function(_downgularFileTools_, _$rootScope_, _$http_, _imgDownloadCache_, _imgDownloadStoragePrefix_){
        downgularFileTools = _downgularFileTools_;
        $rootScope = _$rootScope_;
        $http = _$http_;
        imgDownloadCache = _imgDownloadCache_;        
        imgDownloadStoragePrefix = _imgDownloadStoragePrefix_;
    }));
    

    //set http get response to image urls, returning a blob image.
    beforeEach(inject(function (_$httpBackend_, httpToBlobInterceptor) {
        $httpBackend = _$httpBackend_;
        
        //specify which blob serve for each url
        httpToBlobInterceptor.setBlobForUrl(images[0].request.response, images[0].url);
        
        //set httpBackend for each image
        images.forEach(function(image){            
            $httpBackend
            .when('GET', image.url)
            .respond(
            function(method, url, data, headers){
                return [image.request.status, image.request.response, {'Response-Type':'image/jpeg'}];
            });             
        });
    }));
        

    //Test 0: This test is just to make sure that images are served fine
    it("Get local image 1", function(done) {  
        
        $http.get(images[0].url, {
            method: 'GET',
            responseType: 'blob', //this way, the object I receive will be a binary blob, that can be directly stored in the file system
        })
        .success(function(file){
            done();
            expect(file).not.toBeNull();
            expect(file).toEqual(images[0].request.response);
            }
        )
        .error(function(err){
            fail("error callback called");
        });
        
        $httpBackend.flush();
        
    });
    

    // Test 1: Get image using imageDownloadLoader
    it("Download image for first time using imageDownloadLoder", function(done) {
        //delete any imgDownloadCache
        imgDownloadCache.clearCache();
        //check that image do not exist
        var item = localStorage.getItem("ls." + imgDownloadStoragePrefix + images[0].url);
        expect(item).toBeNull();
        
        //get image (should force image download)
        imgDownloadCache.get(images[0].url).then(function(uri){
            //expect to have uri to a file
            expect(uri).toBeDefined();
            //check that download has been registered in localstorage
            var item = localStorage.getItem("ls." + imgDownloadStoragePrefix + images[0].url);
            expect(item).not.toBeNull();
            done();
            });
         
        //flush http backend
        $httpBackend.flush();
        
        //force promises to get executed
        setInterval($rootScope.$digest, 100);
        
    });
    
    
    // Test 2: Get image using imageDownloadLoader
    it("get image for second time, it should be cached", function(done) {
        //check that download is already registered in localstorage
        var item = localStorage.getItem("ls." + imgDownloadStoragePrefix + images[0].url);
        expect(item).not.toBeNull();
        
        //get image (should retrieve it from local storage)
        imgDownloadCache.get(images[0].url).then(function(uri){
                expect(uri).toBeDefined();
                done();
            });
        
        //Make sure that no $http petition has been made to our image
        expect($httpBackend.flush).toThrowError('No pending request to flush !');
        
        //force promises to get executed
        setInterval($rootScope.$digest, 100);
        
    });
    
    
    // Clear imgDownloadCache
    it("clear cache", function() {

        //use clear cache method
        imgDownloadCache.clearCache();
        
        //make sure that cache has been cleared
        var item = localStorage.getItem("ls." + imgDownloadStoragePrefix + images[0].url);
        expect(item).toBeNull();        
        
        //force promises to get executed
        //setInterval($rootScope.$digest, 100);
        
    });     
             

});