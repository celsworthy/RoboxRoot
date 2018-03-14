var serverHostName = window.location.hostname;
var serverPort = 8080;
var serverURL = 'http://' + serverHostName + ':' + serverPort;
var clientHostName = window.location.hostname
//var clientPort = 49905; // For the Bootstrap preview, it has to be edited to be the allocated preview port.
var clientPort = 8080; // In the release version, should be 8080 (same as server port).
var clientURL = 'http://' + clientHostName + ':' + clientPort;
//var imageRoot = ""; // For the Boostrap preview, it has to be empty.
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
var printerStatusPage = "/printerStatus.html";
var purgePage = "/purge.html";
var homePage = "/home.html";
var cleanNozzleStatus = "/job-progress.html?clean-nozzle";
var ejectStuckStatus = "/job-progress.html?eject-stuck";
var testStatus = "/job-progress.html?test";
var levelGantryStatus = "/job-progress.html?level-gantry";
var removeHeadingStatus = "/job-progress.html?remove-head";

// Menus
var axisTestingMenu = "/menu-horz.html?axis-testing";
var cleanNozzlesMenu = "/menu-horz.html?clean-nozzles";
var ejectStuckMenu = "/menu-horz.html?eject-stuck";
var identityMenu = "/menu-horz.html?identity";
var mainMenu = "/menu-grid.html?main";
var maintenanceMenu = "/menu-horz.html?maintenance";
var settingsMenu = "/menu-horz.html?settings";

var machineDetailsMap = 
{
	'RBX01': {'model':'robox',
              'icon':'rbx01-image',
              'idle-icon':'Logo-Robox-White-20pc.svg',
              'logo':'Logo-RBX01.svg'},
	'RBX10': {'model':'robox-pro',
              'icon':'rbx10-image',
              'idle-icon':'Logo-RoboxPro-White-20pc.svg',
              'logo':'Logo-RoboxPro.svg'}
};

var materialColor1 = '#009ee3';
var materialColor2 = '#eb672a';
