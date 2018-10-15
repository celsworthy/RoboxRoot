var lastWifiData = null;

function setWiFiState()
{
    // Disable save button to show something is happening.
    $('#right-button').addClass('disabled'); 
    var p = ($('#wifi-on').prop('checked') ? promiseSetWiFiCredentials : promiseEnableDisableWiFi);
	p().catch(function(data) { alert(i18next.t('wifi-set-error')); return data; })
        .then(getWifiState);
}

function promiseEnableDisableWiFi()
{
    return promisePostCommandToRoot('admin/enableDisableWifi', $('#wifi-on').prop('checked'));
}

function promiseSetWiFiCredentials()
{
    return promisePostCommandToRoot('admin/setWiFiCredentials',
                                    $('#wifi-ssid').val() + ":" + $("#wifi-password").val());
}

function promiseWifiState()
{
    return promisePostCommandToRoot('admin/getCurrentWifiState', null);
}

function updateWifiState(data)
{
    if (lastWifiData === null
            || data.poweredOn !== lastWifiData.poweredOn
            || data.associated !== lastWifiData.associated
            || data.ssid !== lastWifiData.ssid)
    {
        var ssid = '';
        if (data.poweredOn === true)
        {
            $('#wifi-on').prop('checked', true);
            if (data.associated === true)
                ssid = data.ssid;
        }
        else
        {
            $('#wifi-off').prop('checked', true);
        }
        $('#wifi-ssid').val(ssid);

        lastWifiData = data;
    }
    $('#wifi-password').val('');
    $('#right-button').removeClass('disabled');
    return data;
}

function getWifiState()
{
    return promiseWifiState()
            .then(updateWifiState)
            .then(function(data)
                  {
                      return data;
                  })
            .catch(function()
                   { 
                       alert(i18next.t('wifi-get-error'));
                       $('#wifi-ssid').val('');
                       $('#wifi-password').val('');        
                       $('#right-button').addClass('disabled'); 
                       return false;
                   });
}

function setWifiOn()
{
    $('#wifi-on').prop('checked', true);
}

function wirelessSettingsInit()
{
    $('#wifi-ssid').on('change', setWifiOn);
    $('#wifi-password').on('change', setWifiOn);
    $('#left-button').on('click', goToPreviousPage);
    setHomeButton();
    $('#right-button').on('click', setWiFiState);
    getWifiState();
}