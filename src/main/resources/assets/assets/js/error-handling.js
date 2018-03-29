function clearActiveErrors()
{
    var pr = localStorage.getItem(selectedPrinterVar);

    if (pr !== null)
    {
        promisePostCommandToRoot(pr + '/remoteControl/clearErrors', null)
                .then(function (data) { $('#active-error-dialog').modal('hide'); })
                .catch(goToPrinterStatusPage);
    }
}

function handleActiveErrors(activeErrorData)
{
    if (activeErrorData.activeErrors !== null &&
	    activeErrorData.activeErrors.length > 0)
    {
        $('#error-text').val(activeErrorData.activeErrors[0]);
        $('#active-error-dialog').modal('show');
    }
    else
    {
        $('#active-error-dialog').modal('hide');
    }
}

function handleActiveFailure(failureData)
{
    console.log('Failed to report error - ' + failureData.toString());
    goToHomeOrPrinterStatus();
}

function checkForActiveErrors()
{
    var pr = localStorage.getItem(selectedPrinterVar);

    if (pr !== null)
    {
        promiseGetCommandToRoot(pr + '/remoteControl/activeErrorStatus', null)
            .then(handleActiveErrors)
            .catch(handleActiveFailure);
    }
}

function startActiveErrorHandling()
{
    var pr = localStorage.getItem(selectedPrinterVar);

    if (pr !== null)
    {
        var errorDialogText =
            '<div class="modal fade" role="dialog" tabindex="-1" id="active-error-dialog">'
                + '<div class="modal-dialog" role="document">'
                + '<div class="modal-content">'
                + '<div class="modal-header rbx-dialog">'
                + '<h4 class="modal-title localised" i18n-data="error-report">Error Report</h4>'
                + '</div>'
                + '<div class="modal-body rbx-dialog">'
                + '<div><textarea id="error-text" class="form-control no-resize"></textarea>'
                + '<div class="input-group">'
                + '<div class="input-group-btn"><button class="btn btn-default localised" type="button" id="clear-error-button" data-i18n="clear-error">Clear Errors</button></div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>';
        $('body').append(errorDialogText);
        $('#clear-error-button').on('click', clearActiveErrors);

        // Set off the error notifier.
        setInterval(checkForActiveErrors, 500);
        
    }
}