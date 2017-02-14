var connectedToServer = false;
var isMobile = false; //initiate as false

function updatePIN()
{
    sendPostCommandToRoot('admin/updatePIN',
            function () {
                logout();
            },
            null,
            $("#pin-update-value").val());
}
function rootRename()
{
    sendPostCommandToRoot('admin/setServerName',
            function () {
                getServerStatus();
            },
            null,
            $("#server-name-input").val());
}

function rootUpgrade()
{
    var formData = new FormData($('#rootUpgrade')[0]);
    submitFormToRoot('admin/updateSystem',
            function (returndata) {
                alert('success ' + returndata);
            },
            function (returndata) {
                alert('error ' + returndata);
            },
            formData);
//    event.preventDefault();
}

function updateServerStatus(serverData)
{
    if (serverData === null)
    {
        $('#serverVersion').text("");
        $(".serverStatusLine").text("");
        $(".server-name-title").text("");
        $("#server-name-input").val("");
        $(".server-ip-address").val("");
    } else
    {
        $('#serverVersion').text(serverData.serverVersion);
        $(".serverStatusLine").text(serverData.name);
        $(".server-name-title").text(serverData.name);
        $("#server-name-input").val(serverData.name);
        $(".server-ip-address").text(serverData.serverIP);
    }
}

function getServerStatus()
{
    sendGetCommandToRoot('discovery/whoareyou',
            function (data) {
                $('#serverOnline').text(i18next.t('online'));
                updateServerStatus(data);
                connectedToServer = true;
            },
            function (data) {
                connectedToServer = false;
                $('#serverOnline').text(i18next.t('offline'));
                removeAllPrinterTabs();
                updateServerStatus(null);
            },
            null);
}

function getStatus()
{
    if (!connectedToServer)
    {
        getServerStatus();
    } else
    {
        getPrinters();
    }
}

function safetiesOn()
{
    var safetyStatus = $("#safeties-switch").prop("checked") ? true : false;
    return safetyStatus;
}

function enableWifi(state)
{
    sendPostCommandToRoot("admin/enableDisableWifi", null, null, state);
}

function setWiFiCredentials()
{
    sendPostCommandToRoot("admin/setWiFiCredentials", null, null, $("#wifi-ssid").val() + ":" + $("#wifi-password").val());
}

function updateCurrentWifiState()
{
    sendPostCommandToRoot("admin/getCurrentWifiState",
            function (data) {
                if (data.poweredOn === true)
                {
                    $("#wifi-enabled-switch").val("true")
                    $("#wifi-data-block").removeClass("visuallyhidden");
                    if (data.associated === true)
                    {
                        $("#wifi-ssid").val(data.ssid);
                    } else
                    {
                        $("#wifi-ssid").val("Not associated");
                    }
                } else
                {
                    $("#wifi-enabled-switch").val("false")
                    $("#wifi-ssid").val("");
                    $("#wifi-data-block").addClass("visuallyhidden");
                }
            },
            null,
            null);
}

function page_initialiser()
{
    createHeader("admin");
    createFooter();

    $("#wifi-enabled-switch").change(function () {
        enableWifi($("#wifi-enabled-switch").val());
        setTimeout(function () {
            updateCurrentWifiState();
        }, 3000);
    });
    
    $("#pin-update-value").val(localStorage.getItem(applicationPINVar));
    $('#printerTabs').tabs({
        active: 1
    });
}