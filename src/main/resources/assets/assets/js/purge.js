function initiatePurge()
{
    var targetData = {'targetTemperature':[-1, -1],
                      'lastTemperature':[-1, -1],
                      'newTemperature':[-1, -1],
                      'safetyOn':safetiesOn()};
    if ($('#nozzle-1 .rbx-checkbox:visible').is(':checked'))
    {
        targetData['lastTemperature'][0] = $('#nozzle-1 .last-temp').text();
        targetData['newTemperature'][0] = $('#nozzle-1 .new-temp').text();
        targetData['targetTemperature'][0] = $('#nozzle-1 .purge-temp').val();
    }
    if ($('#nozzle-2 .rbx-checkbox:visible').is(':checked'))
    {
        targetData['lastTemperature'][1] = $('#nozzle-2 .last-temp').text();
        targetData['newTemperature'][1] = $('#nozzle-2 .new-temp').text();
        targetData['targetTemperature'][1] = $('#nozzle-2 .purge-temp').val();
    }

    promisePostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/purgeToTarget", targetData);
    goToPage(purgeStatus);
}

function setPurgeButtonState()
{
    var enabled = false;
    $('.rbx-checkbox:visible').each(function() { if ($(this).is(':checked')) enabled = true; });
    if (enabled)
        $('#right-button').removeClass('disabled'); 
    else
        $('#right-button').addClass('disabled');
}

function switchPanelState()
{
    var checkbox = $(this);
    var state = checkbox.is(':checked');
    var panel = checkbox.closest('.rbx-panel');
    panelId = panel.attr('id');
    setPanelState(panelId, state);
    setPurgeButtonState();
}

function setPanelState(panelId, state)
{
    var materialColor = null;
    var textColor = null;
    if (state)
    {
        textColor = 'white';
        if (panelId == 'nozzle-1')
            materialColor = materialColor1;
        else // nozzle-2
            materialColor = materialColor2;
    }
    else
    {
        textColor = 'grey';
        materialColor = 'grey';
    }
    
    $('#' + panelId).css('color', textColor)
    $('#' + panelId + ' .rbx-purge-mat').css('color', materialColor)
}

function updatePanelTemp(panelId, field, value)
{
    if (value == null || value < 0)
        $('#' + panelId + ' .' + field).html('-');
    else
        $('#' + panelId + ' .' + field).html(value.toFixed(0));
 }

function updatePanelDescription(panelId, field, value)
{
    if (value == null || value.length == 0)
        $('#' + panelId + ' .' + field).html(nbsp);
    else
        $('#' + panelId + ' .' + field).html(value);
 }

function updatePanelHeadData(panelId, state, lastTemp)
{
    setPanelState(panelId, state);
    updatePanelTemp(panelId, 'last-temp', lastTemp);
 }

function updatePanelMaterialData(panelId, newTemp, description)
{
    updatePanelTemp(panelId, 'new-temp', newTemp);
    updatePanelDescription(panelId, 'material-description', description);
} 

function completePanelUpdate(panelId, showPanel, lastTemp, newTemp)
{
    var panel = '#' + panelId;
    if (showPanel)
    {
        var t = newTemp;
        if (lastTemp > 0)
            t = 0.5 * (lastTemp + newTemp);
        $(panel).removeClass('rbx-hidden');
        $('#' + panelId + ' .purge-temp').val(t.toFixed(0));
    }
    else
        $(panel).addClass('rbx-hidden');
} 

function updatePurgeHeadData(headData)
{
    $('#nozzle-1-check').prop('checked', true);
    updatePanelHeadData('nozzle-1', true, headData.nozzle0LastFTemp);
    if (headData.nozzleCount > 1)
    {
        $('#nozzle-2').removeClass('rbx-invisible');
        $('#nozzle-2-check').prop('checked', true);
        updatePanelHeadData('nozzle-2', true, headData.nozzle1LastFTemp);
    }
    else
    {
        $('#nozzle-2').addClass('rbx-invisible');
        updatePanelHeadData('nozzle-2', false, 0);
    }
    return headData;
}

function updatePurgeMaterialData(materialData)
{
    console.log('updatePurgeMaterialData');
    if (materialData.attachedFilamentNames.length > 0)
        updatePanelMaterialData('nozzle-1', materialData.attachedFilamentTemp[0], materialData.attachedFilamentNames[0]);
    else
        updatePanelMaterialData('nozzle-1', null, null);
    if (materialData.attachedFilamentNames.length > 1)
        updatePanelMaterialData('nozzle-2', materialData.attachedFilamentTemp[1], materialData.attachedFilamentNames[1]);
    else
        updatePanelMaterialData('nozzle-2', null, null);
    return materialData;
}

function completePurgeUpdate(purgeData)
{
    console.log('completePurgeUpdate');
    
     var showPanel1 = (purgeData[1].materialLoaded.length > 0 &&
        purgeData[1].materialLoaded[0] &&
        purgeData[1].canEjectFilament.length > 0 &&
        purgeData[1].canEjectFilament[0]);
        
    var showPanel2 = (purgeData[1].materialLoaded.length > 1 &&
        purgeData[1].materialLoaded[1] &&
        purgeData[1].canEjectFilament.length > 1 &&
        purgeData[1].canEjectFilament[1]);

    if (showPanel1 || showPanel2)
    {
        $('.purge-description').html(i18next.t('purge-instructions'));
        completePanelUpdate('nozzle-1', showPanel1, purgeData[0].nozzle0LastFTemp, purgeData[1].attachedFilamentTemp[0]);
        completePanelUpdate('nozzle-2', showPanel2, purgeData[0].nozzle1LastFTemp, purgeData[1].attachedFilamentTemp[1]);
        setPurgeButtonState();
    }
    else
    {
        $('.purge-description').html(i18next.t('purge-not-possible'));
        goToMainMenu;
    }
}

function purgeInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        $('.rbx-spinner').on('click', onSpinnerClick);
        $('#nozzle-1-check').on('click', switchPanelState);
        $('#nozzle-2-check').on('click', switchPanelState);
        $('#right-button').on('click', initiatePurge);
        // If we came here straight from the main menu, don't show the back button.
        var urlParams = new URLSearchParams(window.location.search);
        var from = urlParams.get('from');
        if (from != null && from == 'maintenance')
            $('#left-button').removeClass('rbx-invisible');
        else        
            $('#left-button').addClass('rbx-invisible');
        
        var ph = promiseGetCommandToRoot(selectedPrinter + '/remoteControl/headEEPROM', null)
                    .then(updatePurgeHeadData);
        
        var pm = promiseGetCommandToRoot(selectedPrinter + '/remoteControl/materialStatus', null)
                    .then(updatePurgeMaterialData);

        Promise.all([ph, pm])
               .then(completePurgeUpdate)
               .catch(goToMainMenu);
    }
	else
		goToPrinterStatusPage();
}
