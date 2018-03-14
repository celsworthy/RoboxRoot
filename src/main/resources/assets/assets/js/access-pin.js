function savePIN()
{
 sendPostCommandToRoot('admin/updatePIN',
            function () {
                alert('Succesfully updated PIN');
                logout();
            },
            function() { alert('Failed to set PIN'); },
            null,
            $('#pin-1').val());
}

function filterText(event)
{
	if (event.ctrlKey || event.altKey)
		return;
	if (event.type=='keypress')
	{
		var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;

		// 8 = backspace, 9 = tab, 13 = enter, 35 = end, 36 = home, 37 = left, 39 = right, 46 = delete
		if (key == 8 || key == 9 || key == 13 || key == 35 || key == 36|| key == 37 || key == 39 || key == 46) 
		{

			// if charCode = key & keyCode = 0
			// 35 = #, 36 = $, 37 = %, 39 = ', 46 = .

			if (event.charCode == 0 && event.keyCode == key)
			{
				return true;                                             
			}
		}
		
		var s = String.fromCharCode(key);
		if (s.match(/\d/) && $(this).val().length < 4)
            return;
	}
	return false;
}

function validatePIN()
{
    var pin1 = $('#pin-1').val();
    var pin2 = $('#pin-2').val();
    if (pin1 == pin2 && pin1.match(/\d\d\d\d/))
        $('#right-button').removeClass('disabled');
    else
        $('#right-button').addClass('disabled');
}

function accessPINInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        $('#right-button').on('click', savePIN);
        $('.rbx-field').on('change keydown keyup', validatePIN)
                       .on('keypress paste', filterText);
	}
	else
		goToPrinterStatusPage();
}
