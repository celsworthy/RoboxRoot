var connectedToServer = false;
var isMobile = false; //initiate as false
var lastServerData = null;
var lastWifiData = null;
var suppressWifiToggleAction = false;

function id2Index(tabsId, srcId)
{
    var index = -1;
    var i = 0, tbH = $(tabsId).find("li a");
    var lntb = tbH.length;
    if (lntb > 0) {
        for (i = 0; i < lntb; i++) {
            o = tbH[i];
            if (o.href.search(srcId) > 0) {
                index = i;
            }
        }
    }
    return index;
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
                updateServerStatus(null);
            },
            null);
}

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
    } else if (lastServerData == null
            || serverData.name !== lastServerData.name
            || serverData.serverIP !== lastServerData.serverIP
            || serverData.serverVersion !== lastServerData.serverVersion)
    {
        $('#serverVersion').text(serverData.serverVersion);
        $(".serverStatusLine").text(serverData.name);
        $(".server-name-title").text(serverData.name);
        $("#server-name-input").val(serverData.name);
        $(".server-ip-address").text(serverData.serverIP);
        lastServerData = serverData;
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
                updateServerStatus(null);
            },
            null);
}

function getStatus()
{
    getServerStatus();
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
                suppressWifiToggleAction = true;
                var allOff = true;

                if (lastWifiData === null
                        || data.poweredOn !== lastWifiData.poweredOn
                        || data.associated !== lastWifiData.associated
                        || data.ssid !== lastWifiData.ssid)
                {
                    if (data.poweredOn === true)
                    {
                        $("#wifi-enabled-switch").bootstrapToggle('on');
                        $("#wifi-data-block").removeClass("visuallyhidden");
                        if (data.associated === true)
                        {
                            $("#wifi-associated-tick").removeClass('visuallyhidden');
                            $("#wifi-ssid").val(data.ssid);
                        } else
                        {
                            $("#wifi-associated-tick").addClass('visuallyhidden');
                            $("#wifi-ssid").val("Not associated");
                        }
                        allOff = false;
                    }

                    lastWifiData = data;

                    if (allOff === true)
                    {
                        $("#wifi-enabled-switch").bootstrapToggle('off');
                        $("#wifi-ssid").val("");
                        $("#wifi-data-block").addClass("visuallyhidden");
                    }
                }

                suppressWifiToggleAction = false;
            },
            null,
            null);
}

function page_initialiser()
{
    $('.numberOfPrintersDisplay').text(i18next.t('admin'));
    updateCurrentWifiState();

    $("#wifi-enabled-switch").change(function () {
        if (suppressWifiToggleAction === false)
        {
            enableWifi($("#wifi-enabled-switch").prop('checked'));
        }

        if ($("#wifi-enabled-switch").prop('checked') === false)
        {
            $("#wifi-ssid-group").addClass("visuallyhidden");
            $("#wifi-password-group").addClass("visuallyhidden");
            $("#wifi-update-button").addClass("visuallyhidden");
        }
        else
        {
            $("#wifi-ssid-group").removeClass("visuallyhidden");
            $("#wifi-password-group").removeClass("visuallyhidden");
            $("#wifi-update-button").removeClass("visuallyhidden");
        }
    });

    $("#pin-update-value").val(localStorage.getItem(applicationPINVar));

    $("#safeties-switch").bootstrapToggle(localStorage.getItem(safetiesOnVar));

    $("#safeties-switch").change(function () {
        var safetyStatus = $(this).prop("checked") ? 'on' : 'off';
        localStorage.setItem(safetiesOnVar, safetyStatus);
    });

    getServerStatus();
    setInterval(getStatus, 2000);
    setInterval(function () {
        updateCurrentWifiState();
    }, 3000);
}