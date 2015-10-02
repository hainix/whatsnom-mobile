// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'ngOpenFB', 'ngIOS9UIWebViewPatch'])

.run(function($ionicPlatform, ngFB) {
	ngFB.init({appId: '299948876841231'});
	
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  
  $ionicConfigProvider.backButton.previousTitleText(false).text('');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/menu.html',
  })

  .state('tab.lists', {
      url: '/lists',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-lists.html',
          controller: 'ListsCtrl'
        }
      }
    })
	
    .state('tab.list-detail', {
      url: '/lists/:listId',
      views: {
        'menuContent': {
          templateUrl: 'templates/list-detail.html',
          controller: 'ListDetailCtrl'
        }
      }
    })
    .state('tab.place-detail', {
      url: '/lists/:listId/:entryId',
      views: {
        'menuContent': {
          templateUrl: 'templates/entry-detail.html',
          controller: 'EntryDetailCtrl'
        }
      }
    })

    .state('tab.place-map', {
      url: '/lists/:listId/:placeId/0/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/place-map.html',
          controller: 'MapCtrl'
        }
      }
    })
	
    .state('tab.saved', {
      url: '/saved',
      views: {
        'menuContent': {
          templateUrl: 'templates/tab-saved.html',
          controller: 'SavedCtrl'
        }
      }
    })
	
    .state('tab.saved-place-detail', {
      url: '/saved/:listId/:entryId',
      views: {
        'menuContent': {
          templateUrl: 'templates/entry-detail.html',
          controller: 'EntryDetailCtrl'
        }
      }
    })
    .state('tab.saved-list-detail', {
      url: '/saved/:listId',
      views: {
        'menuContent': {
          templateUrl: 'templates/list-detail.html',
          controller: 'ListDetailCtrl'
        }
      }
    })

  
  ; // End stateProvider
  

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/lists');

});
