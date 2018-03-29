var serverHostName = window.location.hostname;
var serverPort = 8080;
var serverURL = 'http://' + serverHostName + ':' + serverPort;
var clientHostName = window.location.hostname
//var clientPort = 58974; // For the Bootstrap preview, it has to be edited to be the allocated preview port.
var clientPort = 8080; // In the release version, should be 8080 (same as server port).
var clientURL = 'http://' + clientHostName + ':' + clientPort;
//var imageRoot = ''; // For the Boostrap preview, it has to be empty.
var imageRoot = "assets/img/"; // In the release version, this should be assets/img/.

var isMobile = false;
var defaultUser = "root";
var applicationPINVar = "applicationPIN";
var selectedPrinterVar = "selectedPrinter";
var serverNameVar = "serverName";
var safetiesOnVar = "safetiesOn";
var printerTypeVar = "printerType";
var lastServerData = null;
var locationificator_initialised = false;
var currentPrinterData = null;
var selectedPrinterID = null;

// Pages
var accessPINPage = "/access-pin.html";
var loginPage = "/login.html";
var printerColourPage = "/printer-colour.html";
var printerNamePage = "/printer-name.html";
var printerStatusPage = "/printer-status.html";
var purgePage = "/purge.html";
var purgeStatus = "/job-progress.html?id=purge";
var homePage = "/home.html";
var cleanNozzleStatus = "/job-progress.html?id=clean-nozzle";
var ejectStuckStatus = "/job-progress.html?id=eject-stuck";
var testStatus = "/job-progress.html?id=test";
var levelGantryStatus = "/job-progress.html?id=level-gantry";
var removeHeadStatus = "/job-progress.html?id=remove-head";
var wirelessSettingsPage = "/wireless-settings.html";

// Menus
var axisTestingMenu = "/menu-horz.html?id=axis-testing";
var cleanNozzlesMenu = "/menu-horz.html?id=clean-nozzles";
var ejectStuckMenu = "/menu-horz.html?id=eject-stuck";
var identityMenu = "/menu-horz.html?id=identity";
var mainMenu = "/menu-grid.html?id=main";
var maintenanceMenu = "/menu-horz.html?id=maintenance";
var securitySettingsMenu = "/menu-horz.html?id=security-settings";
var settingsMenu = "/menu-horz.html?id=settings";

var machineDetailsMap = 
{
	'RBX01': {'model':'robox',
              'icon-background-light':'Logo-Robox-White-20pc.svg',
              'icon-background-dark':'Logo-Robox-Black-20pc.svg',
              'icon-highlight-dark':'Logo-Robox-Black.svg',
              'icon-highlight-light':'Logo-Robox-White.svg',
              'icon-class':'rbx01-image',
              'icon-normal-light':'Logo-Robox-White-50pc.svg',
              'icon-normal-dark':'Logo-Robox-Black-50pc.svg',
              'logo':'Logo-RBX01.svg'},
	'RBX10': {'model':'robox-pro',
              'icon-background-dark':'Logo-RoboxPro-Black-20pc.svg',
              'icon-background-light':'Logo-RoboxPro-White-20pc.svg',
              'icon-highlight-light':'Logo-RoboxPro-White.svg',
              'icon-highlight-dark':'Logo-RoboxPro-Black.svg',
              'icon-class':'rbx10-image',
              'icon-normal-dark':'Logo-RoboxPro-Black-50pc.svg',
              'icon-normal-light':'Logo-RoboxPro-White-50pc.svg',
              'logo':'Logo-RoboxPro.svg'}
};

var materialColor1 = '#009ee3';
var materialColor2 = '#eb672a';
