package celtech.roboxremote;

import celtech.roboxbase.comms.remote.Configuration;
import com.codahale.metrics.annotation.Timed;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
@Path(Configuration.adminAPIService)
@Produces(MediaType.APPLICATION_JSON)
public class AdminAPI
{

    private final Stenographer steno = StenographerFactory.getStenographer(AdminAPI.class.getName());

    public AdminAPI()
    {
    }

    @POST
    @Timed
    @Path(Configuration.shutdown)
    public void shutdown()
    {
        new Runnable()
        {
            @Override
            public void run()
            {
                steno.info("Running shutdown thread");
                Root.getInstance().stop();
                steno.info("Shutdown thread finished");
            }
        }.run();
    }

    @POST
    @Timed
    @Path("/setServerName")
    public void setServerName(String serverName)
    {
        PrinterRegistry.getInstance().setRegistryName(serverName);
    }
}
