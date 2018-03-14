var menuDetailsMap = 
{
	'axis-testing': {'menu-title': 'axis-testing',
					 'action-1': {'active-icon':'Icon_Menu_Axis_Testing.svg',
								  'icon':'Icon_Menu_Axis_Testing.svg',
								  'text':'speed-test',
	                              'action':function() { performPrinterAction('/runMacro', testStatus, "SPEED_TEST"); }},
					 'action-2': {'active-icon':'Icon_Menu_Axis_Testing.svg',
								  'icon':'Icon_Menu_Axis_Testing.svg',
								  'text':'x-axis-test',
	                              'action':function() { performPrinterAction('/runMacro', testStatus, "TEST_X"); }},
					 'action-3': {'active-icon':'Icon_Menu_Axis_Testing.svg',
								  'icon':'Icon_Menu_Axis_Testing.svg',
								  'text':'y-axis-test',
	                              'action':function() { performPrinterAction('/runMacro', testStatus, "TEST_Y"); }},
					 'action-4': {'active-icon':'Icon_Menu_Axis_Testing.svg',
								  'icon':'Icon_Menu_Axis_Testing.svg',
								  'text':'z-axis-test',
	                              'action':function() { performPrinterAction('/runMacro', testStatus, "TEST_Z"); }},
					 'left-button': {'icon':'Icon_Menu_Back.svg',
									 'href':maintenanceMenu,
									 'action': null}},
	'clean-nozzles': {'menu-title': 'clean-nozzles',
				  'action-1': {'active-icon':'Icon_Menu_Clean_Nozzles.svg',
							   'icon':'Icon_Menu_Clean_Nozzles.svg',
							   'text':'clean-nozzle-1',
							   'action':function() { performPrinterAction('/cleanNozzle', cleanNozzleStatus + '-1', 1); }},
				  'action-2': {'active-icon':'Icon_Menu_Clean_Nozzles.svg',
							   'icon':'Icon_Menu_Clean_Nozzles.svg',
							   'text':'clean-nozzle-2',
							   'action':function() { performPrinterAction('/cleanNozzle', cleanNozzleStatus + '-2', 2); }},
				  'left-button': {'icon':'Icon_Menu_Back.svg',
								  'href':maintenanceMenu}},
	'eject-stuck': {'menu-title': 'eject-stuck',
				  'action-1': {'active-icon':'Icon-Menu-Eject-White.svg',
							   'icon':'Icon-Menu-Eject-Grey.svg',
							   'text':'eject-stuck-1',
							   'action':function() { performPrinterAction('/ejectStuckMaterial', ejectStuckStatus + '-1', 2); }},
				  'action-2': {'active-icon':'Icon-Menu-Eject-White.svg',
							   'icon':'Icon-Menu-Eject-Grey.svg',
							   'text':'eject-stuck-2',
							   'action':function() { performPrinterAction('/ejectStuckMaterial', ejectStuckStatus + '-2', 1); }},
				  'left-button': {'icon':'Icon_Menu_Back.svg',
								  'href':maintenanceMenu}},
	'identity': {'menu-title': 'identity',
					 'action-1': {'active-icon':null,
								  'icon':null,
                                  'href':printerNamePage,
								  'text':'printer-name'},
					 'action-2': {'active-icon':null,
								  'icon':null,
								  'text':'printer-colour',
								  'href':printerColourPage},
					 'left-button': {'icon':'Icon_Menu_Back.svg',
									 'href':settingsMenu,
									 'action': null}},
	'maintenance': {'menu-title': 'maintenance',
		            'action-1': {'active-icon':'Icon-Menu-Purge-White.svg',
			                     'icon':'Icon-Menu-Purge-Grey.svg',
				                 'text':'purge',
                                 'href':purgePage, 
                                 'action':null },
		            'action-2': {'active-icon':'Icon-Menu-Eject-White.svg',
					             'icon':'Icon-Menu-Eject-Grey.svg',
						         'text':'eject-stuck',
					             'href':ejectStuckMenu,
					             'action':null},
				  'action-3': {'active-icon':'Icon-Menu-Clean-White.svg',
							   'icon':'Icon-Menu-Clean-Grey.svg',
							   'text':'clean-nozzles',
							   'href':cleanNozzlesMenu,
							   'action':null},
				  'action-4': {'active-icon':'Icon-Menu-Remove-White.svg',
							   'icon':'Icon-Menu-Remove-Grey.svg',
							   'text':'remove-head',
							   'action':function() { performPrinterAction('/removeHead', removeHeadStatus, safetiesOn().toString()); }},
				  'action-5': {'active-icon':'Icon-Menu-Level-White.svg',
							   'icon':'Icon-Menu-Level-Grey.svg',
							   'text':'level-gantry',
                               'action':function() { performPrinterAction('/runMacro', levelGantryStatus, 'LEVEL_GANTRY'); }},
				  'action-6': {'active-icon':'Icon-Menu-Test-White.svg',
							   'icon':'Icon-Menu-Test-Grey.svg',
							   'text':'axis-testing',
							   'href':'menu-horz.html?axis-testing'}},
	'security-settings': {'menu-title': 'security-settings',
				          'action-1': {'active-icon':null,
								       'icon':null,
                                       'href':accessPINPage,
								       'text':'access-pin'},
					      'left-button': {'icon':'Icon_Menu_Back.svg',
									      'href':settingsMenu}},
	'settings': {'menu-title': 'settings',
					 'action-1': {'active-icon':'Icon-NameColour.svg',
								  'icon':'Icon-NameColour.svg',
								  'text':'identity',
								  'href':identityMenu},
					 'action-2': {'active-icon':'Icon-Network.svg',
								  'icon':'Icon-Network.svg',
								  'text':'wireless-settings',
                                  'href':'serverStatus.html'},
					 'action-3': {'active-icon':'Icon-Security.svg',
								  'icon':'Icon-Security.svg',
								  'text':'security-settings',
								  'href':'menu-horz.html?security-settings'}}
};

function setMenuText(details, field)
{
    var item = '#' + field;
    text = details[field];
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

function setActionButton(details, field)
{
    var item = '#' + field;
    button = details[field];
    if (button == null)
    {
        $(item).closest('.row')
			   .addClass('disabled')
               .addClass('rbx-hidden');      
    }
    else
    {
        var activeIcon = button['active-icon'];
        var icon = button['icon'];
        var text = button['text'];
        var href = button['href'];
        var action = button['action'];
        if (text == null)
            text = '&nbsp;';
        else
            text = i18next.t(text);
        
        if (href == null)
            href = '#';
        
        if (icon != null)
            icon = 'url("' + imageRoot + icon + '")';
        $(item).css('background-image', icon);
        if (icon != null && activeIcon != null)
        {
            activeIcon = 'url("' + imageRoot + activeIcon + '")';
            $(item).hover(function() { $(this).css('background-image', activeIcon); },
                          function() { $(this).css('background-image', icon); });
        }

        $(item).html(text)
               .attr('href', href)
               .on('click', action)
               .closest('.row')
			   .removeClass('disabled')
               .removeClass('rbx-hidden');
    }
}

function menuHorzInit()
{
    var menuDetails = null;
    var menuId = window.location.search;
    if (menuId.length > 0)
        menuId = menuId.substr(1);
    if (menuId != null)
        menuDetails = menuDetailsMap[menuId];
    if (menuDetails != null)
    {
        setMachineLogo();
        setMenuText(menuDetails, 'menu-title');
        setActionButton(menuDetails, 'action-1');
        setActionButton(menuDetails, 'action-2');
        setActionButton(menuDetails, 'action-3');
        setActionButton(menuDetails, 'action-4');
        setActionButton(menuDetails, 'action-5');
        setActionButton(menuDetails, 'action-6');
        setFooterButton(menuDetails, 'left-button')
        setFooterButton(menuDetails, 'right-button')
    }
    else
        goToPage(mainMenu);
}

function performPrinterAction(printerCommand, targetPage, parameter)
{
	var selectedPrinter = localStorage.getItem(selectedPrinterVar);
	if (selectedPrinter !== null)
	{
        sendPostCommandToRoot(selectedPrinter + "/remoteControl" + printerCommand,
                              function() { goToPage(targetPage); },
                              null,
                              parameter);
    }
    else
        goToHomeOrPrinterStatus();
}
