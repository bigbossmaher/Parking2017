// Initialize your app
var myApp = new Framework7({
  modalButtonOk: 'Ok',
  modalButtonCancel: ' Annuler',
  swipePanelOnlyClose: true
});

// Export selectors engine
var $$ = Dom7;
var t;
//variable du position de voiture marqué / les markeurs de parkins
var position_mark_car = [];
var parking_Markers = {};

// Add view
var mainView = myApp.addView('.view-main', {
  // Because we use fixed-through navbar we can enable dynamic navbar
  dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('about', function(page) {
  // run createContentPage func after link was clicked
  $$('.create-page').on('click', function() {
    createContentPage();
  });
});

//important
var x = 0;
// Welcome screen / tuto
/*
var myapp = new Framework7();
var options1 = {
    'bgcolor': '#0da6ec',
    'fontcolor': '#fff'
}

var welcomescreen_slides = [
    {
        id: 'slide0',
        title: 'Slide 0', // optional
        picture: '<div class="tutorialicon">♥</div>',
        text: 'Welcome to this tutorial. In the next steps we will guide you through a manual that will teach you how to use this app.'
    },
    {
        id: 'slide1',
        title: 'Slide 1', // optional
        picture: '<div class="tutorialicon">✲</div>',
        text: 'This is slide 2'
    },
    {
        id: 'slide2',
        title: 'Slide 2', // optional
        picture: '<div class="tutorialicon">♫</div>',
        text: 'This is slide 3'
    },
    {
        id: 'slide3',
        //title: 'NO TITLE',
        picture: '<div class="tutorialicon">☆</div>',
        text: 'Thanks for reading! Enjoy this app.<br><br><button onclick="welcomescreen.close()" id="tutorial-close-btn">End Tutorial</button>'
    }
];
var welcomescreen = myapp.welcomescreen(welcomescreen_slides, options1);
*/

// Generate dynamic page
var dynamicPageIndex = 0;

function createContentPage() {
  mainView.router.loadContent(
    '<!-- Top Navbar-->' +
    '<div class="navbar">' +
    '  <div class="navbar-inner">' +
    '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
    '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
    '  </div>' +
    '</div>' +
    '<div class="pages">' +
    '  <!-- Page, data-page contains page name-->' +
    '  <div data-page="dynamic-pages" class="page">' +
    '    <!-- Scrollable page content-->' +
    '    <div class="page-content">' +
    '      <div class="content-block">' +
    '        <div class="content-block-inner">' +
    '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
    '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
    '        </div>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>'
  );
  return;
}

//side panels
$$('.open-left-panel').on('click', function(e) {
  // 'left' position to open Left panel
  myApp.openPanel('left');
  map.setClickable(false);
  if ($$('.picker-modal.modal-in').length > 0) {
    myApp.closeModal('.picker-modal.modal-in');
  }

});

$$('.open-right-panel').on('click', function(e) {
  // 'right' position to open Right panel
  myApp.openPanel('right');
  map.setClickable(false);
  if ($$('.picker-modal.modal-in').length > 0) {
    myApp.closeModal('.picker-modal.modal-in');
  }

});

$$('.panel-right').on('close', function() {
  map.setClickable(true);
});

$$('.panel-left').on('close', function() {
  map.setClickable(true);
});

// supprimer l'encien marker
function removeLastMarker() {
  var lastMarker = position_mark_car.pop();
  if (lastMarker) {
    lastMarker.remove();
  }
}

//supprimer les markeurs des parking sur le map
function Remove_all_markers_of_parking() {
  var keys = Object.keys(parking_Markers);
  keys.forEach(function(key) {
    parking_Markers[key].remove();
    delete parking_Markers[key];
  });
}

//autocomplete part
$$('#myplace').on('focusin', function(e) {
  $$('#myplace').val('');
  map.setClickable(false);
});
$$('#myplace').on('blur', function(e) {
  map.setClickable(true);
});


//marquer ma voiture

$$('.save-car-place').on('click', function() {
  var onSuccess = function(location) {

    var storedData = myApp.formStoreData('localisation_du_voiture', {
      'lat': location.latLng.lat,
      'lng': location.latLng.lng

    });

    map.addMarker({
      'position': location.latLng,
      'title': "Votre Voiture est ici",
      'icon': 'www/icons/car.png',
      'animation': plugin.google.maps.Animation.DROP,
    }, function(marker) {
      marker.showInfoWindow();
      removeLastMarker();
      position_mark_car.push(marker);

    });

    $$('#MarquerMaVoiture').css('display', 'none');
    $$('#TrouverMaVoiture').css('display', 'block');
    //$("#les-villes").after( '<p id="TrouverMaVoiture"><a  href="#" class="fa fa-location-arrow get-car-place close-panel" aria-hidden="true">  Trouver ma voiture</a></p>');
    map.setCameraTarget(location.latLng);
    map.setCameraZoom(18);
  };

  var onError = function(msg) {
    myApp.alert("Erreur : on n'a pas pu localiser votre voiture");
  };
  map.getMyLocation(onSuccess, onError);
});


//trouver ma voiture
$$('.get-car-place').on('click', function() {
  var onSuccess = function(location) {
    var storedData = myApp.formGetData('localisation_du_voiture');
    distance = calcCrow(storedData.lat, storedData.lng, location.latLng.lat, location.latLng.lng);
    //alert(distance);
    if (distance >= 0.025) {
      direction_vers_parking((storedData.lat), JSON.stringify(storedData.lng));

      $$('#TrouverMaVoiture').css('display', 'none');
      $$('#MarquerMaVoiture').css('display', 'block');
      var storedData12 = myApp.formDeleteData('localisation_du_voiture');

      removeLastMarker();
      //update_parking_data_on_map();
      //alert($$('#MarquerMaVoiture').hasClass(save-car-place));
    } else {
      map.setClickable(false);
      myApp.alert("Vous etes deja trés proche a votre voiture", 'Parking Tunisie', function() {

        map.setClickable(true);

      });
    }
  };

  var onError = function(msg) {
    map.setClickable(false);
    myApp.alert("Erreur de localisation , merci d'activer le GPS", 'Parking Tunisie', function() {

      map.setClickable(true);

    });
  };
  map.getMyLocation(onSuccess, onError);





  //alert("car found");
});

//facebook sidebar button
$$('#facook_page').on('click', function(e) {
  myApp.closePanel();
  window.open('fb://page/' + 268998090226552, '_system', 'location=no');
});


//notre sitewbe button
$$('#notre_siteweb').on('click', function(e) {
  myApp.closePanel();
  startApp.set({ /* params */
    "action": "ACTION_VIEW",
    "uri": "https://www.parking.tn/"
  }).start();

});

//open modal des villes
$$('#les-villes').on('click', function() {
  myApp.closePanel();
  myApp.modal({
    title: 'Les villes',
    verticalButtons: true,
    buttons: [{
        text: 'Tunis',
        onClick: function() {
          map.animateCamera({
            'target': {
              lat: 36.793447,
              lng: 10.172239
            },
            'tilt': 60,
            'zoom': 15,
            //'bearing': 140
          });
        }
      },
      {
        text: 'Ariana',
        onClick: function() {
          map.animateCamera({
            'target': {
              lat: 36.860530,
              lng: 10.173859
            },
            'tilt': 60,
            'zoom': 15,
            //'bearing': 140
          });
        }
      },
      {
        text: 'Marsa',
        onClick: function() {
          map.animateCamera({
            'target': {
              lat: 36.887734,
              lng: 10.318161
            },
            'tilt': 60,
            'zoom': 15,
            //'bearing': 140
          });
        }
      },
      {
        text: 'Sfax',
        onClick: function() {
          map.animateCamera({
            'target': {
              lat: 34.739475,
              lng: 10.756454
            },
            'tilt': 60,
            'zoom': 15,
            //'bearing': 140
          });
        }
      },
      {
        text: 'Sousse',
        onClick: function() {
          map.animateCamera({
            'target': {
              lat: 35.825164,
              lng: 10.632297
            },
            'tilt': 60,
            'zoom': 15,
            //'bearing': 140
          });
        }
      },
      {
        text: 'Monastir',
        onClick: function() {
          map.animateCamera({
            'target': {
              lat: 35.772350,
              lng: 10.822063
            },
            'tilt': 60,
            'zoom': 15,
            //'bearing': 140
          });
        }
      }
    ]
  });
});


function ouvrir_iterature_de_voiture() {
  var storedData = myApp.formGetData('localisation_du_voiture');

  var onSuccess = function(location) {
    lat = location.latLng.lat;
    lng = location.latLng.lng;
    maposition = location.latLng.lat + "," + location.latLng.lng;
    direction = JSON.stringify(storedData.lat) + "," + JSON.stringify(storedData.lng);
    myApp.confirm('ouvrir itérature ?', 'Parking Tunisie',
      function() {
        // No more available.
        plugin.google.maps.external.launchNavigation({
          "from": maposition,
          "to": direction
        });
      },
      function() {

      }
    );
  };

  var onError = function(msg) {
    myApp.alert("Erreur : ereur");
  };
  map.getMyLocation(onSuccess, onError);
  //alert(getDistanceBetweenPoints(lat,lng,JSON.stringify(storedData.lat),JSON.stringify(storedData.lng));
}

function direction_vers_parking(lat1, lng1) {

  var onSuccess = function(location) {
    lat = location.latLng.lat;
    lng = location.latLng.lng;
    maposition = location.latLng.lat + "," + location.latLng.lng;
    direction = lat1 + "," + lng1;
    launchnavigator.navigate([location.latLng.lat, location.latLng.lng], {
      start: direction
    });
  };

  var onError = function(msg) {
    myApp.alert("Erreur : ereur");
  };
  map.getMyLocation(onSuccess, onError);
  //alert(getDistanceBetweenPoints(lat,lng,JSON.stringify(storedData.lat),JSON.stringify(storedData.lng));
}



function calcCrow(lat1, lon1, lat2, lon2) {
  var positionA = {
    lat: lat1,
    lng: lon1
  };
  var positionB = {
    lat: lat2,
    lng: lon2
  };
  return plugin.google.maps.geometry.spherical.computeDistanceBetween(positionA, positionB);
  /*
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  */
}

// Converts numeric degrees to radians
function toRad(Value) {
  return Value * Math.PI / 180;
}


//etat actuelle du parking - affichage du message quand il n ya pas de parking
/*$$('.etat-actuelle-parking').on('click',function () {
    var found_parking=0 ;
    var storedData1 = myApp.formGetData('downloadedParking');
    //var storedData1 = myApp.formGetData('NotificationsForParkings');
    if (storedData1) {

            //alert("hell555o");
            var onSuccess = function (location) {

                for (var i = 0; i < storedData1.length; i++) {
                    distance = calcCrow(storedData1[i].lat, storedData1[i].long, location.latLng.lat, location.latLng.lng);
                    //alert(distance);
                    if (distance <= 0.05) {
                        found_parking =1;

                        myApp.modal({
                            title: 'pourcentage',
                            text: storedData1[i].mtitle,
                            verticalButtons: true,
                            buttons: [
                                {
                                    text: '0%',
                                    onClick: function () {
                                        etat_add(0, storedData1[i].idparking);
                                        //window.geofence.remove(storedData1[i].notificationid);
                                        //window.geofence.remove(storedData1[i].notificationid);
                                    }
                                }, {
                                    text: '25%',
                                    onClick: function () {
                                        etat_add(25, storedData1[i].idparking);
                                        //window.geofence.remove(storedData1[i].notificationid);
                                    }
                                },
                                {
                                    text: '50%',
                                    onClick: function () {
                                        etat_add(50, storedData1[i].idparking);
                                        //window.geofence.remove(storedData1[i].notificationid);
                                    }
                                },
                                {
                                    text: '75%',
                                    onClick: function () {
                                        etat_add(75, storedData1[i].idparking);
                                        //window.geofence.remove(storedData1[i].notificationid);
                                    }
                                }, {
                                    text: '100%',
                                    onClick: function () {
                                        etat_add(100, storedData1[i].idparking);
                                        //window.geofence.remove(storedData1[i].notificationid);
                                    }
                                }, {
                                    text: 'Fermer',
                                    onClick: function () {
                                        //window.geofence.remove(storedData1[i].notificationid);
                                    }
                                }
                            ]
                        })
                        break;

                    }


                }

                if (found_parking == 0){
                    myApp.alert("il n y a pas un parkink prés de vous");
                }
            };

            var onError = function (msg) {
                myApp.alert("Erreur de localisation , merci d'activer le GPSou l'internet");
            };
            map.getMyLocation(onSuccess, onError);

    }else {location.reload();}
} );


*/

//contact email send
$$('body').on('click', '#send_email', function(e) {
  /* your code goes here */
  var name = document.getElementById("name").value;
  var email_add = document.getElementById("email_add").value;
  var message = document.getElementById("message").value;
  //jquery ajax to send values to php using POST
  $$.post('https://www.parking.tn/app/send.php', {
    name: name,
    email_add: email_add,
    message: message
  }, function(data) {
    myApp.alert(data, 'Parking Tunisie');
  });
});



//starting from here

//download parking
function downloadParking() {
  var storedData1 = myApp.formGetData('downloadedParking');
  if (storedData1) {
    window.plugins.insomnia.keepAwake();
    showMapParkingData();
    notificationsInMemory();
  } else {
    $$.get('https://www.parking.tn/app/parking.php', function(data) {
      ParkingData = JSON.parse(data);
      var storedData = myApp.formStoreData('downloadedParking', ParkingData);
      var storedData2 = myApp.formStoreData('lastparking', {
        'notificationid': 99999999999,
      });

      setInterval(function() {
        var storedData3 = myApp.formGetData('downloadedParking');
        if (storedData3) {

          //map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady1);
          clearInterval();
          location.reload();


        }
      }, 2000);
    }, function(data, xhr) {
      map.setClickable(false);
      myApp.confirm('Connextion internet ?', 'Parking Tunisie', function() {
        map.setClickable(true);
        setTimeout(function() {
          location.reload();
        }, 5000);
      });
    });




  }
  //window.geofence.initialize()

}

// put the notification in memory
function notificationsInMemory() {
  cordova.plugins.backgroundMode.on('activate', function() {


    window.geofence.initialize();
    window.geofence.onTransitionReceived = function(geofences) {
      geofences.forEach(function(geo) {
        console.log('Geofence transition detected123', geo);
      });
    };
    var storedData1 = myApp.formGetData('downloadedParking');
    if (storedData1) {
      var onSuccess = function(location) {
        var arr = [];
        for (var i = 0; i < storedData1.length; i++) {
          distance = calcCrow(storedData1[i].lat, storedData1[i].long, location.latLng.lat, location.latLng.lng);
          arr.push({
            id: storedData1[i].notificationid,
            dist: distance
          });
          if (i == storedData1.length - 1) {
            //alert("sorting");
            arr.sort(function(a, b) {
              return a.dist - b.dist;
            });
          }
        }
        setTimeout(function() {
          //for(i=0;i<97;i++){
          //console.log(storedData1[arr[i].id].mtitle);
          //}

          for (i = 0; i < 97; i++) { //to be chnaged to 100 from 97
            //console.log("distance: "  + arr[i].id + " / "+ arr[i].dist);
            window.geofence.addOrUpdate({
              id: "" + storedData1[arr[i].id].notificationid,
              latitude: storedData1[arr[i].id].lat, //26.383315,
              longitude: storedData1[arr[i].id].long, //-80.099635,
              radius: 30,
              transitionType: 1, //TransitionType.ENTER,
              notification: {
                id: i,
                title: "vous merci de nous indiquer",
                text: "" + storedData1[arr[i].id].mtitle,
                openAppOnClick: true,
                vibrate: [1000, 500, 2000],
                smallIcon: "res://icon.png", //Small icon showed in notification area, only res URI
                icon: "file://icon.png", //icon showed in notification drawer
              }
            }).then(function() {
              //console.log('Geofence successfully added : '+ storedData1[arr[i].id].mtitle);
            }).catch(function(reason) {
              console.log('Adding geofence failed' + storedData1[arr[i].id].mtitle);
            });




            if (i == 96) {
              moveCameraTomyPosition();
            }
          }
          window.geofence.addOrUpdate({
            id: "69ca1bff4d3748acdb",
            latitude: 34.855719,
            longitude: 9.786306,
            radius: 30,
            transitionType: TransitionType.BOTH,
            notification: {
              id: 1,
              title: "opera sammoudi",
              text: "opera sammoudi",
              openAppOnClick: true
            }
          }).then(function() {
            //alert('Geofence successfully added opera sammoudi');
          }).catch(function(reason) {
            console.log('Adding geofence failed', reason);
          });
          window.geofence.addOrUpdate({
            id: "69ca1b88-64-ff4d3748afgd",
            latitude: 34.8542203,
            longitude: 9.7859762,
            radius: 100,
            transitionType: 1,
            openAppOnClick: true,
            notification: {
              id: 1,
              title: "dar",
              text: "dar",
              openAppOnClick: true,
              happensOnce: true,
            }
          }).then(function() {

          }, function(reason) {
            console.log('Adding geofence failed', reason);
          });
        }, 6000);
      };

      var onError = function(msg) {
        map.setClickable(false);
        myApp.alert("Erreur de localisation , merci d'activer le GPS", 'Parking Tunisie', function() {

          map.setClickable(true);

        });
      };
      map.getMyLocation(onSuccess, onError);







    }
  });
}


//check if parking is close
function closeParking() {
  var storedData1 = myApp.formGetData('downloadedParking');
  if (storedData1) {

    var onSuccess = function(location) {

      for (var i = 0; i < storedData1.length; i++) {
        distance = calcCrow(storedData1[i].lat, storedData1[i].long, location.latLng.lat, location.latLng.lng);
        //alert(distance);
        if (distance <= 0.025) {
          clearInterval(t);
          map.setClickable(false);
          t = 0;
          var storedData2 = myApp.formStoreData('lastparking', {
            'notificationid': storedData1[i].notificationid,
          });

          myApp.modal({
            title: 'pourcentage',
            text: storedData1[i].mtitle,
            verticalButtons: true,
            buttons: [{
                text: 'Vide',
                onClick: function() {
                  map.setClickable(true);
                  etat_add(0, storedData1[i].idparking);
                  setTimeout(function() {
                    t = setInterval(closeParking, 10000);
                  }, 60000);
                }
              }, {
                text: '25%',
                onClick: function() {
                  map.setClickable(true);
                  etat_add(25, storedData1[i].idparking);
                  setTimeout(function() {
                    t = setInterval(closeParking, 10000);
                  }, 60000);
                }
              },
              {
                text: '50%',
                onClick: function() {
                  map.setClickable(true);
                  etat_add(50, storedData1[i].idparking);
                  setTimeout(function() {
                    t = setInterval(closeParking, 10000);
                  }, 60000);
                }
              },
              {
                text: '75%',
                onClick: function() {
                  map.setClickable(true);
                  etat_add(75, storedData1[i].idparking);
                  setTimeout(function() {
                    t = setInterval(closeParking, 10000);
                  }, 60000);
                }
              }, {
                text: 'Plein',
                onClick: function() {
                  map.setClickable(true);
                  etat_add(100, storedData1[i].idparking);
                  setTimeout(function() {
                    t = setInterval(closeParking, 10000);
                  }, 60000);
                }
              }, {
                text: 'Fermer',
                onClick: function() {
                  map.setClickable(true);
                  setTimeout(function() {
                    t = setInterval(closeParking, 10000);
                  }, 100000);
                }
              }
            ]
          });
          //break;
          // those lines will show the popup infromations mil loute
          break;

        }


      }


    };

    var onError = function(msg) {
      //map.setClickable(false);
      myApp.alert("Erreur de localisation , merci d'activer le GPS", 'Parking Tunisie', function() {

        //map.setClickable(true);

      });
    };
    map.getMyLocation(onSuccess, onError);

  } else {
    setTimeout(function() {
      //location.reload();
    }, 2000);
  }
}

function closeParkingCycle() {
  t = setInterval(closeParking, 10000);

}



//affichage des parking
function showMapParkingData() {
  var storedData1 = myApp.formGetData('downloadedParking');
  var storedData = myApp.formGetData('localisation_du_voiture');
  if (storedData1) {
    //creation du marker du voiture marqué su mawjouda
    if (storedData) {

      map.addMarker({
        'position': {
          'lat': storedData.lat,
          'lng': storedData.lng
        },
        'title': "Votre Voiture est ici",
        'icon': 'www/icons/car.png',
        'animation': plugin.google.maps.Animation.DROP,
      }, function(marker) {
        marker.showInfoWindow();
        removeLastMarker();
        position_mark_car.push(marker);

      });
      $$('#MarquerMaVoiture').css('display', 'none');

    } else {
      $$('#TrouverMaVoiture').css('display', 'none');
    }

    for (var i = 0; i < storedData1.length; i++) {
      storedData1[i].position = {
        lat: storedData1[i].lat,
        lng: storedData1[i].long
      };
    }

    plotMarkers(storedData1, function(markers) {
      //console.log("added");
      //markers[markers.length - 1].hideInfoWindow();
    });


  } else {


  }


  var onError = function(msg) {
    alert(JSON.stringify(msg));
  };


}

function plotMarkers(data, callback) {
  data.forEach(function(parking) {
    if (parking.etat_actuelle) {
      console.log(parking);
    }
  });
  // console.log(data);
  var mvcArray = new plugin.google.maps.BaseArrayClass(data);
  if ((Object.keys(parking_Markers)).length === 0) {
    //-------------------------------------
    // Create markers for the first time
    //-------------------------------------
    mvcArray.map(function(markerOptions, cb) {
      map.addMarker(markerOptions, cb);
    }, function(markers) {


      markers.forEach(function(marker) {
        var idparking = marker.get("idparking");
        parking_Markers[idparking] = marker;
        marker.on("etat_actuelle_changed", onEtatActuelle_change);
        marker.on(plugin.google.maps.event.MARKER_CLICK, onParkingMarker_click);
      });
      callback();
    });
  } else {
    //-------------------------------------
    // From second time, and after...
    //-------------------------------------
    mvcArray.map(function(markerOptions, cb) {
      var keys = Object.keys(markerOptions);
      var idparking = markerOptions.idparking;
      var marker = parking_Markers[idparking];
      marker.set("etat_actuelle", markerOptions.etat_actuelle);
      cb();
    }, callback);
  }

}
function onEtatActuelle_change(oldValue, newValue, marker) {
  console.log(marker.get("idparking", oldValue + " -> " + newValue));
  newValue = newValue || "0";
  marker.setIcon("www/icons/parking" + newValue + ".png");
}

function findExtraInfo(parkingId) {
  // This is wasteful way!!! Use hash table or SqliteDB
  for (var i = 0; i < parking_tsawer_prix.length; i++) {
    if (parkingId === parking_tsawer_prix[i].id) {
      return parking_tsawer_prix[i];
    }
  }
  return null;
}

function showParkingPicker(params) {
  var html = [
    '<div class="picker-modal">',
    '<div class="toolbar">',
    '<div class="toolbar-inner">',
    '<div class="left"><p>{# mtitle #}</p></div>',
    '<div class="right"><a href="#" class="close-picker"><i class="fa fa-times-circle fa-3x" aria-hidden="true"></i></a></div>',
    '</div>',
    '</div>',
    '<div class="picker-modal-inner">',
    '<div class="content-block">',
    '<div class="row no-gutter">',
    '<div class="col-30"><img id="image_de_parking" src="images_de_parking/{# image #}"></div>',
    '<div class="col-40">',
    '<span style="margin-top:10px;">',
    '<img class="icon_de_parking" src="img/{# couvert #}">',
    '<img class="icon_de_parking" src="img/{# camera #}">',
    '<img class="icon_de_parking" src="img/{# handicape #}">',
    '<img class="icon_de_parking" src="img/{# gard #}">',
    '</span>',
    '<br>',
    '<span id="nom_du_parking">Etat Actuelle :{# etat_act #}</span>',
    '<br>',
    '<span id="capacite_holder">{# capacité #}</span>',
    '</div>',
    '<div class="col-30">',
    '<a onclick="direction_vers_parking(lat,long)" href="#" class="button active">',
    '<i class="fa fa-arrow-circle-right" aria-hidden="true"></i>',
    'Itinéraire',
    '</a>',
    '<br>',
    '<img id="cach_icon" src="img/Cash.png">{# prix #}',
    '<br>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</div>'
  ].join('');

  // Simple template engine
  var keys = Object.keys(params);
  keys.forEach(function(key) {
    html = html.replace("{# " + key + " #}", params[key]);
  });

  myApp.pickerModal(html);
}

function onParkingMarker_click(position, marker) {

  //alert("hello");
  //show_parking_data();
  var parkingId = marker.get("idparking");
  var extraInfo = findExtraInfo(parkingId);
  if (!extraInfo) {
    console.error("can not find the extra information for " + parkingId);
    return;
  }

  var etat_act_table = {
    "0": " Vide",
    "25": " 25%",
    "50": " 50%",
    "75": " 75%",
    "100": " Plein",
    "null": "  f2"
  };

  var etat_act = marker.get("etat_actuelle");
  etat_act = etat_act_table[etat_act] || " Vide";

  showParkingPicker({
    'mtitle': marker.get('mtitle'),
    'image': extraInfo.image,
    'couvert': (extraInfo.couvert === 0 ? "unactive_covered.png" : "covered.png"),
    'camera': (extraInfo.camera === 0 ? "unactive_camera.png" : "camera.png"),
    'handicape': (extraInfo.handicape === 0 ? "unactive_handicapp.png" : "handicapp.png"),
    'gard': (extraInfo.gard === 0 ? "noguard.png" : "guard.png"),
    'etat_act': etat_act,
    'capacité': (extraInfo.capacité > 0 ?
      'Capacité :' + extraInfo.capacité + ' Voitures' :
      'Capacité :' + extraInfo.capacité + ''),
    'prix': extraInfo.prix
  });

  console.log(marker.get("icon"));

  // Do you need this???

  // marker.setIcon({
  //   'url': marker.get("icon"),
  //   'size': {
  //     width: 60,
  //     height: 90 // in pixels
  //   }
  // });

}


//update parking
function update_parking_data_on_map() {
  var storedData = myApp.formGetData('localisation_du_voiture');
  setInterval(function() {

    $$.get('https://www.parking.tn/app/parking.php',
      function(data) {
        //---------------------
        // Ajax successful
        //---------------------
        //Remove_all_markers_of_parking();
        ParkingData = JSON.parse(data);
        //alert("donload");

        for (var i = 0; i < ParkingData.length; i++) {
          ParkingData[i].position = {
            lat: ParkingData[i].lat,
            lng: ParkingData[i].long
          };
        }

        plotMarkers(ParkingData, function(markers) {
          //console.log("added");
          //markers[markers.length - 1].hideInfoWindow();
        });
      },
      function(data, xhr) {
        //---------------------
        // Ajax failed
        //---------------------
        map.setClickable(false);
        myApp.alert('Connexion internet ?', 'Parking Tunisie', function() {
          location.reload();
        });
      });

    //alert("cleared");

    /*   //alert("inserted");
        setTimeout(function () {
            closeParking();
        }, 5000);
*/
  }, 15000);
}

//funtion that will get the parking etat
function getParkingEtat(parkingID) {
  $$.post('https://www.parking.tn/app/get-etat.php', {
    id: parkingID
  }, function(data, status) {
    if (status == 200) {
      var el = document.getElementById('etatActuellePopUP');
      el.innerHTML = 'Etat Actuelle : ' + data + '%';
    } else {
      map.setClickable(false);
      myApp.alert('Connexion internet ?', 'Parking Tunisie', function() {

        map.setClickable(true);

      });
    }

  });
}

//function that insert etat in database
function etat_add(val, idd) {
  myApp.showPreloader();
  $$.post('https://www.parking.tn/app/addetat.php', {
    etat: val,
    id: idd
  }, function(data, status) {
    if (status == 200) {
      setTimeout(function() {
        myApp.hidePreloader('Chargement...');
      }, 2000);
    } else {
      setTimeout(function() {
        myApp.hidePreloader();
        map.setClickable(false);
        myApp.alert('Connexion internet ?', 'Parking Tunisie', function() {

          map.setClickable(true);

        });
      }, 2000);
    }

  });
}

//popup du markers info window ( modal )
function show_parking_data() {
  //check_internet_connection();
  // Check first, if we already have opened picker
  if ($$('.picker-modal.modal-in').length > 0) {
    myApp.closeModal('.picker-modal.modal-in');
  }
  myApp.pickerModal(
    '<div class="picker-modal">' +
    '<div class="toolbar">' +
    '<div class="toolbar-inner">' +
    '<div class="left"></div>' +
    '<div class="right"><a href="#" class="close-picker">Close</a></div>' +
    '</div>' +
    '</div>' +
    '<div class="picker-modal-inner">' +
    '<div class="content-block">' +
    '<p>Lorem ipsum dolor ...</p>' +
    '</div>' +
    '</div>' +
    '</div>'
  );
}

// les fonctions de démarrages
function autocompleteComp() {
  var optionsT = {
    componentRestrictions: {
      country: "tn"
    }
  };
  $$('body').on('touchstart', '.pac-container', function(e) {
    e.stopImmediatePropagation();
  });
  var acInputs = document.getElementById("myplace");
  var autocomplete = new google.maps.places.Autocomplete(acInputs, optionsT);
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    map.animateCamera({
      'target': place.geometry.location,
      'tilt': 60,
      'zoom': 15,
      //'bearing': 140
    });
  });

}

function initializeMap() {
  var div = document.getElementById("map_canvas");
  map = plugin.google.maps.Map.getMap(div, {
    'backgroundColor': 'white',
    'mapType': plugin.google.maps.MapTypeId.ROADMAP,
    'controls': {
      'compass': true,
      'myLocationButton': true,
      'indoorPicker': true,
      'zoom': true
    },
    'gestures': {
      'scroll': true,
      'tilt': true,
      'rotate': true,
      'zoom': true
    },
    'camera': {
      'latLng': {
        lat: 35.885604,
        lng: 10.387723
      },
      'tilt': 30,
      'zoom': 7,
      'bearing': 0
    }
  });
}

function moveCameraTomyPosition() {
  var onSuccess = function(location) {
    map.animateCamera({
      'target': new plugin.google.maps.LatLng(location.latLng.lat, location.latLng.lng),
      //'tilt': 60,
      'zoom': 14,
      //'bearing': 140
    });
  };

  var onError = function(msg) {

    myApp.alert("Erreur de localisation , merci d'activer le GPS", 'Parking Tunisie', function() {

      location.reload();

    });
  };
  map.getMyLocation(onSuccess, onError);
}

function onMapReady1() {
  var onSuccess = function(location) {
    cordova.plugins.backgroundMode.enable();
    downloadParking();
    autocompleteComp();
    update_parking_data_on_map();
    closeParkingCycle();
    moveCameraTomyPosition();

  };

  var onError = function(msg) {

    if (x == 0) {
      //location.reload();
      x++;

    }
    if (x == 1) {
      myApp.alert("Erreur de localisation , merci d'activer le GPS", 'Parking Tunisie', function() {

        location.reload();

      });
    }
  };
  map.getMyLocation(onSuccess, onError);


}

function executeWelcomeScreen() {
  // execute welcome Screen
  //map.addEventListener(plugin.google.maps.event.MAP_READY, map.setClickable(false));
  var welcomescreen_slides = [{
      id: 'slide0',
      title: 'Slide 0', // optional
      picture: '<div class="tutorialicon">♥</div>',
      text: 'Welcome to this tutorial. In the next steps we will guide you through a manual that will teach you how to use this app.'
    },
    {
      id: 'slide1',
      title: 'Slide 1', // optional
      picture: '<div class="tutorialicon">✲</div>',
      text: 'This is slide 2'
    },
    {
      id: 'slide2',
      title: 'Slide 2', // optional
      picture: '<div class="tutorialicon">♫</div>',
      text: 'This is slide 3'
    },
    {
      id: 'slide3',
      //title: 'NO TITLE',
      picture: '<div class="tutorialicon">☆</div>',
      text: 'Thanks for reading! Enjoy this app.<br><br><button  onclick="sTopWelcomcomeScreen();" id="tutorial-close-btn">End Tutorial</button>'
    }
  ];
  var myapp = new Framework7();
  var options = {
    'bgcolor': '#0da6ec',
    'fontcolor': '#fff'
  };
  var welcomescreen = myapp.welcomescreen(welcomescreen_slides, options);

}

function sTopWelcomcomeScreen() {
  var sto = myApp.formStoreData('launchWelcomex', {
    'val': '1',
  });
  location = "index.html";
}
