angular.module('starter.services', [])

.factory('Lists', function($http, $rootScope) {
	
	// TODO (remove override when actually shipping)
	//window.localStorage.setItem('fbuid', 10104624213101750);

  return {
	  
	loadBookmarksToRootScope: function() {
		$http.jsonp(
		  'http://www.whatsnom.com/api/get_bookmarks.php?uid=' + window.localStorage.getItem('fbuid') +'&format=json&callback=JSON_CALLBACK'
		).success(function (data) {
  		  angular.forEach(data, function(value, key) {
			  $rootScope.addLocationToList(data[key]);
		  });
	  	  $rootScope.bookmarks = data;
		  console.log('bookmark fetch:', data);
		}).error(function (data, status, headers, config) {
	      console.log(status);
	    });
	},
	  
    loadListsToRootScope: function() {
		// We store lists in local memory (rootScope) for performance
		// TODO: defer
		$http.jsonp(
		  'http://www.whatsnom.com/api/combined.php?uid=' + window.localStorage.getItem('fbuid') +'&format=json&callback=JSON_CALLBACK'
		).success(function (data) {
		  console.log('list data fetch:', data);
	  	  $rootScope.lists = data.lists;
		}).error(function (data, status, headers, config) {
	      console.log(status);
	    });
    },
    remove: function(list) {
      lists.splice(lists.indexOf(list), 1);
    },
	
    loadThisListToRootScope: function(listId) {
	  var list = null;
	  angular.forEach($rootScope.lists, function(value, key) {
		  if (listId in value['items']) {
			  $rootScope.list = value['items'][listId];
			  return;
		  }
	  });
	  return false;
    }
  };
});
