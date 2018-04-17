function saveServerName()
{
    var newName = $('#sname-input').val();
    promisePostCommandToRoot('admin/setServerName', newName)
        .then(goToPage(serverSettingsMenu))
        .catch(goToHomeOrPrinterSelectPage);
}

function updateServerName(serverData)
{
    $('#sname-input').val(serverData.name);
    $('#right-button').removeClass('disabled')
}

function serverNameInit()
{
    $('#right-button').on('click', saveServerName);
    promiseGetCommandToRoot('discovery/whoareyou', null)
        .then(updateServerName)
        .catch(goToHomeOrPrinterSelectPage);
}
