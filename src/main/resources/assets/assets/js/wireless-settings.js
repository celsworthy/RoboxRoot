var lastWifiData = null;

function setWiFiState()
{
    promisePostCommandToRoot('admin/enableDisableWifi', $('#wifi-on').prop('checked'))
        .then(promiseWiFiCredentials)
        .then(function(data) { alert(i18next.t('wifi-set-ok')); return data; })
        .catch(function(data) { alert(i18next.t('wifi-set-error')); return data; })
        .then(getWifiState);
}

function promiseWiFiCredentials()
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
    
    return data;
}

function getWifiState()
{
    return promiseWifiState()
            .then(updateWifiState)
            .then(function(data)
                  {
                      console.log('Updated Wifi data');
                      $('#right-button').removeClass('disabled');
                      return data;
                  })
            .catch(function()
                   { 
                       alert(i18next.t('wifi-get-error')); 
                       $('#right-button').addClass('disabled'); 
                       return false;
                   });
}

function wirelessSettingsInit()
{
    $('#left-button').on('click', goToPreviousPage);
    setHomeButton();
    $('#right-button').on('click', setWiFiState);
    getWifiState();
}