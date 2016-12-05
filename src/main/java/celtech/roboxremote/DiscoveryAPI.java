package celtech.roboxremote;

import celtech.roboxbase.comms.remote.ListPrintersResponse;
import celtech.roboxbase.comms.remote.WhoAreYouResponse;
import celtech.roboxbase.configuration.BaseConfiguration;
import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.Enumeration;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
@Path("/discovery")
@Produces(MediaType.APPLICATION_JSON)
public class DiscoveryAPI
{
    @JsonIgnore
    private static Stenographer steno = StenographerFactory.getStenographer(DiscoveryAPI.class.getName());

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
            String hostAddress = "Unknown";
            
            try {
                Enumeration<NetworkInterface> networkInterfaces = NetworkInterface
                        .getNetworkInterfaces();
                while (networkInterfaces.hasMoreElements()) {
                    NetworkInterface ni = (NetworkInterface) networkInterfaces
                            .nextElement();
                    Enumeration<InetAddress> nias = ni.getInetAddresses();
                    while(nias.hasMoreElements()) {
                        InetAddress ia= (InetAddress) nias.nextElement();
                        if (!ia.isLinkLocalAddress() 
                         && !ia.isLoopbackAddress()
                         && ia instanceof Inet4Address) {
                            hostAddress = ia.getHostAddress();
                            break;
                        }
                    }
                }
            } catch (SocketException e) {
                steno.error("unable to get current IP " + e.getMessage());
            }
            
            return new WhoAreYouResponse(PrinterRegistry.getInstance().getServerName(),
                    BaseConfiguration.getApplicationVersion(),
                    hostAddress);
        } else
        {
            return null;
        }
    }
}
