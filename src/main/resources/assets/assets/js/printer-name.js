function savePrinterName()
{
    var newName = $('#pname-input').val();
    sendPostCommandToRoot(localStorage.getItem(selectedPrinterVar) + '/remoteControl/renamePrinter', null, null, newName); 
    //goToPage('home.html');
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
        sendGetCommandToRoot(selectedPrinter + '/remoteControl/nameStatus',
                             updatePrinterName,
                             goToPrinterStatusPage,
                             null);
	}
	else
		goToPrinterStatusPage();
}
