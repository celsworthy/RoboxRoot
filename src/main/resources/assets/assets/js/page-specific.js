var titlei18n = "default";

function page_initialiser() {
    $('#filament-page').each(function(){
        titlei18n = "filament-page";
        setupFilamentPage();
    });
    $('#home-page').each(function(){
        titlei18n = "home-page";
        getHomeData();
        startHomeUpdates();
    });
    $('#index-page').each(function(){
        titlei18n = "indexPage";
        checkForMobileBrowser();

        var enteredPIN = localStorage.getItem(applicationPINVar);
        if (enteredPIN !== null && enteredPIN !== "")
        {
            var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + enteredPIN);
            $.ajax({
                url: clientURL + printerStatusPage,
                dataType: 'html',
                cache: false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
                },
                type: 'GET',
                success: function (data, textStatus, jqXHR) {
                    goToHomeOrPrinterStatus();
                },
                error: function (data, textStatus, jqXHR) {
                    logout();
                }
            });
        } else
        {
            logout();
        }
    })
    $('#login-page').each(function(){
        var enteredPIN = localStorage.getItem(applicationPINVar);
        $("#application-pin-value").val(enteredPIN);
        if (enteredPIN !== null
            && enteredPIN !== "")
        {
            attemptLogin();
        }
    
        $("#application-pin-value").on('keyup', function (e) {
            if (e.keyCode === 13) {
                attemptLogin();
            }
        });
    });
    $('#main-menu-page').each(function(){
        titlei18n = "main-menu-page";
        setupMainMenu();
        });
    $('#maintenance-page').each(function(){
        titlei18n = "maintenance-page";
        setupMaintenancePage();
        });
    $('#move-page').each(function(){
        titlei18n = "move-page";
        setupMovePage();
    });
    $('#preferences-page').each(function(){
        titlei18n = "preferences-page";
        setupPreferencesPage();
    });
    $('#status-page').each(function(){
        titlei18n = "printer-status";
        $('#printer-select').change(function () {
            var optionSelected = $(this).find('option:selected');
            var optValueSelected = optionSelected.val();
            if (optValueSelected)
            {
                selectPrinter(optValueSelected);
            }
        });

        $("#pin-update-value").val(localStorage.getItem(applicationPINVar));

        getServerStatus();
        getPrinters();
        setInterval(getStatus, 2000);
    });
}v