function reprintJob()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        var printJobID = $(this).attr('job-id');
        promisePostCommandToRoot(selectedPrinter + "/remoteControl/reprintJob",
                                 printJobID);
    }
}

function updateReprintData(suitablePrintJobs)
{
    var urlParams = new URLSearchParams(window.location.search);
    var startPage = urlParams.get('p');
    if (startPage == null)
        startPage = 0;
    var jobsPerPage = 4;
    var startIndex = startPage * jobsPerPage;

    for (var jobIndex = 0; jobIndex < jobsPerPage; jobIndex++)
    {
        var jobRow = "#job-row-" + (jobIndex + 1);
        var pjIndex = startIndex + jobIndex;
        if (pjIndex < suitablePrintJobs.length)
        {
            $(jobRow).removeClass('rbx-invisible')
                     .attr('job-id', suitablePrintJobs[pjIndex].printJobID)
                     .off('click') // Remove all callbacks
                     .on('click', reprintJob);
            $(jobRow + " .job-name").html(suitablePrintJobs[pjIndex].printJobName);
            $(jobRow + " .job-created").html(nbsp);
            $(jobRow + " .job-duration").html(secondsToHM(suitablePrintJobs[pjIndex].durationInSeconds));
            $(jobRow + " .job-profile").html(suitablePrintJobs[pjIndex].printProfileName);
        }
        else
        {
            $(jobRow).addClass('rbx-invisible')
                     .attr('job-id', "")
                     .off('click');
            $(jobRow + " .job-name").html(nbsp);
            $(jobRow + " .job-created").html(nbsp);
            $(jobRow + " .job-duration").html(nbsp);
            $(jobRow + " .job-profile").html(nbsp);
        }
    }
    if (startIndex == 0)
        $('#previous-sub-button').addClass('disabled');
    else
        $('#previous-sub-button').removeClass('disabled');
    if (startIndex + jobsPerPage >= suitablePrintJobs.length)
        $('#next-sub-button').addClass('disabled');
    else
        $('#next-sub-button').removeClass('disabled');

    var pageNumber = i18next.t('page-x-of-n');
    pageNumber = 'Page #1 of #2';
    pageNumber = pageNumber.replace('#1', startPage + 1)
                           .replace('#2', Math.floor(suitablePrintJobs.length / jobsPerPage) + 1);
    $('#page-number').html(pageNumber);
}

function reprintInit()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        setMachineLogo();
        promisePostCommandToRoot(selectedPrinter + '/remoteControl/listReprintableJobs', null)
                    .then(updateReprintData)
                    .catch(goToMainMenu);
    }
	else
		goToPrinterStatusPage();
}
