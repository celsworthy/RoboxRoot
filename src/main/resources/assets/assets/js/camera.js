var cameraprofilejson;
function cameraInit()
{
    $('#left-button').on('click', goToPreviousPage);
    
    GetCameraProfile();
}

function GetCameraProfile(){
    promiseGetCommandToRoot('discovery/listCameras', null)
        .then(function(result) 
              {
                if(result.cameras.length){
                    // only supporting one for now
                    var camera = result.cameras[0];
                    cameraprofilejson = {"profile":{},"camera":{"udevName":camera.udevName,"cameraName":camera.cameraName,"cameraNumber":camera.cameraNumber,"serverIP":""}}
                    loadFrame();                    
                }
                else{
                    $("#no-cameras").removeClass("hidden");
                }
              });   
}

function loadFrame(){
    if(cameraprofilejson){
        promisePostCommandToRoot('cameraControl/0/snapshot', cameraprofilejson, true)
        .then(function(result) 
              {
                var reader = new FileReader();
                reader.onload = function() {                         
                    var b64 = reader.result
                    document.getElementById("camerapreview").src = b64
                    loadFrame();
                }
                reader.readAsDataURL(result)
              });    
    }
}
