function checkForMobileBrowser()
{
    // device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)))
    {
        isMobile = true;
    }
}

function goToPage(page)
{
    var enteredPIN = localStorage.getItem(applicationPINVar);
    if (enteredPIN !== null && enteredPIN !== "")
    {
        var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + enteredPIN);
        console.log(" goToPage - modified url = \"" + 'http://' + window.location.host + page + "\"");
        $.ajax({
            //url: 'http://' + window.location.hostname + ':8080' + printerStatusPage,
            url: clientURL + page,
            cache: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
            },
            type: 'GET',
            success: function (data, textStatus, jqXHR) {
//               location.href = 'http://' + window.location.hostname + ':8080' + printerStatusPage;
                console.log(" goToPage - modified location.href = \"" + 'http://' + window.location.host + page + "\"");
                location.href = clientURL + page;
            },
            error: function (data, textStatus, jqXHR) {
                logout();
            }
        });
    } else
    {
        logout();
    }
}

function goToPrinterStatusPage()
{
    goToPage(printerStatusPage);
}

function goToHomePage()
{
    goToPage(homePage);
}

function goToHomeOrPrinterStatus()
{
    sendGetCommandToRoot('discovery/listPrinters',
            function (printerData) {
                connectedToServer = true;
                if (printerData.printerIDs.length === 1)
                {
                    selectedPrinterID = selectedPrinterVar, printerData.printerIDs[0];
                    lastPrinterData = null;
                    localStorage.setItem(selectedPrinterVar, printerData.printerIDs[0]);
                    goToHomePage();
                }
                else
                {
                    goToPrinterStatusPage();        
                }
            },
            function (data) {
                connectedToServer = false;
                logout();
            },
            null);
}

function logout()
{
    debugger;
    localStorage.setItem(applicationPINVar, "");
    location.href = clientURL + loginPage;
}

function sendGetCommandToRoot(service, successCallback, errorCallback, dataToSend)
{
    sendCommandToRoot('GET', service, successCallback, errorCallback, dataToSend);
}

function sendPostCommandToRoot(service, successCallback, errorCallback, dataToSend)
{
    sendCommandToRoot('POST', service, successCallback, errorCallback, dataToSend);
}

function sendCommandToRoot(requestType, service, successCallback, errorCallback, dataToSend)
{
    var printerURL = serverURL + "/api/" + service + "/";
    var base64EncodedCredentials = $.base64.encode(defaultUser + ":" + localStorage.getItem(applicationPINVar));

    $.ajax({
        url: printerURL,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + base64EncodedCredentials);
        },
        contentType: "application/json", // send as JSON
        type: requestType,
//        dataType: 'json',
        data: JSON.stringify(dataToSend),
        success:function (data, textStatus, jqXHR)
        {
            if (successCallback !== null)
            {
                successCallback(data);
            }
        },
        error:function (jqXHR, textStatus, errorThrown)
        {
            if (errorCallback !== null)
            {
                errorCallback(textStatus);
            }
        }
    });
}

function updateLocalisation()
{
    if (locationificator_initialised)
    {
        $('.localised').each(function ()
        {
            $(this).localize();
        });

        $(".language-selector").val(i18next.language);
    }
}

function updateHeaderi18String(i18nString)
{
    $('#pageTitle').val(i18nString);
}

function selectLanguage(language)
{
    i18next.changeLanguage(language, function (err, t) {
        updateLocalisation();
    });
}

function secondsToHMS(secondsInput)
{
    var minutes = Math.floor(secondsInput / 60);
    var hours = Math.trunc(Math.floor(minutes / 60));
    minutes = Math.trunc(minutes - (60 * hours));
    var seconds = Math.trunc(secondsInput - (minutes * 60) - (hours * 3600));

    var hoursString = ('00' + hours).slice(-2);
    var minutesString = ('00' + minutes).slice(-2);
    var secondsString = ('00' + seconds).slice(-2);

    return hoursString + ":" + minutesString + ":" + secondsString;
}

function secondsToHM(secondsInput)
{
    var minutes = Math.floor(secondsInput / 60);
    var hours = Math.trunc(Math.floor(minutes / 60));
    minutes = Math.trunc(minutes - (60 * hours));

    var hoursString = ('00' + hours).slice(-2);
    var minutesString = ('00' + minutes).slice(-2);

    return hoursString + ":" + minutesString;
}

function getServerStatus(successFunc, errorFunc)
{
    sendGetCommandToRoot('discovery/whoareyou',
            function (data) {
                $('#serverOnline').text(i18next.t('online'));
                updateServerStatus(data);
                connectedToServer = true;
                if (typeof serverOnline === "function")
                {
                   serverOnline(); 
                }
            },
            function (data) {
                connectedToServer = false;
                $('#serverOnline').text(i18next.t('offline'));
                updateServerStatus(null);
                if (typeof serverOffline === "function")
                {
                   serverOffline(); 
                }
            },
            null);
}

function updateServerStatus(serverData)
{
    if (serverData === null)
    {
        $('#serverVersion').text("");
        $(".serverStatusLine").text("");
        $(".server-name-title").text("");
        $("#server-name-input").val("");
        $(".server-ip-address").val("");
    } else
    {
        if (lastServerData == null
            || serverData.name !== lastServerData.name
            || serverData.serverIP !== lastServerData.serverIP
            || serverData.serverVersion !== lastServerData.serverVersion)
        {
            $('#serverVersion').text(serverData.serverVersion);
            $(".serverStatusLine").text(serverData.name);
            $(".server-name-title").text(serverData.name);
            $("#server-name-input").val(serverData.name);
            $(".server-ip-address").text(serverData.serverIP);
            $(".serverIP").text(serverData.serverIP);
            lastServerData = serverData;
        }
    }
}

function onSpinnerClick()
{
    var btn = $(this);
    var b = btn.closest('.rbx-spinner');
    input = btn.parent().find('input');
    var oldValue = Number(input.val());
    var newValue = oldValue;
    var step = input.attr('step');
    if (step == null)
        step = 1;
    else
       step = Number(step); 
    if (btn.attr('data-dir') == 'up')
    {
        var maxLimit = input.attr('max');
        oldValue += step
        if (maxLimit == null ||
            oldValue <= Number(maxLimit))
        {
            newValue = oldValue;
        }
    }
    else // (btn.attr('data-dir') == 'down')
    {
        var minLimit = input.attr('min');
        oldValue -= step
        if (minLimit == null ||
            oldValue >= Number(minLimit))
        {
            newValue = oldValue;
        }
    }
    var precision = input.attr('precision');
    if (precision == null)
        precision = 0;
    else
       precision = Number(precision); 
    input.val(newValue.toFixed(precision));
    var callback = input.attr('callback');
    if (callback != null && window.hasOwnProperty(callback))
        window[callback](input.attr('id'), newValue);
}

function setHeaderAndFooter()
{
    $('.header-box').html(
        "<a href='printerStatus.html'><img class='img-responsive' alt='Robox Logo' src='assets/img/Icon-Robox.svg' style='width:60px'></a>" +
        "<p style='flex-grow: 1; font-size: 2em;' class='text-center no-margins localised' data-i18n='" + titlei18n + "'></p>" +
        "<a href='printerStatus.html'><img class='img-responsive' alt='Root Logo' src='assets/img/Logo-Root.svg' style='width:60px'></a>");

    $('.footer-box').html(
        "<span class='text-center server-name-title footer-display' style='flex-grow: 1;'>No Server</span>" +
        "<a class='btn footer-btn' href='printerStatus.html'><img class='img-fluid root-icon' alt='Home' src='assets/img/Icon-Home.svg'></a>" +
        "<a class='btn footer-btn' href='serverStatus.html'><img class='img-fluid root-icon' altroot-icon='Setup' src='assets/img/Icon-Settings.svg' height='50'></a>" +
        "<span class='text-center serverIP footer-display' style='flex-grow: 1;'>-</span>");
}

$(document).ready(function () {
    i18next.use(i18nextBrowserLanguageDetector)
            .use(i18nextXHRBackend)
            .init({
                debug: true,
                fallbackLng: 'en',
                backend: {
                    loadPath: '/locales/{{lng}}/translation.json'
                }
            }, function (t) {
                jqueryI18next.init(i18next, $, {
                    tName: 't', // --> appends $.t = i18next.t
                    i18nName: 'i18n', // --> appends $.i18n = i18next
                    handleName: 'localize', // --> appends $(selector).localize(opts);
                    selectorAttr: 'data-i18n', // selector for translating elements
                    targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if diffrent then itself)
                    optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
                    useOptionsAttr: false, // see optionsAttr
                });
                locationificator_initialised = true;
                updateLocalisation();

                checkForMobileBrowser();

                if (typeof page_initialiser === "function")
                {
                    $('img').on('dragstart', function (event) {
                        event.preventDefault();
                    });
                    page_initialiser();
                    setHeaderAndFooter();
                    updateLocalisation();
                }
            });
});

function safetiesOn()
{
    var booleanStatus = false;
    var safetyStatus = localStorage.getItem(safetiesOnVar);
    if (safetyStatus === 'on')
    {
        booleanStatus = true;
    }
    return booleanStatus;
}

function cancelAction()
{
    var selectedPrinter = localStorage.getItem(selectedPrinterVar);
    sendPostCommandToRoot(selectedPrinter + "/remoteControl/cancel", null, null, safetiesOn().toString());
}

function setFooterButton(details, field)
{
    var item = '#' + field;
    menu = details[field];
    if (menu == null)
    {
        $(item).addClass('disabled')
               .addClass('rbx-invisible');      
    }
    else
    {
        var icon = menu['icon'];
        var href = menu['href'];
        var action = menu['action'];
        if (icon != null)
            icon = '<img class = "menu-bottom-button-icon" src="' + imageRoot + icon + '" />';
        else
            icon = '&nbsp;';
        if (href == null)
            href = '#';
        $(item).html(icon)
               .attr('href', href)
               .on('click', action)
               .removeClass('disabled')
               .removeClass('rbx-invisible');
    }
}

function getMachineDetails()
{
    var printerType = localStorage.getItem(printerTypeVar);
    var machineDetails = machineDetailsMap[printerType];
    if (machineDetails == null)
        machineDetails = machineDetailsMap['RBX01'];
    return machineDetails;
}

function setMachineLogo()
{    
    var machineDetails = getMachineDetails();
    setImageOnElement('.machine-logo', machineDetails['logo']);
}

function setTextFromField(details, field)
{
    var item = '#' + field;
    var text = details[field];
    if (text == null)
    {
        $(item).html("&nbsp;")
               .closest('.row')
               .addClass('rbx-hidden');      
    }
    else
    {
        $(item).html(i18next.t(text))
               .closest('.row')
               .removeClass('rbx-hidden');
    }
}

function setImageOnElement(element, image)
{
    if (image == null)
    {
        $(element).attr('src', null)
               .closest('.row')
               .addClass('rbx-hidden');      
    }
    else
    {
        $(element).attr('src', imageRoot + image)
                 .closest('.row')
                 .removeClass('rbx-hidden');
    }
}

function setImageFromField(details, field)
{
    setImageOnElement('#' + field, details[field]);
}

function getComplimentaryOption(baseColour, darkOption, lightOption)
{
    // brightness  =  sqrt( .241 R2 + .691 G2 + .068 B2 )
    // brightness > 130, use dark colour. Otherwise use light colour.
   var rgb = baseColour.match(/\d+/g).slice(0,3);
    var b = Math.sqrt(0.241 * rgb[0] * rgb[0] + 0.691 * rgb[1] * rgb[1] + 0.068 * rgb[2] * rgb[2]);
    if (b > 130)
        return darkOption;
    else
        return lightOption;
}
