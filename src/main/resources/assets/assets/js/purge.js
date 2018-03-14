function initiatePurge()
{
}

function switchPanelState()
{
    var checkbox = $(this);
    var state = checkbox.is(':checked');
    var panel = checkbox.closest('.rbx-panel');
    panelId = panel.attr('id');
    setPanelState(panelId, state);
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

function updatePanelHeadData(panelId, state, lastTemp)
{
    setPanelState(panelId, state);
    if (state)
    {
        if (lastTemp < 0)
            $('#' + panelId + ' .last-temp').html('-');
        else
            $('#' + panelId + ' .last-temp').html(lastTemp.toFixed(0));
    }
    else
    {
        $('#' + panelId + ' .last-temp').html(nbsp);
    }
 }

function updatePanelMaterialData(panelId, newTemp, purgeTemp)
{
    $('#' + panelId + ' .new-temp').html(nbsp);
    $('#' + panelId + ' .last-temp').val(nbsp);
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
}

function purgeInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        $('.rbx-spinner').on('click', onSpinnerClick);
        $('#nozzle-1-check').on('click', switchPanelState);
        $('#nozzle-2-check').on('click', switchPanelState);
        $('#right-button').on('click', initiatePurge);
        sendGetCommandToRoot(selectedPrinter + '/remoteControl/headEEPROM',
                             updatePurgeHeadData,
                             goToPrinterStatusPage,
                             null);
	}
	else
		goToPrinterStatusPage();
}
