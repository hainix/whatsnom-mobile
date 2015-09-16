angular.module('starter.controllers', ['starter.services', 'ngOpenFB'])

.controller('ListsCtrl', function($scope, Lists) {
	Lists.all();
})

.controller('ListDetailCtrl', function($scope, $stateParams, Lists) {
	Lists.getList($stateParams.listId);
})

.controller('PlaceDetailCtrl', function($scope, $stateParams, Lists, $rootScope) {
	$scope.place = Lists.getPlace($stateParams.listId, $stateParams.placeId);
	$scope.listPlaceWasViewedFrom = $rootScope.list;
	$scope.listEntryForPlace = $rootScope.listEntryForPlace;

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
	$scope.openExternalURL = function (ext_url) {
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

})

.controller('ExternalPageCtrl', function($scope, $sce, $stateParams, $http) {
	$scope.pageType = $stateParams.pageType;
	$scope.externalTargetURLSafe = null;
	if ($stateParams.pageType == 'reserve') {
      $scope.externalPageTitle = 'Make a Reservation';		
      if ($scope.place.opentable_id && angular.isNumber($scope.place.opentable_id)) {
        $scope.externalTargetURLSafe = $sce.trustAsResourceUrl('http://mobile.opentable.com/opentable/?restId=' + $scope.place.opentable_id);
      } else if ($scope.place.yelp_seat_me){
        $scope.externalTargetURLSafe = $sce.trustAsResourceUrl('https://www.seatme.yelp.com/r/' + $scope.place.yelp_seat_me);	
      }
    }	
})


.controller('AccountCtrl', function($scope, ngFB) {

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
	

	$scope.fbLogin = function () {
	    ngFB.login({scope: ''}).then(
	        function (response) {
	            if (response.status === 'connected') {
	                console.log('Facebook login succeeded');
					$scope.hideFBLoginButton = true;
				    ngFB.api({
				         path: '/me',
				         params: {fields: 'id,name'}
				     }).then(
				         function (user) {
				             $scope.user = user;
							 if ($scope.user) {
								 $scope.logout_posttext = ' ('+$scope.user.name+')';
								 window.localStorage['fbuid'] = $scope.user.id;
								 window.localStorage['fbname'] = $scope.user.name;
								 $scope.fbname = window.localStorage['fbname'];
							 	 $scope.fbuid = window.localStorage['fbuid'];	
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
