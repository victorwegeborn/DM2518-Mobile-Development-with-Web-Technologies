// JavaScript code for the Arduino Beacon example app.

// Application object.
var app = {}
var prox;
var acc;

// Regions that define which page to show for each beacon.
app.beaconRegions =
[
	{
		id: 'page-feet',
		uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
		major: 55605,
		minor: 58868
	},
	{
		id: 'page-shoulders',
		uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
		major: 33349,
		minor: 27161
	},
	{
		id: 'page-face',
		uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D',
		major: 56506,
		minor: 14941
	}
]

// Currently displayed page.
app.currentPage = 'page-default'

app.initialize = function()
{
	document.addEventListener(
		'deviceready',
		app.onDeviceReady,
		false)
	app.gotoPage(app.currentPage)
}

// Called when Cordova are plugins initialised,
// the iBeacon API is now available.
app.onDeviceReady = function()
{
	// Specify a shortcut for the location manager that
	// has the iBeacon functions.
	window.locationManager = cordova.plugins.locationManager

	// Start tracking beacons!
	app.startScanForBeacons()
}

app.startScanForBeacons = function()
{
	//console.log('startScanForBeacons')

	// The delegate object contains iBeacon callback functions.
	var delegate = new cordova.plugins.locationManager.Delegate()

	delegate.didDetermineStateForRegion = function(pluginResult)
	{
		//console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
	}

	delegate.didStartMonitoringForRegion = function(pluginResult)
	{
		//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
	}

	delegate.didRangeBeaconsInRegion = function(pluginResult)
	{
		//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
		app.didRangeBeaconsInRegion(pluginResult)
	}

	// Set the delegate object to use.
	locationManager.setDelegate(delegate)

	// Start monitoring and ranging our beacons.
	for (var r in app.beaconRegions)
	{
		var region = app.beaconRegions[r]

		var beaconRegion = new locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor)

		// Start monitoring.
		locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done()

		// Start ranging.
		locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done()
	}
}

// Display pages depending of which beacon is close.
app.didRangeBeaconsInRegion = function(pluginResult)
{
	//console.log('numbeacons in region: ' + pluginResult.beacons.length)

	// There must be a beacon within range.
	if (0 == pluginResult.beacons.length)
	{
		return
	}

	// Our regions are defined so that there is one beacon per region.
	// Get the first (and only) beacon in range in the region.
	var beacon = pluginResult.beacons[0]

	// The region identifier is the page id.
	var pageId = pluginResult.region.identifier

	//console.log('ranged beacon: ' + pageId + ' ' + beacon.proximity)

	// If the beacon is close and represents a new page, then show the page.
	if ((beacon.proximity == 'ProximityImmediate' || beacon.proximity == 'ProximityNear')
		&& app.currentPage == 'page-default')
	{
		prox = beacon.proximity;
		acc = beacon.accuracy;
		app.gotoPage(pageId)
		return
	}

	// If the beacon represents the current page but is far away,
	// then show the default page.
	if ((beacon.proximity == 'ProximityFar' || beacon.proximity == 'ProximityNear')
		&& app.currentPage == pageId)
	{
		app.gotoPage('page-default')
		return
	}
}

app.gotoPage = function(pageId)
{
	app.hidePage(app.currentPage)
	document.getElementById(String(app.currentPage)).childNodes[3].innerHTML = "";
	app.showPage(pageId)
	var myContent = document.getElementById(String(pageId)).childNodes[3];
	debug = false;
	if(pageId === "page-default") {
		myContent.innerHTML = "<p>Welcome to B[e]acon hunter! </p>\n"
							  "<p>Go find yourself some b[e]acon!";
	} else {
		if(myContent.innerHTML ===  "") {
			var page;
			// find uuid, major and minor for found page
			for(var i = 0; i < app.beaconRegions.length; i++) {
				if(app.beaconRegions[i].id === pageId) {
					page = app.beaconRegions[i];
				}
			}
			// Display info
			myContent.innerHTML =   "<p>UUID: " + page.uuid + "</p>\n" +
									"<p>major: " + page.major + "</p>\n" +
									"<p>minor: " + page.minor + "</p>\n" +
									"<p>Proximity: " + prox + "</p>\n" +
								  	"<p>Accuarcy: " + acc + "</p>";
		}
	}

	app.currentPage = pageId
}

app.showPage = function(pageId)
{
	document.getElementById(pageId).style.display = 'block'
}

app.hidePage = function(pageId)
{
	document.getElementById(pageId).style.display = 'none'
}

// Set up the application.
app.initialize()
