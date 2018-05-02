# iBeacon apps made easy

It can take some effort to create an iBeacon app, especially if you want it to be available on both iOS and Android. This tutorial shows how to to create an iBeacon mobile application using Evothings Studio.

Read the full guide on the [Evothings website](http://evothings.com/quick-guide-to-writing-mobile-ibeacon-applications-in-javascript/).

<!--
## What are iBeacons?

iBeacons are like very small lighthouses sending out signals that can be detected by a mobile application. The app can sense if a particular beacon is near or far away.  iBeacons are typically small devices powered by battery. Applications include notifications based on position/range, for example security information, commercial offerings, ads, tourist information, museum information, etc.

[iBeacon](https://developer.apple.com/ibeacon/) is Apple's beacon technology brand name and implementation. It is based on the Bluetooth Low Energy (BLE) wireless communication standard.

The BLE standard specifies an advertising mode, which is what iBeacons use. When a BLE device is in advertisement mode it repeatedly broadcasts packets over radio. The advertisement packet contains the name of the device and a scan record that can hold a limited amount of of data. Apple uses the scan record to send out a UUID that uniquely identifies the beacon.

There are several companies that make iBeacons, like [Estimote](http://estimote.com/), [Punch Through Design](http://punchthrough.com/bean/), [Kontakt](http://kontakt.io/), and [numerous additional offerings exist](http://www.alibaba.com/countrysearch/CN/ibeacon.html). The beekn website/blog presents an [iBeacon guide](http://beekn.net/guide-to-ibeacons/).

[Photographs of iBeacons]

## iBeacon APIs for mobile platforms

iOS has an [iBeacon API](https://developer.apple.com/library/ios/documentation/CoreLocation/Reference/CLLocationManager_Class/CLLocationManager/CLLocationManager.html) that you must use to scan for beacon information. Notably, the CoreBuetooth API cannot be used to detect beacons, as scan records that contain iBeacon headers are blocked by Apple.

Android and other platforms that support BLE can scan for iBeacons without any restrictions.

There are several iBeacon plugins for Cordova/PhoneGap, for example the [plugin by Peter Metz](https://github.com/petermetz/cordova-plugin-ibeacon).

While Apple place restrictions of how their own APIs can be used on iOS, other platforms can implement iBeacon libraries and applications without these restrictions. In addition, Apple does not manufacture iBeacon devices, they are a third party product. The openness of the BLE standard and the diversity of iBeacon hardware devices open up for lots or innovative beacon applications.

## Example app - iBeacons that make you relax

In a previous blogpost on ["DIY" beacon technology](http://evothings.com/diy-arduino-beacons/) we made an example app about ways to relax. Different relaxation techniques are shown depending on which beacon is closest to your mobile phone.

Here we will implement the same application, but this time we will use Apple's iBeacon technology.

The app has four pages. When you are close to a beacon, an information page presenting a relaxation technique is shown. When no beacons are near, a default page is shown. This type of application could be used in a museum or library, at a university, or at some other public location where visitors can be given time to relax.

[Screenshots from the app]

## Implementation overview

The app is developed in HTML/JavaScript. For iBeacon functionality the [cordova-ibeacon plugin](https://github.com/petermetz/cordova-plugin-ibeacon) is used (documentation is found by following the link). To deploy the app you can either use Evothings Client or build a native app that you publish on the app stores.

[Source code is on GitHub](https://github.com/divineprog/evo-demos/tree/master/Demos2014/iBeaconDemo).

File [index.html](https://github.com/divineprog/evo-demos/blob/master/Demos2014/iBeaconDemo/index.html) contains HTML data for the info pages of the application.

The JavaScript code that contains the iBeacon setup and logic is in file [app.js](https://github.com/divineprog/evo-demos/blob/master/Demos2014/iBeaconDemo/app.js).

## Tracking iBeacons - ranging vs. monitoring

To track iBeacons, you specify regions for the beacons for which you want to get notifications. Here is the code that defines the regions for the pages, the id is used to identify the page associated with a beacon:

	// Regions that define which page to show for each beacon.
	app.beaconRegions =
	[
		{
			id: 'page-feet',
			uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE',
			major: 1,
			minor: 1
		},
		{
			id: 'page-shoulders',
			uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE',
			major: 1,
			minor: 2
		},
		{
			id: 'page-face',
			uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE',
			major: 1,
			minor: 3
		}
	]

Note that you need to know the UUID of the beacons you wish to track. Same UIID can be shared by multipel beacons, in which case you can use the major and minor integer numbers to uniquely identify a beacon. It is however not mandatory to specify the major/minor numbers when tracking for beacons.

Different iBeacon vendors have different method for how to finding/specifying the UUID and major/minor numbers. When testing the relaxation app, we used the [LightBlue Bean](http://punchthrough.com/bean/), which is straightforward to configure over BLE.

## Ranging vs. monitoring

Next we will look a the code for tracking beacons. Note that two types of tracking are used for iBeacons. Monitoring, which is enabled by **startMonitoringForRegion**, tracks the entering and exiting regions. Monitoring can be run both when the app is in the foreground and in the background, may have a low update rate, and does not contain proximity information. Ranging, enabled by **startRangingBeaconsInRegion**, works only in the foreground, has a fast update rate, and has proximity information (ProximityImmediate, ProximityNear, ProximityFar). For further details regarding iBeacons and background vs foreground modes, explore [this report from Radius Networks](http://developer.radiusnetworks.com/2013/11/13/ibeacon-monitoring-in-the-background-and-foreground.html)


The example app uses ranging to determine proximity of the relaxation beacons. However, the code also enables monitoring of beacons for demonstrational purposes. The following piece of code iterates over the regions and enables monitoring and ranging for each region:

	// Start monitoring and ranging our beacons.
	for (var r in app.beaconRegions)
	{
		var region = app.beaconRegions[r]

		var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(
			region.id, region.uuid, region.major, region.minor)

		// Start monitoring.
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(console.error)
			.done()

		// Start ranging.
		cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion)
			.fail(console.error)
			.done()
	}

## Responding to iBeacon events

To listen for beacon events, a delegate object with callback functions is used, as is shown in the following code snippet:

	// The delegate object contains iBeacon callback functions.
	var delegate = locationManager.delegate.implement(
	{
		didDetermineStateForRegion: function(pluginResult)
		{
			//console.log('didDetermineStateForRegion: ' + JSON.stringify(pluginResult))
		},

		didStartMonitoringForRegion: function(pluginResult)
		{
			//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
		},

		didRangeBeaconsInRegion: function(pluginResult)
		{
			//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
			app.didRangeBeaconsInRegion(pluginResult)
		}
	})

The pluginResult object contains information about ranged beacon(s). Examine the code in file [app.js](https://github.com/divineprog/evo-demos/blob/master/Demos2014/iBeaconDemo/app.js) for further details. To enable logging, uncomment the console.log calls. Log output will be shown in the "Tools" window of Evothings Workbench.

As mentioned above, the example app uses ranging, but monitoring is also supplied for educational purposes.

## Running the example app

To run the example app, do as follows:

* [Download the source code from GitHub](https://github.com/divineprog/evo-demos/tree/master/Demos2014/iBeaconDemo)
* Start Evothings Workbench on a desktop machine
* Launch the Evothings Client app on a mobile device and connect to the Workbench
* Drag the index.html file of the example into the Workbench project list
* Edit file app.js to contain the UUIDs and major/minor numbers of your iBeacons (alternatively configure your iBeacons with the values used in the example)
* Click the RUN button in the Workbench project list
* When the app has loaded onto the mobile device, move it close to the beacons to see the different relaxation pages

Note that you can try out the example even if you have only one iBeacon. In this case, the page associated with the beacon will display when you are close to it. The default page will be shown when the beacon is out of range or turned off.

You can create your own iBeacon using a computer that supports BLE. For example, here is [how to turn a Raspberry Pi into an iBeacon](http://www.theregister.co.uk/2013/11/29/feature_diy_apple_ibeacons/). For a specification of the iBeacon advertisement format, see for instance [here](http://en.wikipedia.org/wiki/IBeacon) and [here](http://stackoverflow.com/questions/18906988/what-is-the-ibeacon-bluetooth-profile).

To create a native app, follow the [build instructions](http://evothings.com/doc/build/build-overview.html) in the Evothings Studio documentation.
-->
