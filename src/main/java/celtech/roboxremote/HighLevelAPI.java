package celtech.roboxremote;

import celtech.roboxbase.comms.remote.Configuration;
import celtech.roboxbase.printerControl.model.PrinterException;
import com.codahale.metrics.annotation.Timed;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
@Path("/{printerID}" + Configuration.highLevelAPIService)
@Produces(MediaType.APPLICATION_JSON)
public class HighLevelAPI
{

    private final Stenographer steno = StenographerFactory.getStenographer(HighLevelAPI.class.getName());
    private final PrinterRegistry printerRegistry;

    public HighLevelAPI()
    {
        printerRegistry = PrinterRegistry.getInstance();
    }

    @POST
    @Timed
    @Path(Configuration.pauseService)
    public void pause(@PathParam("printerID") String printerID)
    {
        try
        {
            printerRegistry.getRemotePrinters().get(printerID).homeAllAxes(false, null);
        } catch (PrinterException ex)
        {
            steno.error("Exception whilst homing");
        }
    }

    @POST
    @Timed
    @Path(Configuration.resumeService)
    public void resume(@PathParam("printerID") String printerID)
    {
    }

    @POST
    @Timed
    @Path(Configuration.cancelService)
    public void cancel(@PathParam("printerID") String printerID)
    {
    }
}
