var jobProgressDetailsMap = 
{
	'clean-nozzle-1': {'title-text': 'clean-nozzle-title-1',
                      'description-text': 'clean-nozzle-description',
                      'image': 'Icon-Menu-Clean-White.svg',
				      'right-button': {'icon':'Icon-Cancel.svg',
					                   'action':cancelAction}},
	'clean-nozzle-2': {'title-text': 'clean-nozzle-title-2',
                      'description-text': 'clean-nozzle-description',
                      'image': 'Icon-Menu-Clean-White.svg',
				      'right-button': {'icon':'Button-Cancel-White.svg',
					                   'action':cancelAction}},
	'eject-stuck-1': {'title-text': 'eject-stuck-title-1',
                      'description-text': 'eject-stuck-description',
                      'image': 'Icon-Menu-Eject-White.svg',
				      'right-button': {'icon':'Button-Cancel-White.svg',
					                   'action':cancelAction}},
	'eject-stuck-2': {'title-text': 'eject-stuck-title-2',
                      'description-text': 'eject-stuck-description',
                      'image': 'Icon-Menu-Eject-White.svg',
				      'right-button': {'icon':'Button-Cancel-White.svg',
					                   'action':cancelAction}},
	'remove-head': {'title-text': 'remove-head-title',
                    'description-text': 'remove-head-description',
                    'image': 'Icon-Menu-Remove-White.svg',
		            'right-button': {'icon':'Button-Cancel-White.svg',
					                 'action':cancelAction}},
	'purge': {'title-text': 'purge-title',
              'description-text': 'purge-description',
              'image': 'Icon-Menu-Purge-White.svg',
		      'right-button': {'icon':'Button-Cancel-White.svg',
			                   'action':cancelAction}},
	'test': {'title-text': 'test-title',
             'description-text': 'test-description',
             'image': 'Icon-Menu-Test-White.svg',
			 'right-button': {'icon':'Button-Cancel-White.svg',
	                          'action':cancelAction}},
	'level-gantry': {'title-text': 'level-gantry-title',
                     'description-text': 'level-gantry-description',
                     'image': 'Icon-Menu-Level-White.svg',
		             'right-button': {'icon':'Button-Cancel-White.svg',
	                                  'action':cancelAction}}
};

// The printer remains in idle state for a while before switching to
// the Running Macro state. So we allow up to maxIdleCount occurances
// of the idle state before it returns to the menu page.
var idleCount = 0;
var maxIdleCount = 5;

function jobProgressInit()
{
    var jpDetails = null;
    var urlParams = new URLSearchParams(window.location.search);
    var jpId = urlParams.get('id');
    if (jpId != null)
        jpDetails = jobProgressDetailsMap[jpId];
    if (jpDetails != null)
    {
        setMachineLogo();
        setTextFromField(jpDetails, 'title-text');
        setTextFromField(jpDetails, 'description-text');
        setImageFromField(jpDetails, 'image');
        setFooterButton(jpDetails, 'left-button')
        setFooterButton(jpDetails, 'right-button')
        startJobStatusUpdates();
        startActiveErrorHandling();
    }
    else
        goToPage(mainMenu);
}

function updateJobStatusFields(statusField, etcField, progressBar, printJobData)
{
    var statusText = "";
    switch(printJobData.printerStatusEnumValue)
    {
        case "PRINTING_PROJECT":
        case "RESUME_PENDING":
        case "RUNNING_MACRO_FILE":
            statusText='<img src="' + imageRoot + 'Icon-Play.svg" class="print-status-icon">';
            break;
        case "PAUSED":
        case "PAUSE_PENDING":
            statusText='<img src="' + imageRoot + 'Icon-Pause.svg" class="print-status-icon">';
            break;
        case "IDLE":
            statusText='<img src="' + imageRoot + 'Icon-Ready.svg" class="print-status-icon">';
            break;

        // These are all the states of which I am aware.
        case "LOADING_FILAMENT_D":
        case "LOADING_FILAMENT_E":
        case "UNLOADING_FILAMENT_D":
        case "UNLOADING_FILAMENT_E":
        case "CALIBRATING_NOZZLE_ALIGNMENT":
        case "CALIBRATING_NOZZLE_HEIGHT":
        case "CALIBRATING_NOZZLE_OPENING":
        case "OPENING_DOOR":
        case "PURGING_HEAD":
        case "REMOVING_HEAD":
        default:
            break;
    }
    statusText = statusText + printJobData.printerStatusString;
    $(statusField).html(statusText);    
    
    if ((printJobData.printerStatusEnumValue.match("^PRINTING_PROJECT")
            || printJobData.printerStatusEnumValue.match("^RUNNING_MACRO")
            || printJobData.printerStatusEnumValue.match("^PAUSED")
            || printJobData.printerStatusEnumValue.match("^PAUSE_PENDING")
            || printJobData.printerStatusEnumValue.match("^RESUME_PENDING"))
            && printJobData.totalDurationSeconds >= 0
            && printJobData.etcSeconds > 0)
    {
        $(etcField).html(secondsToHM(printJobData.etcSeconds))
                   .closest('div')
                   .removeClass('rbx-hidden');

        var timeElapsed = printJobData.totalDurationSeconds - printJobData.etcSeconds;
        if (timeElapsed < 0)
        {
            timeElapsed = 0;
        }
        if (timeElapsed <= 0 || printJobData.totalDurationSeconds <= 0)
        {
            $(progressBar + " .progress-bar").width("0%").html("");
        }
        else
        {
            var progressPercent = Math.round((100 * timeElapsed / printJobData.totalDurationSeconds)) + "%";
            $(progressBar + " .progress-bar").width(progressPercent).html("");
        }
        $(progressBar).closest('.row')
                      .removeClass('rbx-hidden');
    }
    else
    {
        $(etcField).html("&nbsp;")
                   .closest('div')
                   .addClass('rbx-hidden');
        $(progressBar + " .progress-bar").width("0%")
                                         .html("")
                                         .closest('.row')
                                         .addClass('rbx-hidden');
    }
}

function updateJobStatus(printJobData)
{
    console.log('updateJobStatus - printerStatus = ' + printJobData.printerStatusEnumValue);
    if (printJobData.printerStatusEnumValue !== "IDLE")
    {
        idleCount = maxIdleCount;
        updateJobStatusFields('#status-text', '#etc-text', '#progress-bar', printJobData)
    }
    else
    {
        if (++idleCount > maxIdleCount)
            goToPage(mainMenu);
    }
}

function getJobStatus()
{
    getStatusData(null, '/printJobStatus', updateJobStatus)
}
    
function startJobStatusUpdates()
{
	var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
		setInterval(getJobStatus, 500);
    }
}
