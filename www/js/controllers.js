angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.run(function($rootScope, Lists, $cordovaGeolocation, $ionicPlatform) {
	//console.log('INIT: .run startup funcs');

	$rootScope.refreshCurrentLocation = function() {
	  $ionicPlatform.ready(function() {
	    var posOptions = {timeout: 100000, enableHighAccuracy: false};
	    $cordovaGeolocation
	      .getCurrentPosition(posOptions)
	      .then(function (position) {
			    window.localStorage.setItem('lat', position.coords.latitude);
			    window.localStorage.setItem('long', position.coords.longitude);
			  //console.log('DEBUG: Updated current location to position: ', position.coords);
	      }, function(err) {
			    //console.log('ERROR with current location fetch: ', err);
	      });
	  });
  }
	$rootScope.refreshCurrentLocation();

	$rootScope.addLocationToList = function (list) {
	  if (window.localStorage.getItem('lat') != null && !isNaN(window.localStorage.getItem('lat'))) {
		  angular.forEach(list.entries, function(value, key) {
			  // Short circuit if the list already has location
			  if (list.entries[key]['displayed_distance_from_me']) {
				  return list;
			  }
			  if (value.place.latitude && !isNaN(value.place.latitude)) {
			  	list.entries[key]['distance_from_me'] =
				  getDistanceFromLatLonInMiles(
					  window.localStorage.getItem('lat'),
					  window.localStorage.getItem('long'),
					  value.place.latitude,
					  value.place.longitude
				  );
				  list.entries[key]['displayed_distance_from_me'] =
				  	parseFloat(Math.round(list.entries[key]['distance_from_me'] * 100) / 100).toFixed(2);
		  	} else {
			    list.entries[key]['distance_from_me'] = null;
		  	}
		  });
		  //console.log('DEBUG: amended list with location', window.localStorage.getItem('lat'), window.localStorage.getItem('long'));
		  return list;
	  } else {
      $rootScope.refreshCurrentLocation();
	  }
  }
})

.controller('ListsCtrl', function($scope, Lists, $rootScope, $ionicPlatform) {
  $scope.$on('$ionicView.enter', function() {
	  Lists.loadListsToRootScope();
  });

	$scope.pullToRefreshLists = function () {
		Lists.loadListsToRootScope(true);
	  $scope.$broadcast('scroll.refreshComplete');
	  $scope.$apply();
	};


	$scope.setupCitySelector = function () {
  	if (window.localStorage.getItem('selectedcity') != null
      && !isNaN(window.localStorage.getItem('selectedcity'))) {
      $scope.selectedCity = parseInt(window.localStorage.getItem('selectedcity'));
    } else {
      $scope.selectedCity = parseInt($scope.supportedCities[0].id);
      window.localStorage.setItem('selectedcity', $scope.selectedCity);
    }
  };
	$scope.updateSelectedCity = function (currentCity) {
    window.localStorage.setItem('selectedcity', parseInt(currentCity));
    $rootScope.lists = null;
	  Lists.loadListsToRootScope(true);
  };
  $ionicPlatform.ready(function() {
	  Lists.loadBookmarksToRootScope();
	  Lists.loadListsToRootScope(true);
  });
})

.controller('ListDetailCtrl',
    function(
      $scope,
      $stateParams,
      Lists,
      $rootScope,
      $cordovaGeolocation,
      $ionicHistory,
      $ionicPopup,
      $state,
      $http,
      $ionicListDelegate,
      $ionicLoading,
      $ionicSideMenuDelegate,
      $ionicScrollDelegate
    ) {
	$scope.currentStateName = $ionicHistory.currentStateName();
	$rootScope.refreshCurrentLocation();
	Lists.loadThisListToRootScope($stateParams.listId);

  // START Map config
  $rootScope.mapCenter = null;
  if (window.localStorage.getItem('lat') != null && !isNaN(window.localStorage.getItem('lat'))) {
    $rootScope.mapCenter = new google.maps.LatLng(window.localStorage.getItem('lat'), window.localStorage.getItem('long'));
  	$scope.currentLocation =
    [{
      latitude: window.localStorage.getItem('lat'),
      longitude: window.localStorage.getItem('long'),
      icon: 'http://www.whatsnom.com/icondir/currentloc.png',
      id: 'currentloc'
    }];
  } else if ($rootScope.list && $rootScope.list.entries) {
  	$scope.currentLocation = null;
	  angular.forEach($rootScope.list.entries, function(value, key) {
      if (value.place && value.place.latitude) {
        $rootScope.mapCenter = new google.maps.LatLng(value.place.latitude, value.place.longitude);
        return true;
      }
    });
  }

  $ionicSideMenuDelegate.canDragContent(false);
  $scope.mapOptions = {
    map: {
      center: $rootScope.mapCenter,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    },
  };

  $scope.getPinImage = function(entry, selected) {
    var pin_color = selected ? 'purple-selected': 'grey';
    return 'http://www.whatsnom.com/icondir/pin-'+pin_color+'.png';
  };

  $rootScope.selectedEntry = null;
  $scope.selectMapEntry = function(entry, marker, map) {
    var list_item_height = 150; // this could change from scss file
    $rootScope.selectedEntry = entry;
    $ionicScrollDelegate.scrollTo(
      0,
      list_item_height * ($rootScope.selectedEntry.position - 1),
      true
    );

    if ($scope.prev_selected_marker) {
      $scope.prev_selected_marker.setOptions(
        {icon: $scope.getPinImage($scope.prev_selected_entry, false)}
      );
    }

    $scope.prev_selected_marker = marker;
    $scope.prev_selected_entry = entry;
    marker.setOptions({icon: $scope.getPinImage(entry, true)});
  };

	// END Map Config


	// To open external URL using inappbrowser
	$scope.openExternalURL = function(ext_url) {
	  window.open(ext_url, "_blank", "location=yes");
		return false;
	};

	$scope.saveEntry = function (entryID) {
		if (window.localStorage.getItem('fbuid') != null && !isNaN(window.localStorage.getItem('fbuid'))) {
			$http.jsonp(
			  'http://www.whatsnom.com/api/1.0/edit_bookmark.php?uid=' + window.localStorage.getItem('fbuid')
			  +'&entry_id=' + entryID + '&force_state=added&format=json&callback=JSON_CALLBACK'
			).success(function (data) {
				if (data == 'added') {
					$ionicLoading.show({ template: 'Saved Bookmark', noBackdrop: true, duration: 500 });
					$ionicListDelegate.closeOptionButtons();
				} else {
					//console.log('unrecognized response from api adder from uid ' + window.localStorage.getItem('fbuid')
					//+ ' to entry_id '+ entryID + ': '+data);*/
				}
				Lists.loadBookmarksToRootScope();
			}).error(
        function (data, status, headers, config) {
	        console.log(status);
	      }
      );
		} else {
		    var confirmPopup = $ionicPopup.confirm({
		      title: 'Whoops!',
		      template: 'To save a spot, log in first.'
		    });
		    confirmPopup.then(function(res) {
		      if(res) {
		        $state.go('tab.saved');
		      } else {
		        // Close dialog
		      }
		    });
		}
	}

})

.controller('EntryDetailCtrl', function($scope, $stateParams, $http, $q, $ionicHistory, $ionicPopup, $state, Lists, $ionicLoading, $cordovaSocialSharing) {
	$scope.currentLat = window.localStorage.getItem('lat');
	$scope.currentLong = window.localStorage.getItem('long');

  var deferred_outer = $q.defer();
	$scope.currentStateName = $ionicHistory.currentStateName();
	$http.jsonp(
	  'http://www.whatsnom.com/api/1.0/view_entry.php?entry_id=' + $stateParams.entryId
	  +'&uid='+window.localStorage.getItem('fbuid')
	  +'&format=json&callback=JSON_CALLBACK'
	).success(function (data) {
		//console.log('DEBUG: Fetched Entry Data: ',data);
		$scope.bookmark = data.bookmark;
		$scope.place = data.place;
		$scope.listPlaceWasViewedFrom = data.list;
		$scope.listEntryForPlace = data.entry;

		// TODO: get initial value from 'bookmarks for user' query and set the text correctly here
		if (window.localStorage.getItem('fbuid') !== null
		    && !isNaN(window.localStorage.getItem('fbuid')) && $scope.bookmark != null) {
			//$scope.saveEntryActionText = 'Remove';
			$scope.saveEntryActionIconClass = 'saved-bookmark-icon';
		} else {
			//$scope.saveEntryActionText = 'Save';
			$scope.saveEntryActionIconClass = 'not-saved-bookmark-icon';
		}

		$scope.shareEntry = function (target_id) {
		  var msg = '';
		  msg +=  $scope.place.name;
		  if ($scope.place.address) {
			  msg += ' - ' + $scope.place.address;
		  }
		  if ($scope.place.yelp_id) {
		  	msg += ' http://m.yelp.com/biz/'+$scope.place.yelp_id;
		  }

		  msg += ' (via WhatsNom)';

		  $cordovaSocialSharing
		    .share(msg) // Share via native share sheet
		    .then(function(result) {
				// Success
		    }, function(err) {
				// Share error
		    });
		};

		$scope.saveEntry = function (target_id) {
			if (window.localStorage.getItem('fbuid') === null || isNaN(window.localStorage.getItem('fbuid'))) {
			    var confirmPopup = $ionicPopup.confirm({
			      title: 'Whoops!',
			      template: 'To save a spot, log in first.'
			    });
			    confirmPopup.then(function(res) {
			      if(res) {
			        $state.go('tab.saved');
			      } else {
			        // Close dialog
			      }
			    });
				return false;
			}
	        var deferred_inner = $q.defer();
			$http.jsonp(
			  'http://www.whatsnom.com/api/1.0/edit_bookmark.php?uid=' + window.localStorage.getItem('fbuid')
			  +'&entry_id=' + $scope.listEntryForPlace.id + '&format=json&callback=JSON_CALLBACK'
			).success(function (data) {
				//console.log('DEBUG: bookmark response: ', data);
				if (data == 'removed') {
					$ionicLoading.show({ template: 'Removed Bookmark', noBackdrop: true, duration: 600 });
					$scope.saveEntryActionIconClass = 'not-saved-bookmark-icon';
				} else if (data == 'added') {
					$ionicLoading.show({ template: 'Saved Bookmark', noBackdrop: true, duration: 600 });
					$scope.saveEntryActionIconClass = 'saved-bookmark-icon';

				} else {
					//console.log('ERROR: unrecognized response from api adder from uid ' + window.localStorage.getItem('fbuid') + ' to target_id '+ $scope.place.id + ': '+data);
				}
				Lists.loadBookmarksToRootScope();
	            deferred_inner.resolve(data);
			}).error(function (data, status, headers, config) {
	            console.log(status);
	            deferred_inner.reject(status);
	        });
	        return deferred_inner.promise;
		};

	    $scope.displayParams = {};

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
	    	$scope.displayParams.phoneString = $scope.place.phone;
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

.controller('SavedCtrl', function($scope,  $rootScope, ngFB, Lists, $http, $ionicListDelegate, $ionicLoading, $state, $ionicHistory) {
	Lists.loadBookmarksToRootScope();

	$scope.pullToRefreshBookmarks = function () {
		Lists.loadBookmarksToRootScope();
	    $scope.$broadcast('scroll.refreshComplete');
	    $scope.$apply();
	}

	$scope.filterTypeIcon = 'ion-navigate';
	$scope.listOrderField = 'position';
	$scope.toggleFilter = function () {
		if ($scope.filterTypeIcon == 'ion-navigate') {
			$ionicLoading.show({ template: 'Sorted by Distance', noBackdrop: true, duration: 600 });
			$scope.filterTypeIcon = 'ion-connection-bars';
			$scope.listOrderField = 'distance_from_me';
		} else if ($scope.filterTypeIcon == 'ion-connection-bars') {
			$ionicLoading.show({ template: 'Sorted by Rank', noBackdrop: true, duration: 600 });
			$scope.filterTypeIcon = 'ion-navigate';
			$scope.listOrderField = 'position';
		} else {
			console.log("ERROR: unrecognized filter type: ", $scope.filterTypeIcon);
		}
	}

	// To open external URL using inappbrowser
	$scope.openExternalURL = function(ext_url) {
	    window.open(ext_url, "_blank", "location=yes");
		return false;
	};

	$scope.removeEntry = function (entryID) {
		if (window.localStorage.getItem('fbuid') != null && !isNaN(window.localStorage.getItem('fbuid'))) {
			$http.jsonp(
			  'http://www.whatsnom.com/api/1.0/edit_bookmark.php?uid=' + window.localStorage.getItem('fbuid')
			  +'&entry_id=' + entryID + '&force_state=removed&format=json&callback=JSON_CALLBACK'
			).success(function (data) {
				if (data == 'removed') {
					$ionicListDelegate.closeOptionButtons();
					$ionicLoading.show({ template: 'Removed', noBackdrop: true, duration: 500 });
					Lists.loadBookmarksToRootScope();
				} else {
					console.log('Error: Unrecognized response from api adder from uid ' + window.localStorage.getItem('fbuid')
					+ ' to entry_id '+ entryID + ': '+data);
				}
			}).error(function (data, status, headers, config) {
	            console.log(status);
	        });
		} else {
      //console.log('Error: tried to remove entry without being logged in');
		}
	}

  $scope.hideLocationFilter = true;
  if (window.localStorage.getItem('lat') != null && !isNaN(window.localStorage.getItem('lat'))) {
    $scope.hideLocationFilter = false;
	}

	// User has logged in before, and not logged out
	$scope.logout_posttext = '';
	$scope.hideFBLoginButton = false;
	if (window.localStorage.getItem('fbuid') != null && !isNaN(window.localStorage.getItem('fbuid'))) {
		$scope.hideFBLoginButton = true;
		if (window.localStorage.getItem('fbname') !== null) {
			$scope.logout_posttext = ' (' + window.localStorage.getItem('fbname') + ')';
		}
	}
	$scope.fbLogin = function () {
    ngFB.login({scope: ''}).then(
	    function (response) {
	      if (response.status === 'connected') {
	        //console.log('Facebook login succeeded');
          $scope.hideFBLoginButton = true;
			    ngFB.api({
			      path: '/me',
			      params: {fields: 'id,first_name'}
			    }).then(
			      function (user) {
						  if (user) {
							  window.localStorage.setItem('fbuid', user.id);
							  window.localStorage.setItem('fbname', user.first_name);
							  $scope.logout_posttext = ' ('+ window.localStorage.getItem('fbname') +')';
		 					  Lists.loadBookmarksToRootScope();
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
	   }
   );
  };

	$scope.fbLogout = function () {
	  ngFB.logout().then(
	    function (response) {
		    $scope.hideFBLoginButton = false;
				window.localStorage.removeItem('fbuid');
				window.localStorage.removeItem('fbname');
  	    $rootScope.bookmarks = null;
	  	  $rootScope.bookmarkCount = null;
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('tab.lists');
				return false;
	    });
	};

});
