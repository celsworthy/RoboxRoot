package celtech.roboxremote.api;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.comms.remote.Configuration;
import celtech.roboxbase.comms.remote.clear.WifiStatusResponse;
import celtech.roboxbase.comms.remote.types.SerializableFilament;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.Filament;
import celtech.roboxbase.configuration.MachineType;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxremote.PrinterRegistry;
import celtech.roboxremote.Root;
import celtech.roboxremote.Utils;
import celtech.roboxremote.WifiControl;
import com.codahale.metrics.annotation.Timed;
import java.io.IOException;
import java.io.InputStream;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

/**
 *
 * @author Ian
 */
@Path(Configuration.adminAPIService)
@Produces(MediaType.APPLICATION_JSON)
public class AdminAPI
{

    private final Stenographer steno = StenographerFactory.getStenographer(AdminAPI.class.getName());
    private final Utils utils = new Utils();

    public AdminAPI()
    {
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Path(Configuration.shutdown)
    public Response shutdown()
    {
        steno.info("Shutdown requested");
        Root.getInstance().stop();
        // Should never get here.
        return Response.serverError().build();    
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/setServerName")
    public Response setServerName(String serverName)
    {
        PrinterRegistry.getInstance().setServerName(Utils.cleanInboundJSONString(serverName));
        return Response.ok().build();
    }

    @RolesAllowed("root")
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Path("updateSystem")
    public Response updateSystem(
            @FormDataParam("name") InputStream uploadedInputStream,
            @FormDataParam("name") FormDataContentDisposition fileDetail) throws IOException
    {
        Response response = Response.serverError().build();

        try
        {
            String fileName = fileDetail.getFileName();
            steno.info("Asked to upgrade using file " + fileName);

            long t1 = System.currentTimeMillis();
            String uploadedFileLocation;
            if (BaseConfiguration.getMachineType() != MachineType.WINDOWS)
            {
                uploadedFileLocation = "/tmp/" + fileName;
            } else
            {
                uploadedFileLocation = BaseConfiguration.getUserTempDirectory() + fileName;
            }

            // save it
            utils.writeToFile(uploadedInputStream, uploadedFileLocation);
            
            long t2 = System.currentTimeMillis();
            steno.info("Upgrade file " + uploadedFileLocation + " has been uploaded in " + Long.toString(t2 - t1) + "ms");

            // Shut down - but delay by 10 seconds to allow the response to go back to the requester first.
            BaseLookup.getTaskExecutor().runDelayedOnBackgroundThread(() -> Root.getInstance().restart(), 10000);
            response = Response.ok().build();
        } catch (IOException ex)
        {
        }
        return response;
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/updatePIN")
    public Response updatePIN(String newPIN)
    {
        Root.getInstance().setApplicationPIN(Utils.cleanInboundJSONString(newPIN));
        return Response.ok().build();
    }

    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/resetPIN")
    public Response resetPIN(String printerSerial)
    {

        boolean serialMatches = false;

        String serialToUse = Utils.cleanInboundJSONString(printerSerial);
        if (serialToUse != null)
        {
            for (Printer printer : PrinterRegistry.getInstance().getRemotePrinters().values())
            {
                if (printer.getPrinterIdentity().printerUniqueIDProperty().get().toLowerCase().endsWith(serialToUse.toLowerCase()))
                {
                    serialMatches = true;
                    break;
                }
            }
        }

        if (serialMatches)
        {
            Root.getInstance().resetApplicationPINToDefault();
            return Response.ok().build();
        } else
        {
            return Response.serverError().build();
        }
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/setWiFiCredentials")
    public Response setWiFiCredentials(String ssidAndPassword)
    {
        steno.info("Asked to change wifi creds to " + ssidAndPassword);
        if (WifiControl.setupWiFiCredentials(Utils.cleanInboundJSONString(ssidAndPassword)))
            return Response.ok().build();
        else
            return Response.serverError().build();
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/enableDisableWifi")
    public Response enableDisableWifi(boolean enableWifi)
    {
        if (WifiControl.enableWifi(enableWifi))
            return Response.ok().build();
        else
            return Response.serverError().build();
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Path("/getCurrentWifiState")
    public WifiStatusResponse getCurrentWifiSSID()
    {
        return WifiControl.getCurrentWifiState();
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/saveFilament")
    public Response saveFilament(SerializableFilament serializableFilament)
    {
        Filament filament = serializableFilament.getFilament();
        FilamentContainer.getInstance().saveFilament(filament);
        return Response.ok().build();
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Path("/deleteFilament")
    public Response deleteFilament(SerializableFilament serializableFilament)
    {
        Filament filament = serializableFilament.getFilament();
        FilamentContainer.getInstance().deleteFilament(filament);
        return Response.ok().build();
    }
}
