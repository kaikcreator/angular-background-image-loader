
describe('ImgDownloadCache tests', function () {

    var $http;
    var $httpBackend, imgDownloadCache;
    
    var images = [];
    images[0]  = {
        'url': "/fixtures/image1.jpg"
    };
    
    images[1] = {
        'url': "/fixtures/image2.jpg"
    }
    
    //Get images as http requests
    images.forEach(function(image){
        var request = new XMLHttpRequest();
        request.open('GET', image.url, false);
        request.send(null);
        image.request = {status: request.status, response: request.response};
    });

    
    beforeEach(function(){
//        module("ngResource");
//        module("LocalStorageModule");
//        module("downgularJS");
        module("imgDownloadLoaderModule");
    });
    


    beforeEach(inject(function (_$httpBackend_) {
        $httpBackend = _$httpBackend_;
        
        //set httpBackend for each image
        images.forEach(function(image){            
            $httpBackend
            .when('GET', image.url)
            .respond(
            function(method, url, data, headers){
                return [image.request.status, image.request.response, {}];
            });             
        });
        
        
    }));
    
    
    beforeEach(inject(function (_$http_) {
        $http = _$http_;
    }));    
    

    

    // Test 0: Check that user is empty at the beginning
    it("Get local image 1", function(done) {  
        
        
        $http.get(images[0].url, {
            method: 'GET',
            responseType: 'blob', //this way, the object I receive will be a binary blob, that can be directly stored in the file system
        })
        .success(function(file){
            done();
            expect(file).not.toBeNull();
            expect(file.length).toEqual(images[0].request.response.length);
            }
        )
        .error(function(err){
            console.log(err);
            fail("error callback called");
        });
        
        $httpBackend.flush();
        
    });
    
    
    // Test 1: Check that user is empty at the beginning
    it("Get local image 2", function(done) {  
        
        
        $http.get(images[1].url, {
            method: 'GET',
            responseType: 'blob', //this way, the object I receive will be a binary blob, that can be directly stored in the file system
        })
        .success(function(file){
            done();
            expect(file).not.toBeNull();
            expect(file.length).toEqual(images[1].request.response.length);
            }
        )
        .error(function(err){
            console.log(err);
            fail("error callback called");
        });
        
        $httpBackend.flush();
        
    });
    
    
    
    
//    // Test 2: Create object from login, also in persistence layer
//    it("Creates persistent user from login (test CRUD)", function(done) {
//        console.log("Test UserService - Create persistent user from login");
//        UserService.login(user1Fixture.email, 'password')
//        .then(function(){
//            var user = UserService.getUser();
//            expect(user).toBeDefined();
//
//            
//            //test is done
//            done();
//            
//            //test delete user
//            UserService.logout();
//            var user = UserService.getUser();
//            expect(user).toBe(null);
//            
//        }); 
//        
//        $httpBackend.flush();
//        
//
//        
//    }); 
     

});