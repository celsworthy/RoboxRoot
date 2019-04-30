package celtech.roboxremote.api;

import celtech.roboxbase.comms.remote.Configuration;
import celtech.roboxremote.CameraControl;
import com.codahale.metrics.annotation.Timed;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/**
 *
 * @author George Salter
 */
@RolesAllowed("root")
@Path("/{printerID}" + Configuration.cameraAPIService)
@Produces(MediaType.APPLICATION_JSON)
public class CameraAPI
{
    @GET
    @Timed
    @Path("timelapse")
    public Response takeTimelapsePhoto()
    {
        if (CameraControl.takeTimelapsePicture())
        {
            return Response.ok().build();
        } else
        {
            return Response.serverError().build();
        }
    }
}
