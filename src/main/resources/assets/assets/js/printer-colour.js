var colourArray =  ['#7F0000',
                    '#FF0000',
                    '#FF7F7F',
                    '#FF00FF',
                    '#FFFF00',
                    '#FF7F00',
                    '#007F00',
                    '#00FF00',
                    '#7FFF7F',
                    '#7FFF00',
                    '#00FF96',
                    '#7F7F7F',
                    '#00007F',
                    '#0000FF',
                    '#00FFFF'];

function selectButton(button)
{
    
    var compIcon = getComplimentaryOption($(button).css('background-color'), 'Icon-Tick-Black.svg', 'Icon-Tick-White.svg');
    
    $(button).css('border-style', 'groove')
             .html('<img id="selected-colour" src="' + imageRoot + compIcon + '" class="rbx-colour-button">');
}

function savePrinterColour()
{
    var selectedColour = $('#selected-colour').closest('.btn.rbx-colour-button')
                                              .css('background-color');
    promisePostCommandToRoot(localStorage.getItem(selectedPrinterVar) + "/remoteControl/changePrinterColour", selectedColour);
    //goToPage('home.html');
}

function onColourClicked()
{
    // Deselect the current button.
    $('#selected-colour').closest('.btn.rbx-colour-button')
                         .css('border-style', 'none')
                         .html('');
    selectButton(this);
}

function updatePrinterColours(nameData)
{
    var printerColour = nameData.printerWebColourString;
    $('#colour-norm').css('background-color', printerColour);
    printerColour = $('#colour-norm').css('background-color').toUpperCase();
    $('.rbx-colour-button').each(function(index, element )
                                {
                                    var buttonColour = $(element).css('background-color').toUpperCase();
                                    if (printerColour == buttonColour)
                                    {
                                        selectButton(element);
                                    }
                                });
    if ($('#selected-colour').length == 0)
    {
        // Select the custom colour button and set the colour to the 
        // printer colour.
        $('#custom-colour').css('background-color', printerColour)
        selectButton('#custom-colour');        
    }
    
    $('#right-button').removeClass('disabled')
}

function printerColourInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        $('.rbx-colour-button').each(function(index, element )
                                    {
                                        $(element).css('background-color', colourArray[index])
                                                  .on('click', onColourClicked);
                                    });
        $('#right-button').on('click', savePrinterColour);
        promiseGetCommandToRoot(selectedPrinter + '/remoteControl/nameStatus', null)
            .then(updatePrinterColours)
            .catch(goToPrinterStatusPage);
	}
	else
		goToPrinterStatusPage();
}
