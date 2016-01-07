
describe('ImgDownloadCache tests', function () {

    var $http;
    var $httpBackend, imgDownloadCache;
    var downgularFileTools;
    var imgDownloadStorage;
    var $rootScope;
    
    var images = [];
    
    //get original timeout, to manipulate jasmine default timeout interval
    var originalTimeout;    
    
    beforeAll(function(done){
        
        images[0]  = {
            'url': "/fixtures/image1.jpg"
        };
        images[1]  = {
            'url': "/fixtures/image2.jpg"
        };        

        //Get images as http requests
        var counter = 0;
        for(var i= 0; i< images.length; i++){
            //using IIFE in order to prevent variable i corruption in callbacks
            (function(index){
                var request = new XMLHttpRequest();
                var successCallback = function(){
                    counter++;
                    images[index].request = {
                        status: request.status, 
                        response: request.response
                    };
                    if(counter === images.length){
                        done();
                    }
                }
                request.responseType = 'blob',
                request.open('GET', images[index].url, true);
                request.addEventListener("load", successCallback);
                request.send(null);  
            })(i);
        }
    
    });
    

    //load angular modules
    beforeEach(function(){
        module("imgDownloadLoaderModule");
        module("HttpImgToBlobInterceptorModule");
    });
        
    
    //inject services we are going to use
    beforeEach(inject(function(_downgularFileTools_, _$rootScope_, _$http_, _imgDownloadCache_, _imgDownloadStorage_){
        downgularFileTools = _downgularFileTools_;
        $rootScope = _$rootScope_;
        $http = _$http_;
        imgDownloadCache = _imgDownloadCache_;        
        imgDownloadStorage = _imgDownloadStorage_;
    }));
    

    //set http get response to image urls, returning a blob image.
    beforeEach(inject(function (_$httpBackend_, httpToBlobInterceptor) {
        $httpBackend = _$httpBackend_;
        
        //specify which blob serve for each url
        httpToBlobInterceptor.setBlobForUrl(images[0].request.response, images[0].url);
        httpToBlobInterceptor.setBlobForUrl(images[1].request.response, images[1].url);
        
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
    it("Download image 0 for first time using imageDownloadLoder", function(done) {
        //delete any imgDownloadCache
        imgDownloadCache.clearCache();
        //check that image do not exist
        var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[0].url);
        expect(item).toBeNull();
        
        //get image (should force image download)
        imgDownloadCache.get(images[0].url).then(function(uri){
            //expect to have uri to a file
            expect(uri).toBeDefined();
            //check that download has been registered in localstorage
            var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[0].url);
            expect(item).not.toBeNull();
            //retrieve file from system uri, and check that size matches the downloaded image
            downgularFileTools.getFileFromSystemGivenURI(uri, 
                function(file){
                    expect(file.size).toEqual(images[0].request.response.size);
                    done();
                }, 
                function(error){
                    fail("failed retrieving file from system uri " + error);
                }
            );
        });
         
        //flush http backend
        $httpBackend.flush();
        
        //force promises to get executed
        setInterval($rootScope.$digest, 100);
        
    });
    
    
    // Test 2: Get image1 using imageDownloadLoader
    it("Download image 1 for first time using imageDownloadLoder", function(done) {

        //check that image do not exist
        var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[1].url);
        expect(item).toBeNull();
        
        //get image (should force image download)
        imgDownloadCache.get(images[1].url).then(function(uri){
            //expect to have uri to a file
            expect(uri).toBeDefined();
            //check that download has been registered in localstorage
            var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[1].url);
            expect(item).not.toBeNull();
            //retrieve file from system uri, and check that size matches the downloaded image
            downgularFileTools.getFileFromSystemGivenURI(uri, 
                function(file){
                    expect(file.size).toEqual(images[1].request.response.size);
                    done();
                }, 
                function(error){
                    fail("failed retrieving file from system uri " + error);
                }
            );
        });
         
        //flush http backend
        $httpBackend.flush();
        
        //force promises to get executed
        setInterval($rootScope.$digest, 100);   
    });    
    
    
    // Test 2: Get image using imageDownloadLoader
    it("get image for second time, it should be cached", function(done) {
        //check that download is already registered in localstorage
        var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[0].url);
        expect(item).not.toBeNull();
        
        //get image (should retrieve it from local storage)
        imgDownloadCache.get(images[0].url).then(function(uri){
            expect(uri).toBeDefined();
            //check that download has been registered in localstorage
            var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[0].url);
            expect(item).not.toBeNull();
            //retrieve file from system uri, and check that size matches the downloaded image
            downgularFileTools.getFileFromSystemGivenURI(uri, 
                function(file){
                    expect(file.size).toEqual(images[0].request.response.size);
                    done();
                }, 
                function(error){
                    fail("failed retrieving file from system uri " + error);
                }
            );
        });
        
        //Make sure that no $http petition has been made to our image
        expect($httpBackend.flush).toThrowError('No pending request to flush !');
        
        //force promises to get executed
        setInterval($rootScope.$digest, 100);
        
    });
    
    
    // Test3: Check and clear imgDownloadCache
    it("check cache and clear it", function(done) {
        //check that both downloads are already registered in localstorage
        var item0 = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[0].url);
        expect(item0).not.toBeNull();
        var item1 = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[1].url);
        expect(item1).not.toBeNull();        
        //check also that currentKeys object is in local storage
        var keys = localStorage.getItem("ls." +  imgDownloadStorage.prefix + imgDownloadStorage.keys);
        expect(keys).not.toBeNull();        
        
        //keys should have both keys
        keys = angular.fromJson(keys);
        expect(Object.keys(keys).length).toEqual(2);
        expect(keys[images[0].url]).not.toBeNull();
        expect(keys[images[1].url]).not.toBeNull();
        

        //use clear cache method
        imgDownloadCache.clearCache().then(
            function(){
                //make sure that cache has been cleared
                var item = localStorage.getItem("ls." + imgDownloadStorage.prefix + images[0].url);
                expect(item).toBeNull();       
                done();
            });
    
        //force promises to get executed
        setInterval($rootScope.$digest, 100);    
    });     
             

});