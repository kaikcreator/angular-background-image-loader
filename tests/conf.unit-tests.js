// Karma configuration
// Generated on Wed Oct 21 2015 14:21:36 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',

    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files/patterns to load in the browser
    files: [
      'www/lib/ionic/js/ionic.bundle.js',
      //'node_modules/angular-resource/angular-resource.min.js',
      'www/lib/angular-mocks/angular-mocks.js',
      'www/lib/angular-local-storage/dist/angular-local-storage.min.js',
      'www/lib/downgularjs/dist/downgular.js',
      'www/js/imgDownloadLoader/imgDownloadLoader.js',
      'www/js/imgDownloadLoader/imgDownloadCache.js',
      'tests/unit-tests/**/*.js',
      {pattern: 'tests/fixtures/*.jpg', watched: false, included: false, served: true}
    ],
      
    proxies: {
        '/fixtures/image1.jpg': 'http://localhost:9876/base/tests/fixtures/image1.jpg',
        '/fixtures/image2.jpg': 'http://localhost:9876/base/tests/fixtures/image2.jpg'
    },


    // list of files to exclude
    //exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}
