angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.run(function($rootScope, Lists) {
	console.log('running startup funcs');
	Lists.loadListsToRootScope();
	//Lists.loadBookmarksToRootScope();
})

.controller('ListsCtrl', function($scope, Lists) {
    $scope.$on('$ionicView.enter', function() {
		Lists.loadListsToRootScope();
    })	
	$scope.pullToRefreshLists = function () {
		Lists.loadListsToRootScope();
		window.location.reload(true);
	    $scope.$broadcast('scroll.refreshComplete');
	    $scope.$apply();
	}	
})

.controller('ListDetailCtrl', function($scope, $stateParams, Lists, $ionicHistory) {
	$scope.currentStateName = $ionicHistory.currentStateName();
	Lists.getList($stateParams.listId);
})

.controller('EntryDetailCtrl', function($scope, $stateParams, $http, $q, $ionicHistory) {
    var deferred_outer = $q.defer();
	$scope.currentStateName = $ionicHistory.currentStateName();
	$http.jsonp(
	  'http://www.whatsnom.com/api/view_entry.php?entry_id=' + $stateParams.entryId
	  +'&uid='+window.localStorage['fbuid'] 
	  +'&format=json&callback=JSON_CALLBACK'
	).success(function (data) {
		console.log(data);
		$scope.bookmark = data.bookmark;
		$scope.place = data.place;
		$scope.listPlaceWasViewedFrom = data.list;
		$scope.listEntryForPlace = data.entry;
		
		// TODO: get initial value from 'bookmarks for user' query and set the text correctly here
		if ($scope.bookmark == null) {
			$scope.saveEntryActionText = 'Save'; // TODO use constants for these states and those below
			$scope.saveEntryActionIcon = 'ion-bookmark'; 
			
			 
		} else {
			$scope.saveEntryActionText = 'Remove';
			$scope.saveEntryActionIcon = 'ion-ios-close-outline'; 
		}
		$scope.saveEntry = function (target_id) {
			if (!window.localStorage['fbuid']) {
				console.log('trying to save place without user');
				return false;
			}
	        var deferred_inner = $q.defer();
			$http.jsonp(
			  'http://www.whatsnom.com/api/edit_bookmark.php?uid=' + window.localStorage['fbuid']
			  +'&entry_id=' + $scope.listEntryForPlace.id + '&format=json&callback=JSON_CALLBACK'
			).success(function (data) {
				console.log(data);
				if (data == 'removed') {
					$scope.saveEntryActionText = 'Save';
					$scope.saveEntryActionIcon = 'ion-bookmark'; 
				} else if (data == 'added') {
					$scope.saveEntryActionText = 'Remove'; 
					$scope.saveEntryActionIcon = 'ion-ios-close-outline'; 
					
				} else {
					console.log('unrecognized response from api adder from uid ' + window.localStorage['fbuid']
					+ ' to target_id '+ $scope.place.id + ': '+data);
				}
	            deferred_inner.resolve(data);
			}).error(function (data, status, headers, config) {
	            console.log(status);
	            deferred_inner.reject(status);
	        });
	        return deferred_inner.promise;
		};

	    $scope.displayParams = {};
	    // Mini map
	    if ($scope.place.latitude) {
	  	  var placeLatLng = new google.maps.LatLng($scope.place.latitude, $scope.place.longitude);	

	  	  var mapOptions = {
	  	    center: placeLatLng,
	  	    zoom: 15,
	  	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  	  };

	  	  $scope.minimap = new google.maps.Map(document.getElementById("minimap"), mapOptions);
	    	  google.maps.event.addListenerOnce($scope.minimap, 'idle', function(){
	  	  	  var placeMarker = new google.maps.Marker({
	  	  	      map: $scope.minimap,
	  	  	      animation: google.maps.Animation.DROP,
	  	  	      position: placeLatLng
	  	  	  });  
	  	  });	
	    }
	
		// To open external URL using inappbrowser
		$scope.openExternalURL = function(ext_url) {
		    window.open(ext_url, "_blank", "location=yes");
			return false;
		};
	
	    // Snippet
	    $scope.displayParams.snippet = $scope.listEntryForPlace.snippet;

	    // Ratings
	    $scope.displayParams.starRatingOffset = -(Math.floor(parseInt($scope.place.rating) / 10) - 1) * 19;

	    // Phone number
	    if ($scope.place.phone) {
	    	$scope.displayParams.phoneString = $scope.place.phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
	    }

	    // Place Render
	    $scope.displayParams.displayableNeighborhood = $scope.place.neighborhoods;
	    $scope.displayParams.displayableAddress = $scope.place.address;
        
		
		deferred_outer.resolve(data);
		
		
	}).error(function (data, status, headers, config) {
      console.log(status);
      deferred_outer.reject(status);
    });
    return deferred_outer.promise;

})

.controller('SavedCtrl', function($scope,  $rootScope, ngFB, Lists) {
    $scope.$on('$ionicView.enter', function() {
		Lists.loadBookmarksToRootScope();
    });
	
	$scope.pullToRefreshBookmarks = function () {
		Lists.loadBookmarksToRootScope();
		window.location.reload(true);
	    $scope.$broadcast('scroll.refreshComplete');
	    $scope.$apply();
	}	
	
	// User has logged in before, and not logged out
	$scope.fbuid = window.localStorage['fbuid'];
	$scope.fbname = window.localStorage['fbname'];
	$scope.logout_posttext = '';
	if ($scope.fbuid) {
		$scope.hideFBLoginButton = true;
		if ($scope.fbname) {
			$scope.logout_posttext = ' (' + $scope.fbname + ')';
		}
	} else {
		$scope.hideFBLoginButton = false;
	}
	
	console.log('set up saved controller');
	if ($rootScope.bookmarks) {
		$scope.bookmarks = $rootScope.bookmarks;
		console.log('scope data');
		console.log($rootScope.bookmarks);
	}

	$scope.fbLogin = function () {
	    ngFB.login({scope: ''}).then(
	        function (response) {
	            if (response.status === 'connected') {
	                console.log('Facebook login succeeded');
					$scope.hideFBLoginButton = true;
				    ngFB.api({
				         path: '/me',
				         params: {fields: 'id,first_name'}
				     }).then(
				         function (user) {
				             $scope.user = user;
							 if ($scope.user) {
								 window.localStorage['fbuid'] = $scope.user.id;
								 window.localStorage['fbname'] = $scope.user.first_name;
								 $scope.fbname = window.localStorage['fbname'];
							 	 $scope.fbuid = window.localStorage['fbuid'];	
								 $scope.logout_posttext = ' ('+$scope.fbname+')';
								 return false;							 
							 }
				         },
				         function (error) {
				             alert('Facebook error: ' + error.error_description);
				         }
					 );
					 return false;
	            } else {
	                alert('Facebook login failed');
	            }
	        });
	};
	$scope.fbLogout = function () {
		$scope.hideFBLoginButton = true;
	    ngFB.logout().then(
	        function (response) {
				$scope.hideFBLoginButton = false;
				window.localStorage['fbuid'] = null;
				window.localStorage['fbaname'] = null;
				$scope.fbuid = null;
				$scope.fbname = null;
				return false;
	        });
	};

		
});
