package celtech.roboxremote;

import celtech.roboxbase.comms.remote.clear.ListPrintersResponse;
import celtech.roboxbase.comms.remote.clear.WhoAreYouResponse;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.printerControl.model.Printer;
import com.codahale.metrics.annotation.Timed;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import javafx.scene.paint.Color;
import javax.annotation.security.RolesAllowed;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
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
            ListPrintersResponse response = new ListPrintersResponse(PrinterRegistry.getInstance().getRemotePrinterIDs());
            steno.trace("Returning " + response.getPrinterIDs().size() + " printers");
            
            return response;
        } else
        {
            return null;
        }
    }

    @GET
    @Timed(name = "getFingerprint")
    @Path("/whoareyou")
    @Consumes(MediaType.APPLICATION_JSON)
    public WhoAreYouResponse getFingerprint(@Context HttpServletRequest request, @QueryParam("pc")String pc, @QueryParam("rid")String rid)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            String hostAddress = "Unknown";

            try
            {
                Enumeration<NetworkInterface> networkInterfaces = NetworkInterface
                        .getNetworkInterfaces();
                while (networkInterfaces.hasMoreElements())
                {
                    NetworkInterface ni = (NetworkInterface) networkInterfaces
                            .nextElement();
                    Enumeration<InetAddress> nias = ni.getInetAddresses();
                    while (nias.hasMoreElements())
                    {
                        InetAddress ia = (InetAddress) nias.nextElement();
                        if (!ia.isLinkLocalAddress()
                                && !ia.isLoopbackAddress()
                                && ia instanceof Inet4Address)
                        {
                            hostAddress = ia.getHostAddress();
                            break;
                        }
                    }
                }
            } catch (SocketException e)
            {
                steno.error("/whoareyou(" + request.getRemoteAddr() + "): unable to get current IP " + e.getMessage());
            }
            
            List<String> printerColours = null;
            
            // If we have printer colours requested from AutoMaker we return them 
            if(pc != null && pc.equalsIgnoreCase("yes")) 
            {    
                printerColours = new ArrayList<>();
                
                Map<String, Printer> remotePrinters = PrinterRegistry.getInstance().getRemotePrinters();
                if(remotePrinters != null && !remotePrinters.isEmpty()) 
                {
                    for(Printer printer : remotePrinters.values()) 
                    {
                        Color printerColour = printer.getPrinterIdentity().printerColourProperty().get();
                        printerColours.add(printerColour.toString());
                    }
                }
            } 
            
            String rootUUID = null;
            if (rid != null && rid.equalsIgnoreCase("yes")) 
                rootUUID = RootUUID.get();

            return new WhoAreYouResponse(PrinterRegistry.getInstance().getServerName(),
                    BaseConfiguration.getApplicationVersion(),
                    hostAddress,
                    printerColours,
                    rootUUID);
        } else
        {
            return null;
        }
    }
}
