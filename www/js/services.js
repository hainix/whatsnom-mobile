angular.module('starter.services', [])

.factory('Lists', function($http, $rootScope) {
	
	// TODO (remove override when actually shipping)
	window.localStorage['fbuid'] = 10104624213101750;

  return {
	  
	loadBookmarksToRootScope: function() {
		// TODO: break this out into a function and call
		// TODO: defer
		$http.jsonp(
		  'http://www.whatsnom.com/api/get_bookmarks.php?uid=' + window.localStorage['fbuid'] +'&format=json&callback=JSON_CALLBACK'
		).success(function (data) {
	  	  $rootScope.bookmarks = data;
		  console.log('bookmark fetch:');
	      console.log(data);
		}).error(function (data, status, headers, config) {
	      console.log(status);
	    });
	},
	  
    loadListsToRootScope: function() {
		// We store lists in local memory (rootScope) for performance
		// TODO: defer
		$http.jsonp(
		  'http://www.whatsnom.com/api/combined.php?uid=' + window.localStorage['fbuid'] +'&format=json&callback=JSON_CALLBACK'
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
	
    getList: function(listId) {
	  var list = null;
	  angular.forEach($rootScope.lists, function(value, key) {
		  if (listId in value['items']) {
		  	list = value['items'][listId]
		  }
	  });
	  $rootScope.list = list;
	  return $rootScope.list;
    }
  };
});
