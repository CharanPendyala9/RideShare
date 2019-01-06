angular.module('starter.controllers', [])

// Home controller
.controller('HomeCtrl', function($scope, $state, $ionicPopup, $timeout, $ionicHistory) {
  // map height
  $scope.mapHeight = 480;

  // show - hide booking form
  $scope.showForm = false;

  // show - hide modal bg
  $scope.showModalBg = false;

  // toggle form
  $scope.toggleForm = function() {
    $scope.showForm = !$scope.showForm;
    $scope.showModalBg = ($scope.showForm == true);
  }

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

  $scope.getRides = function() {
    initialize();
    fpaths.forEach(function(fpath){
      if (google.maps.geometry.poly.isLocationOnEdge(user_source, fpath, 0.005) && google.maps.geometry.poly.isLocationOnEdge(user_destination, fpath, 0.005)) {
        // var mapOptions = {
        //   center: user_source,
        //   zoom: 14,
        //   mapTypeId: google.maps.MapTypeId.ROADMAP,
        //   mapTypeControl: false,
        //   zoomControl: false,
        //   streetViewControl: false
        // };
        // // init map
        // var map = new google.maps.Map(document.getElementById("map"),
        //   mapOptions);
        //
        // // assign to stop
        // $scope.map = map;
        var dirDisp = new google.maps.DirectionsRenderer();
    		var dirser = new google.maps.DirectionsService();

        dirDisp.setMap($scope.map);

        var req = {
          origin : user_source,
          destination : user_destination,
          travelMode : 'DRIVING'
        };

        dirser.route(req,function(result,status){
          if(status=="OK"){
            dirDisp.setDirections(result);
          }
        fpath.setMap($scope.map);

    })
  }
      else{

      }
    });

  }

  // list vehicles
  $scope.vehicles = [
    {
      name: 'User',
      icon: 'icon-taxi',
      active: true
    },
    {
      name: 'Driver',
      icon: 'icon-car',
      active: false
    }
  ]

  var user_source;
  var user_destination;
  var fpaths=[];
  var myLatlng;

  // Note to driver
  $scope.note = '';

  // Promo code
  $scope.promo = '';

  // toggle active vehicle
  $scope.toggleVehicle = function(index) {
    for (var i = 0; i < $scope.vehicles.length; i++) {
      $scope.vehicles[i].active = (i == index);
    }
  }

  $scope.navigateTo = function (vehicle){
    if(vehicle.name == 'Driver')
    {
      $state.go('finding');
    }
  }

  function initialize() {

    // set up begining posi tion
    myLatlng = new google.maps.LatLng(33.9865307,-81.0257761);

    // set option for map
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false
    };
    // init map
    var map = new google.maps.Map(document.getElementById("map"),
      mapOptions);

    // assign to stop
    $scope.map = map;

    var drivers_dbref = firebase.database().ref().child('Users/Drivers');

    var address_pickup = (document.getElementById("pick-up"));
    var autocomplete_pckup = new google.maps.places.Autocomplete(address_pickup);
    autocomplete_pckup.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete_pckup,'place_changed',function(){
      var place = autocomplete_pckup.getPlace();
      if(!place.geometry){
        return;
      }

      // var address = '';
      //         if (place.address_components) {
      //             address = [
      //                 (place.address_components[0] && place.address_components[0].short_name || ''),
      //                 (place.address_components[1] && place.address_components[1].short_name || ''),
      //                 (place.address_components[2] && place.address_components[2].short_name || '')
      //                 ].join(' ');
      //         }
//------------------------------------------------------------------
geocoder = new google.maps.Geocoder();
    var address = document.getElementById("pick-up").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

      user_source = new google.maps.LatLng(parseFloat(results[0].geometry.location.lat()),parseFloat(results[0].geometry.location.lng()));

      }

      else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    google.maps.event.addDomListener(window, 'load', initialize);

//------------------------------------------------------------------


    });



    var address_dropoff = (document.getElementById("drop-off"));
    var autocomplete_drpoff = new google.maps.places.Autocomplete(address_dropoff);
    autocomplete_drpoff.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete_drpoff ,'place_changed',function(){
      var place = autocomplete_drpoff.getPlace();
      if(!place.geometry){
        return;
      }
//---------------------------------------------------------------------
geocoder = new google.maps.Geocoder();
    address = document.getElementById("drop-off").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        user_destination = new google.maps.LatLng(parseFloat(results[0].geometry.location.lat()),parseFloat(results[0].geometry.location.lng()));

      }

      else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
    google.maps.event.addDomListener(window, 'load', initialize);

//---------------------------------------------------------------------
    });

    drivers_dbref.on("value",function(snapshot){
      snapshot.forEach(function(childsnapshot){
        var source = childsnapshot.child('Source').val();
        var destination = childsnapshot.child('Destination').val();

        var dirDisp = new google.maps.DirectionsRenderer();
    		var dirser = new google.maps.DirectionsService();

        var fpath;
        var source_loc =  new google.maps.LatLng(parseFloat(source.Latitude),parseFloat(source.Longitude));
        var destination_loc =  new google.maps.LatLng(parseFloat(destination.Latitude),parseFloat(destination.Longitude));

        //dirDisp.setMap(map);
        var rroute;

        var req = {
          origin : source_loc,
          destination : destination_loc,
          travelMode : 'DRIVING'
        };

        dirser.route(req,function(result,status){
          console.log(result,status);
          if(status=="OK"){
            dirDisp.setDirections(result);
          }

          console.log(result.routes[0].overview_polyline);
          var points_enc = result.routes[0].overview_polyline;
          console.log(points_enc);
          var list = google.maps.geometry.encoding.decodePath(points_enc);
          console.log(list);

        var path=[];

        fpath = new google.maps.Polyline({
  			  path: list,
  			  strokeColor: getRandomColor(),
  			  strokeOpacity: 0.6,
  			  strokeWeight: 6
  			});

        fpaths.push(fpath);

        //if (google.maps.geometry.poly.isLocationOnEdge(user_source, fpath, 0.005) && google.maps.geometry.poly.isLocationOnEdge(user_source, fpath, 0.005)) {
        //fpath.setMap(map);
      //}
        	});

      })

    });


    // get ion-view height
    var viewHeight = window.screen.height - 44; // minus nav bar
    // get info block height
    var infoHeight = document.getElementsByClassName('booking-info')[0].scrollHeight;
    // get booking form height
    var bookingHeight = document.getElementsByClassName('booking-form')[0].scrollHeight;
    // set map height = view height - info block height + booking form height

    $scope.mapHeight = viewHeight - infoHeight + bookingHeight;

  }
  // load map when the ui is loaded
  $scope.init = function() {
    initialize();
  }


  // Show note popup when click to 'Notes to driver'
  $scope.showNotePopup = function() {
    $scope.data = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/popup-note.html',
      title: 'Notes to driver',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-balanced',
          onTap: function(e) {
            if (!$scope.data.note) {
              //don't allow the user to close unless he enters note
              e.preventDefault();
            } else {
              return $scope.data.note;
            }
          }
        },
      ]
    });
    myPopup.then(function(res) {
      $scope.note = res;
    });
  };

  // Show promote code popup when click to 'Promote Code'
  $scope.showPromoPopup = function() {
    $scope.data = {}

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/popup-promo.html',
      title: 'Promo code',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'button-balanced',
          onTap: function(e) {
            if (!$scope.data.promo) {
              //don't allow the user to close unless he enters note
              e.preventDefault();
            } else {
              return $scope.data.promo;
            }
          }
        },
      ]
    });
    myPopup.then(function(res) {
      $scope.promo = res;
    });
  };

  // go to next view when the 'Book' button is clicked
  $scope.book = function() {
    // hide booking form
    $scope.toggleForm();

    // go to finding state
    $state.go('finding');
    //$state.go('tracking');
  }
})

// Places Controller
.controller('PlacesCtrl', function($scope, Places) {
  // set list places
  $scope.places = Places.all();

  // list recent places
  $scope.recentPlaces = Places.recent();
})

// Payment Method Controller
.controller('PaymentMethodCtrl', function($scope, $state) {
  // default value
  $scope.choice = 'A';

  // change payment method
  $scope.changeMethod = function (method) {
    // add your code here

    // return to main state
    $state.go('home');
  }
})

// Finding controller
.controller('FindingCtrl', function($scope, Drivers, $state) {
  // get list of drivers
  $scope.drivers = Drivers.all();

  // start on load
  $scope.init = function() {

//--------------------------------------------------------------------------------------------------------//
    var address_pickup = (document.getElementById("d_source"));
    var autocomplete_pckup = new google.maps.places.Autocomplete(address_pickup);
    autocomplete_pckup.setTypes(['geocode']);
    google.maps.event.addListener(autocomplete_pckup,'place_changed',function(){
      var place = autocomplete_pckup.getPlace();
      if(!place.geometry){
        return;
      }

      //------------------------------------------------------------------
      geocoder = new google.maps.Geocoder();
          var address = document.getElementById("d_source").value;
          geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {

            user_source = new google.maps.LatLng(parseFloat(results[0].geometry.location.lat()),parseFloat(results[0].geometry.location.lng()));

            }

            else {
              alert("Geocode was not successful for the following reason: " + status);
            }
          });
          google.maps.event.addDomListener(window, 'load', initialize);

      //------------------------------------------------------------------
    });
//--------------------------------------------------------------------------------------------------------//
var address_dropoff = (document.getElementById("d_dest"));
var autocomplete_drpoff = new google.maps.places.Autocomplete(address_dropoff);
autocomplete_drpoff.setTypes(['geocode']);
google.maps.event.addListener(autocomplete_drpoff ,'place_changed',function(){
  var place = autocomplete_drpoff.getPlace();
  if(!place.geometry){
    return;
  }
//---------------------------------------------------------------------
geocoder = new google.maps.Geocoder();
address = document.getElementById("d_dest").value;
geocoder.geocode( { 'address': address}, function(results, status) {
  if (status == google.maps.GeocoderStatus.OK) {

    user_destination = new google.maps.LatLng(parseFloat(results[0].geometry.location.lat()),parseFloat(results[0].geometry.location.lng()));

  }

  else {
    alert("Geocode was not successful for the following reason: " + status);
  }
});
google.maps.event.addDomListener(window, 'load', initialize);

//---------------------------------------------------------------------
});
//----------------------------------------------------------------------------------------------------------------------------
    // setTimeout(function() {
    //   $state.go('driver');
    // }, 1000)
  }
})

// Driver controller
.controller('DriverCtrl', function($scope, Drivers, $state, $ionicHistory) {
  // get driver profile
  // change driver id here
  $scope.driver = Drivers.get(1);

  // go to tracking screen
  $scope.track = function () {


    // go to tracking state
    $state.go('tracking');
  };
})

// Tracking controller
.controller('TrackingCtrl', function($scope, Drivers, $state, $ionicHistory, $ionicPopup) {
  // map object
  $scope.map = null;

  // map height
  $scope.mapHeight = 360;

  // get driver profile
  // change driver id here
  $scope.driver = Drivers.get(1);

  // ratings stars
  $scope.stars = [0, 0, 0, 0, 0];

  function initialize() {
    // set up begining position
    myLatlng = new google.maps.LatLng(21.0227358,105.8194541);

    // set option for map
    var mapOptions = {
      center: myLatlng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false
    };
    // init map
    var map = new google.maps.Map(document.getElementById("map_tracking"), mapOptions);

    // assign to stop
    $scope.map = map;

    // get ion-view height
    var viewHeight = window.screen.height - 44; // minus nav bar
    // get info block height
    var infoHeight = document.getElementsByClassName('tracking-info')[0].scrollHeight;

    $scope.mapHeight = viewHeight - infoHeight;
  }

  function showRating() {
    $scope.data = {
      stars: $scope.stars
    }

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      templateUrl: 'templates/popup-rating.html',
      title: 'Thank you',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Submit</b>',
          type: 'button-balanced',
          onTap: function(e) {
            if (!$scope.data.stars) {
              //don't allow the user to close unless he enters note
              e.preventDefault();
            } else {
              return $scope.data.stars;
            }
          }
        },
      ]
    });
    myPopup.then(function(res) {
      // save rating here

      // go to home page
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('home');
    });
  }

  $scope.$on('$ionicView.enter', function() {

  });

  // load map when the ui is loaded
  $scope.init = function() {
    setTimeout(function() {
      initialize();
    }, 200);

    // finish trip
    setTimeout(function() {
      showRating();
    }, 1000)
  }
})

// History controller
.controller('HistoryCtrl', function($scope, Trips) {
  // get list of trips from model
  $scope.records = Trips.all();
})

// Notification controller
.controller('NotificationCtrl', function($scope, Notifications) {
  // get list of notifications from model
  $scope.notifications = Notifications.all();
})

// Support controller
.controller('SupportCtrl', function($scope) {})

// Profile controller
.controller('ProfileCtrl', function($scope) {
 // user data
    $scope.user = {
      name: "Adam Lambert",
      profile_picture: "img/thumb/adam.jpg",
      phone: "+84941727190",
      email: "success.ddt@gmail.com"
    }
})

// Authentication controller
// Put your login, register functions here
.controller('AuthCtrl', function($scope, $ionicHistory) {
  // hide back butotn in next view
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
})
