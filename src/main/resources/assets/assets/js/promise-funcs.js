function promiseCommandToRoot(requestType, service, dataToSend)
{
	return new Promise(function(resolve, reject)
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
//			dataType: 'json',
			data: JSON.stringify(dataToSend),
			success:function (data, textStatus, jqXHR)
				{
					resolve(data);
				},
            error:function (jqXHR, textStatus, errorThrown)
                {
                    reject(Error(textStatus));
                }       
        });
     });
}

function promiseGetCommandToRoot(service, dataToSend)
{
    return promiseCommandToRoot('GET', service, dataToSend);
}

function promisePostCommandToRoot(service, dataToSend)
{
    return promiseCommandToRoot('POST', service, dataToSend);
}
