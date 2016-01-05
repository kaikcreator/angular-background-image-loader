
describe('ImgDownloadCache tests', function () {

    var $http;
    var $httpBackend, imgDownloadCache;
    
    var images = [];
    
    
    beforeAll(function(done, _$httpBackend_){
        $httpBackend = _$httpBackend_;
        
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

    
    beforeEach(function(){
        module("imgDownloadLoaderModule");
        module("HttpImgToBlobInterceptorModule");
    });
    


    beforeEach(inject(function (_$httpBackend_, httpToBlobInterceptor) {
        $httpBackend = _$httpBackend_;
        
        httpToBlobInterceptor.setBlobForUrl(images[0].request.response, images[0].url);
        
        //set httpBackend for each image
        images.forEach(function(image){            
            $httpBackend
            .when('GET', image.url)
            .respond(
            function(method, url, data, headers){
                return [image.request.status, image.request.response, {'Response-Type':'image/jpeg'}];
                //return [image.request.status, image.request.blob, {'Content-Type':'blob'}];
            });             
        });
        
        
    }));
    
    
    beforeEach(inject(function (_$http_, _imgDownloadCache_) {
        $http = _$http_;
        imgDownloadCache = _imgDownloadCache_;
    }));    
    

    

    // Test 0: This test is just to make sure that images are served fine
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

        imgDownloadCache.get(images[0].url).then(function(uri){
                console.log(uri);
                expect(uri).toBeDefined();
                done();
            });
         
        $httpBackend.flush();
        
    }); 
     

});