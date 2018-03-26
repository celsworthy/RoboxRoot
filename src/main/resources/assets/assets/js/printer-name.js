function savePrinterName()
{
    var newName = $('#pname-input').val();
    promisePostCommandToRoot(localStorage.getItem(selectedPrinterVar) + '/remoteControl/renamePrinter', newName); 
}

function updatePrinterName(nameData)
{
    $('#pname-input').val(nameData.printerName);
    $('#right-button').on('click', savePrinterName)
                      .removeClass('disabled')
}

function printerNameInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        promiseGetCommandToRoot(selectedPrinter + '/remoteControl/nameStatus', null)
            .then(updatePrinterName)
            .catch(goToPrinterStatusPage);
    }
	else
		goToPrinterStatusPage();
}
