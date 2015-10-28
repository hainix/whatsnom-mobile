angular.module('starter.services', [])

.factory('Lists', function($http, $rootScope) {

  return {
  	loadBookmarksToRootScope: function() {
  		$http.jsonp(
  		  'http://www.whatsnom.com/api/1.1/get_bookmarks.php?uid=' + window.localStorage.getItem('fbuid') +'&format=json&callback=JSON_CALLBACK'
  		).success(function (data) {
        angular.forEach(data.bookmarks, function(value, key) {
  			  $rootScope.addLocationToList(data.bookmarks[key]);
  		  });
  	    $rootScope.bookmarks = data.bookmarks;
	  	  $rootScope.bookmarkCount = data.count;
  		  //console.log('DEBUG: Set bookmark to $rootScope:', data);
  		}).error(function (data, status, headers, config) {
  	    console.log(status);
  	  });
  	},
	  
    loadListsToRootScope: function(force) {
  		// We store lists in local memory (rootScope) for performance
  		// TODO: defer
  		var unix_now = Math.round(+new Date()/1000);
  		if (!force && $rootScope.lists && window.localStorage.getItem('most_recent_fetch') 
  			&& ((window.localStorage.getItem('most_recent_fetch') + 86400) > unix_now)) {
  			//console.log('DEBUG: skipping refetch of loadBookmarksToRootScope with unix ', unix_now);
  			return false;
  		}

  		$http.jsonp(
  		  'http://www.whatsnom.com/api/1.1/combined.php?'
        +'uid='+ window.localStorage.getItem('fbuid') 
        +'&city_id=' + window.localStorage.getItem('selectedcity')
        +'&format=json&callback=JSON_CALLBACK'
  		).success(function (data) {
  		  //console.log('DEBUG: Set lists to $rootScope on timestamp ', unix_now, ' : ', data);
  		  window.localStorage.setItem('most_recent_fetch', unix_now);
        //console.log(data);
  	  	$rootScope.lists = data.lists;
  	  	$rootScope.listsWithHeaders = data.lists_with_headers;
        $rootScope.supportedCities = data.cities;
  		}).error(function (data, status, headers, config) {
  	    console.log(status);
  	  });
    },
	
    loadThisListToRootScope: function(listId) {
  	  //console.log('DEBUG: Running loadThisListToRootScope for listId: ', listId);

  	  if ($rootScope.lists) {
  		  angular.forEach($rootScope.lists, function(genreListArray, _j) {
    		  angular.forEach(genreListArray['items'], function(genreList, _k) {
  			  if (genreList.id == listId) {
  				  console.log('DEBUG: Set list to $rootScope from $rootScope.lists for id: ', listId);
  				  $rootScope.list = genreList;
  			    $rootScope.addLocationToList($rootScope.list);
  				  return;
  			  }
  		  });
  		  if ($rootScope.list) {
          return;
        }
      });
  		  if ($rootScope.list) {
  			  return true;
  		  } else {
  	  		console.log('ERROR: $rootScope.lists was set, but unable to find list with id: ', listId, 'rootscope.lists:', $rootScope.lists);
  		  }
  	  }
  	  // Usually when debugging
  	  $http.jsonp(
  	    'http://www.whatsnom.com/api/1.0/view_list.php?list_id=' + listId +'&format=json&callback=JSON_CALLBACK'
  	  ).success(function (data) {
  	    console.log('DEBUG: Refetched from API + set list to $rootScope for id: ', listId, 'and data: ',data);
  	    $rootScope.list = data;
  	    $rootScope.addLocationToList($rootScope.list);
  	    return true;
  	  }).error(function (data, status, headers, config) {
  	    console.log(status);
  	    return false;
  	  });	 
    }
  };
});
