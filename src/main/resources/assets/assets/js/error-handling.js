function clearActiveError()
{
    var pr = localStorage.getItem(selectedPrinterVar);
    var errorCode = parseInt($('#active-error-dialog').attr('data-error-code'));
    
    if (pr !== null && !isNaN(errorCode))
    {
        promisePostCommandToRoot(pr + '/remoteControl/clearError', errorCode)
                .then(function (data) 
                      {
                          $('#active-error-dialog').attr('data-error-code', '');
                          $('#active-error-dialog').modal('hide');
                      })
                .catch(goToHomeOrPrinterSelectPage);
    }
}

function continueActiveError()
{
    var pr = localStorage.getItem(selectedPrinterVar);

    if (pr !== null)
    {
        resumeAction()
            .then(clearActiveError)
            .catch(goToHomeOrPrinterSelectPage);
    }
}

function abortActiveError()
{
    var pr = localStorage.getItem(selectedPrinterVar);

    if (pr !== null)
    {
        cancelAction()
            .then(clearActiveError)
            .catch(goToHomeOrPrinterSelectPage);
    }
}

function handleActiveErrors(activeErrorData)
{
    if (activeErrorData.activeErrors !== null &&
	    activeErrorData.activeErrors.length > 0)
    {
        $('#active-error-dialog').attr('data-error-code', activeErrorData.activeErrors[0].errorCode);
        $('#active-error-title').text(activeErrorData.activeErrors[0].errorTitle);
        $('#active-error-summary').text(activeErrorData.activeErrors[0].errorMessage);
        var options = activeErrorData.activeErrors[0].options;
        // ABORT(1),
        // CLEAR_CONTINUE(2),
        // RETRY(4),
        // OK(8),
        // OK_ABORT(16),
        // OK_CONTINUE(32);
        if ((options & 17) !== 0) // ABORT or OK_ABORT
            $('#active-error-abort').removeClass('hidden');
        else
            $('#active-error-abort').addClass('hidden');
        
        if (options === 0 || // Nothing or
            (options & 46) !== 0) // CLEAR_CONTINUE or RETRY or OK or OK_CONTINUE.
            $('#active-error-continue').removeClass('hidden');
        else
            $('#active-error-continue').addClass('hidden');
        $('#active-error-dialog').modal('show');
    }
    else
    {
        $('#active-error-dialog').attr('data-error-code', '');
        $('#active-error-dialog').modal('hide');
    }
}

function handleActiveFailure(failureData)
{
    console.log('Failed to report error - ' + failureData.toString());
    goToHomeOrPrinterSelectPage();
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
			'<div id="active-error-dialog" class="modal rbx" role="dialog" tabindex="-1" data-backdrop="static" data-keyboard="false" data-error-code="">'
				+ '<div class="modal-dialog modal-lg" role="document">'
				+ '<div class="modal-content">'
				+ '<div class="modal-body rbx">'
				+ '<div class="row vertical-align">'
				+ '<div style="float: left; margin-right: 1.5vh;"><img id="active-error-icon" src="assets/img/Blank.svg" style="width: 10vh;"></div>'
				+ '<div style="float: left;">'
				+ '<div class="row">'
				+ '<div><span id="active-error-title" class="rbx-text-large" style="line-height: 5vh;">&nbsp;</span></div>'
				+ '</div>'
				+ '<div class="row">'
				+ '<div><span id="active-error-summary" class="rbx-text-large" style="font-weight: 400;  line-height: 5vh;">&nbsp;</span></div>'
				+ '</div>'
				+ '</div>'
				+ '</div>'
				+ '<div class="row">'
				+ '<div>'
				+ '<p id="active-error-details" class="rbx-text-bigbody" style="margin: 1.5vh 0vh">&nbsp;</p>'
				+ '</div>'
				+ '</div>'
				+ '</div>'
				+ '<div class="modal-footer rbx">'
				+ '<button id="active-error-continue" class="btn btn-default rbx-modal localised" type="button" data-dismiss="modal" data-i18n="clear-continue">Clear and Continue</button>'
				+ '<button id="active-error-abort" class="btn btn-default rbx-modal localised" type="button" data-i18n="abort">Abort</button></div>'
				+ '</div>'
				+ '</div>'
				+ '</div>';
        $('body').append(errorDialogText);
        $('#active-error-continue').on('click', continueActiveError);
        $('#active-error-abort').on('click', abortActiveError);

        // Set off the error notifier.
        setInterval(checkForActiveErrors, 500);
        
    }
}