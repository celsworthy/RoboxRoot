function updateAboutVersion(data)
{
    $('.software-version').text(data.serverVersion);
}

function clearAboutVersion(data)
{
    $('.software-version').text("---");
}

function aboutInit()
{
    var urlParams = new URLSearchParams(window.location.search);
    $('#left-button').on('click', goToPreviousPage);
    setHomeButton();
    promiseGetCommandToRoot('discovery/whoareyou', null)
            .then(updateAboutVersion)
            .catch(clearAboutVersion);
}