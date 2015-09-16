angular.module('starter.services', [])

.factory('Lists', function($http, $rootScope) {
	$http.jsonp(
	  'http://www.whatsnom.com/api/combined.php?format=json&callback=JSON_CALLBACK'
	).success(function (data) {
	  $rootScope.lists = data;
	});
	
  return {
    all: function() {
		return $rootScope.lists;
    },
    remove: function(list) {
      lists.splice(lists.indexOf(list), 1);
    },
	getPlace: function(listId, placeId) {
		// TODO share func
		var list = null;
		angular.forEach($rootScope.lists, function(value, key) {
		  if (listId in value['items']) {
			  list = value['items'][listId];
			  return;
		  }
		});
		$rootScope.list = list;
		var listEntryForPlace = null;
		angular.forEach($rootScope.list['entries'], function(value, key) {
		  if (value['spot_id'] == placeId) {
			  listEntryForPlace = value;
			  return;
		  }
		});
		$rootScope.listEntryForPlace = listEntryForPlace;
		$rootScope.place = $rootScope.listEntryForPlace['place'];
		return $rootScope.place;
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
