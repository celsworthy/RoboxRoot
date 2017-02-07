package celtech.roboxremote;

import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.printerControl.model.Head;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.printerControl.model.PrinterException;
import celtech.roboxbase.utils.PrinterUtils;
import celtech.roboxremote.rootDataStructures.StatusData;
import com.codahale.metrics.annotation.Timed;
import io.dropwizard.jersey.params.BooleanParam;
import java.io.IOException;
import java.io.InputStream;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
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
@RolesAllowed("root")
@Path("/{printerID}/remoteControl")
@Produces(MediaType.APPLICATION_JSON)
public class PublicPrinterControlAPI
{

    private final Stenographer steno = StenographerFactory.getStenographer(PublicPrinterControlAPI.class.getName());
    private final Utils utils = new Utils();

    public PublicPrinterControlAPI()
    {
    }

    @GET
    @Timed
    public StatusData getPrinterStatus(@PathParam("printerID") String printerID)
    {
        StatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new StatusData();
            returnVal.updateFromPrinterData(PrinterRegistry.getInstance().getRemotePrinters().get(printerID));
        }
        return returnVal;
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("printGCodeFile")
    public Response printGCodeFile(@PathParam("printerID") String printerID,
            @FormDataParam("file") InputStream uploadedInputStream,
            @FormDataParam("file") FormDataContentDisposition fileDetail) throws IOException
    {
        String uploadedFileLocation = BaseConfiguration.getPrintSpoolDirectory() + printerID + fileDetail.getFileName();
        steno.info("Printing gcode file " + uploadedFileLocation);
        // save it
        utils.writeToFile(uploadedInputStream, uploadedFileLocation);

        try
        {
            PrinterRegistry.getInstance().getRemotePrinters().get(printerID).executeGCodeFile(uploadedFileLocation, true);
        } catch (PrinterException ex)
        {
            steno.exception("Exception whilst trying to print gcode file " + uploadedFileLocation, ex);
        }
        return Response.ok().build();
    }

    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/openDoor")
    public boolean openDoor(@PathParam("printerID") String printerID, BooleanParam safetyOn)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).goToOpenDoorPosition(null, safetyOn.get());
            } catch (PrinterException ex)
            {
                steno.error("Exception whilst opening door");
                return false;
            }
        }

        return true;
    }

    @POST
    @Timed
    @Path("/pause")
    public void pause(@PathParam("printerID") String printerID)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).pause();
            } catch (PrinterException ex)
            {
                steno.error("Exception whilst pausing");
            }
        }
    }

    @POST
    @Timed
    @Path("/resume")
    public void resume(@PathParam("printerID") String printerID)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).resume();
            } catch (PrinterException ex)
            {
                steno.error("Exception whilst resuming");
            }
        }
    }

    @POST
    @Timed
    @Path("/cancel")
    public void cancel(@PathParam("printerID") String printerID)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).cancel(null);
            } catch (PrinterException ex)
            {
                steno.error("Exception whilst cancelling");
            }
        }
    }

    @POST
    @Timed
    @Path("/purge")
    public void purge(@PathParam("printerID") String printerID, BooleanParam safetyOn)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);

            Thread purgeThread = new Thread(() ->
            {
                boolean purgeNozzle0 = false;
                int nozzle0Temperature = 180;
                boolean purgeNozzle1 = false;
                int nozzle1Temperature = 180;

                if (printer.headProperty().get().headTypeProperty().get() == Head.HeadType.DUAL_MATERIAL_HEAD)
                {
                    if (printer.effectiveFilamentsProperty().get(0) != FilamentContainer.UNKNOWN_FILAMENT)
                    {
                        purgeNozzle1 = true;
                        nozzle1Temperature = printer.effectiveFilamentsProperty().get(0).getNozzleTemperature();
                    }
                    if (printer.effectiveFilamentsProperty().get(1) != FilamentContainer.UNKNOWN_FILAMENT)
                    {
                        purgeNozzle0 = true;
                        nozzle0Temperature = printer.effectiveFilamentsProperty().get(1).getNozzleTemperature();
                    }
                }
                try
                {
                    //Set the bed to 90 degrees C
                    int desiredBedTemperature = 90;
                    printer.setBedTargetTemperature(desiredBedTemperature);
                    printer.goToTargetBedTemperature();
                    boolean bedHeatFailed = PrinterUtils.waitUntilTemperatureIsReached(
                            printer.getPrinterAncillarySystems().bedTemperatureProperty(), null,
                            desiredBedTemperature, 5, 600, null);

                    if (!bedHeatFailed)
                    {
                        if (purgeNozzle0)
                        {
                            printer.setNozzleHeaterTargetTemperature(0, nozzle0Temperature);
                            printer.goToTargetNozzleHeaterTemperature(0);
                        }

                        if (purgeNozzle1)
                        {
                            printer.setNozzleHeaterTargetTemperature(1, nozzle1Temperature);
                            printer.goToTargetNozzleHeaterTemperature(1);
                        }

                        boolean nozzleHeatFailed = false;

                        if (purgeNozzle0)
                        {
                            nozzleHeatFailed = PrinterUtils.waitUntilTemperatureIsReached(
                                    printer.headProperty().get().getNozzleHeaters().get(0).nozzleTemperatureProperty(),
                                    null, nozzle0Temperature, 5, 300, null);
                        }

                        if (purgeNozzle1 && !nozzleHeatFailed)
                        {
                            nozzleHeatFailed = PrinterUtils.waitUntilTemperatureIsReached(
                                    printer.headProperty().get().getNozzleHeaters().get(1).nozzleTemperatureProperty(),
                                    null, nozzle1Temperature, 5, 300, null);
                        }

                        if (!nozzleHeatFailed)
                        {
                            PrinterRegistry.getInstance().getRemotePrinters().get(printerID).purgeMaterial(purgeNozzle0, purgeNozzle1, safetyOn.get(), false, null);
                        }
                    }
                } catch (PrinterException | InterruptedException ex)
                {
                    steno.error("Exception whilst purging");

                }
            });
            purgeThread.setName("Purge_" + printerID);
            purgeThread.run();
        }
    }

    @POST
    @Timed
    @Path("/removeHead")
    public void removeHead(@PathParam("printerID") String printerID)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).removeHead(null);
            } catch (PrinterException ex)
            {
                steno.error("Exception whilst removing head");
            }
        }
    }

    @POST
    @Timed
    @Path("/clearErrors")
    public void clearErrors(@PathParam("printerID") String printerID)
    {
        PrinterRegistry.getInstance().getRemotePrinters().get(printerID).clearAllErrors();
    }

    /**
     *
     * Expects filament number to be 1 or 2
     *
     * @param printerID
     * @param filamentNumber
     */
    @POST
    @Timed
    @Path("/ejectFilament")
    public void removeHead(@PathParam("printerID") String printerID, int filamentNumber)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).ejectFilament(filamentNumber - 1, null);
            } catch (PrinterException ex)
            {
                steno.error("Exception whilst ejecting filament " + filamentNumber);
            }
        }
    }
}
