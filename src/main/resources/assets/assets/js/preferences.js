var prefDebounceFlag = true;
var colourSelectorName = "#colour-selector";

function setupPreferencesPage()
{
    $(colourSelectorName).colorselector();
    getStatusData(null, '/nameStatus', updatePrefStatus);
}

function updatePrefStatus(nameData)
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
        sendPostCommandToRoot(selectedPrinter + "/remoteControl/renamePrinter", null, null, newName);
        getStatusData(selectedPrinter, '/nameStatus', updatePrefStatus);
    }
}

function changePrinterColour()
{
    if (!prefDebounceFlag)
    {
        prefDebounceFlag = true;
        var newColour = $(colourSelectorName).find(":selected").data('color');
        var selectedPrinter = localStorage.getItem(selectedPrinterVar);
        sendPostCommandToRoot(selectedPrinter + "/remoteControl/changePrinterColour", null, null, newColour);
        getStatusData(selectedPrinter, '/nameStatus', updatePrefStatus);
    }
}