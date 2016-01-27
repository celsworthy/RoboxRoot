package celtech.roboxremote;

import celtech.comms.remote.DiscoveryResponse;
import com.codahale.metrics.annotation.Timed;
import java.util.List;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
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
    private final PrinterRegistry printerRegistry;

    public DiscoveryAPI()
    {
        printerRegistry = PrinterRegistry.getInstance();
    }

    @GET
    @Timed
    public DiscoveryResponse listPrinters()
    {
        return new DiscoveryResponse(printerRegistry.getRemotePrinterIDs());
    }
}