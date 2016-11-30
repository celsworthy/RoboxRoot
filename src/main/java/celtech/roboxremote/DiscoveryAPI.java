package celtech.roboxremote;

import celtech.roboxbase.comms.remote.ListPrintersResponse;
import celtech.roboxbase.comms.remote.WhoAreYouResponse;
import celtech.roboxbase.configuration.BaseConfiguration;
import com.codahale.metrics.annotation.Timed;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Ian
 */
@Path("/discovery")
@Produces(MediaType.APPLICATION_JSON)
public class DiscoveryAPI
{

    public DiscoveryAPI()
    {
    }

    @RolesAllowed("root")
    @GET
    @Timed
    @Path("/listPrinters")
    @Consumes(MediaType.APPLICATION_JSON)
    public ListPrintersResponse listPrinters()
    {
        if (PrinterRegistry.getInstance() != null)
        {
            return new ListPrintersResponse(PrinterRegistry.getInstance().getRemotePrinterIDs());
        } else
        {
            return null;
        }
    }

    @GET
    @Timed
    @Path("/whoareyou")
    @Consumes(MediaType.APPLICATION_JSON)
    public WhoAreYouResponse getFingerprint()
    {
        if (PrinterRegistry.getInstance() != null)
        {
            return new WhoAreYouResponse(PrinterRegistry.getInstance().getServerName(),
                    BaseConfiguration.getApplicationVersion());
        } else
        {
            return null;
        }
    }
}
