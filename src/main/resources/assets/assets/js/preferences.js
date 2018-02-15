var prefDebounceFlag = true;
var colourSelectorName = "#colour-selector";

function setupPreferencesPage()
{
    $(colourSelectorName).colorselector();
    getPreferencesStatus();
}

function getPreferencesStatus()
{
    getStatusData(null, '/nameStatus', updatePreferencesStatus);
}

function updatePreferencesStatus(nameData)
{
    $('#printer-name-input').val(nameData.printerName);
    $(colourSelectorName).colorselector('setColor', nameData.printerWebColourString);
    prefDebounceFlag = false;
}

function renamePrinter()
{
    if (!prefDebounceFlag)
    {
        prefDebounceFlag = true;
        var newName = $('#printer-name-input').val();
        var selectedPrinter = localStorage.getItem(selectedPrinterVar);
        sendPostCommandToRoot(selectedPrinter + "/remoteControl/renamePrinter",
                              getPreferencesStatus,
                              null,
                              newName);
        
    }
}

function changePrinterColour()
{
    if (!prefDebounceFlag)
    {
        prefDebounceFlag = true;
        var newColour = $(colourSelectorName).find(":selected").data('color');
        var selectedPrinter = localStorage.getItem(selectedPrinterVar);
        sendPostCommandToRoot(selectedPrinter + "/remoteControl/changePrinterColour", getPreferencesStatus, null, newColour);
    }
}