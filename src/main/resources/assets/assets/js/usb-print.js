function printUSBJob()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        var usbPrintData = {};
        usbPrintData.printJobID = $(this).attr('job-id');
        usbPrintData.printJobPath = $(this).attr('job-path');
        promisePostCommandToRoot(selectedPrinter + "/remoteControl/printUSBJob",
                                 usbPrintData)
            .then(goToHomePage);
    }
}

function updateUSBPrintData(suitablePrintJobs)
{
    var currentPage =  getUrlParameter('p');
    if (currentPage == null)
        currentPage = 0;
    else
        currentPage = parseInt(currentPage);
    
    var jobsPerPage = 4;
    var startIndex = currentPage * jobsPerPage;

    for (var jobIndex = 0; jobIndex < jobsPerPage; jobIndex++)
    {
        var jobRow = "#job-row-" + (jobIndex + 1);
        var pjIndex = startIndex + jobIndex;
        if (pjIndex < suitablePrintJobs.length)
        {
            $(jobRow).removeClass('rbx-invisible')
                     .attr('job-id', suitablePrintJobs[pjIndex].printJobID)
                     .attr('job-path', suitablePrintJobs[pjIndex].printJobPath)
                     .off('click') // Remove all callbacks
                     .on('click', printUSBJob);
            $(jobRow + " .job-name").html(suitablePrintJobs[pjIndex].printJobName);
            $(jobRow + " .job-created").html(nbsp);
            $(jobRow + " .job-duration").html(secondsToHM(suitablePrintJobs[pjIndex].durationInSeconds));
            $(jobRow + " .job-profile").html(suitablePrintJobs[pjIndex].printProfileName);
        }
        else
        {
            $(jobRow).addClass('rbx-invisible')
                     .attr('job-id', "")
                     .attr('job-path', "")
                     .off('click');
            $(jobRow + " .job-name").html(nbsp);
            $(jobRow + " .job-created").html(nbsp);
            $(jobRow + " .job-duration").html(nbsp);
            $(jobRow + " .job-profile").html(nbsp);
        }
    }
    if (startIndex == 0)
        $('#previous-sub-button').addClass('disabled')
                                 .attr('href', '#');
    else
    {   
        $('#previous-sub-button').removeClass('disabled')
                                 .attr('href', reprintPage + '?p=' + (currentPage - 1));
    }
    if (startIndex + jobsPerPage >= suitablePrintJobs.length)
        $('#next-sub-button').addClass('disabled')
                             .attr('href', '#');
    else
        $('#next-sub-button').removeClass('disabled')
                             .attr('href', reprintPage + '?p=' + (currentPage + 1));

    var pageNumber = i18next.t('page-x-of-n');
    var nPages = Math.floor(suitablePrintJobs.length / jobsPerPage);
    if ((suitablePrintJobs.length % jobsPerPage) > 0 || nPages == 0)
        nPages++;

    pageNumber = pageNumber.replace('$1', currentPage + 1)
                           .replace('$2', nPages);
    $('#page-number').html(pageNumber);
}

function usbPrintInit()
{
    getUSBData();
}

function getUSBData() 
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        promisePostCommandToRoot(selectedPrinter + '/remoteControl/listUSBPrintableJobs', null)
                    .then(updateUSBPrintData)
                    .catch(function(error) { handleException(error, 'usb-print-init-error', true); });
    }
	else
		goToHomeOrPrinterSelectPage();
}