package celtech.roboxremote;

import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.printerControl.model.Head;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.printerControl.model.PrinterException;
import celtech.roboxbase.utils.PrinterUtils;
import celtech.roboxremote.rootDataStructures.ActiveErrorStatusData;
import celtech.roboxremote.rootDataStructures.ControlStatusData;
import celtech.roboxremote.rootDataStructures.HeadStatusData;
import celtech.roboxremote.rootDataStructures.MaterialStatusData;
import celtech.roboxremote.rootDataStructures.NameStatusData;
import celtech.roboxremote.rootDataStructures.PrintJobStatusData;
import celtech.roboxremote.rootDataStructures.StatusData;
import celtech.roboxbase.comms.remote.clear.SuitablePrintJob;
import celtech.roboxbase.configuration.Macro;
import com.codahale.metrics.annotation.Timed;
import io.dropwizard.jersey.params.BooleanParam;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import javafx.application.Platform;
import javafx.scene.paint.Color;
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
            returnVal.updateFromPrinterData(printerID);
        }
        return returnVal;
    }

    @GET
    @Timed
    @Path("headStatus")
    public HeadStatusData getHeadStatus(@PathParam("printerID") String printerID)
    {
        HeadStatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new HeadStatusData();
            returnVal.updateFromPrinterData(printerID);
        }
        return returnVal;
    }

    @GET
    @Timed
    @Path("materialStatus")
    public MaterialStatusData getMaterialStatus(@PathParam("printerID") String printerID)
    {
        MaterialStatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new MaterialStatusData();
            returnVal.updateFromPrinterData(printerID);
        }
        return returnVal;
    }

    @GET
    @Timed
    @Path("nameStatus")
    public NameStatusData getNameStatus(@PathParam("printerID") String printerID)
    {
        NameStatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new NameStatusData();
            returnVal.updateFromPrinterData(printerID);
        }
        return returnVal;
    }

    @GET
    @Timed
    @Path("printJobStatus")
    public PrintJobStatusData getPrintJobStatus(@PathParam("printerID") String printerID)
    {
        PrintJobStatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new PrintJobStatusData();
            returnVal.updateFromPrinterData(printerID);
        }
        return returnVal;
    }

    @GET
    @Timed
    @Path("controlStatus")
    public ControlStatusData getControlStatus(@PathParam("printerID") String printerID)
    {
        ControlStatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new ControlStatusData();
            returnVal.updateFromPrinterData(printerID);
        }
        return returnVal;
    }
    
    @GET
    @Timed
    @Path("activeErrorStatus")
    public ActiveErrorStatusData getActiveErrorStatus(@PathParam("printerID") String printerID)
    {
        ActiveErrorStatusData returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            returnVal = new ActiveErrorStatusData();
            returnVal.updateFromPrinterData(printerID);
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
    public void cancel(@PathParam("printerID") String printerID, BooleanParam safetyOn)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).cancel(null, safetyOn.get());
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
    public void removeHead(@PathParam("printerID") String printerID, BooleanParam safetyOn)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            try
            {
                PrinterRegistry.getInstance().getRemotePrinters().get(printerID).removeHead(null, safetyOn.get());
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
                steno.error("Exception whilst ejecting filament " + filamentNumber + ": " + ex);
            }
        }
    }

    @POST
    @Timed
    @Path("/listReprintableJobs")
    public List<SuitablePrintJob> listReprintableJobs(@PathParam("printerID") String printerID)
    {
        List<SuitablePrintJob> returnVal = null;
        if (PrinterRegistry.getInstance() != null)
        {
            Printer printerToUse = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
            returnVal = printerToUse.listJobsReprintableByMe();
        }
        return returnVal;
    }

    @POST
    @Timed
    @Path("/reprintJob")
    public Response reprintJob(@PathParam("printerID") String printerID, String printJobID)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            Printer printerToUse = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
            Platform.runLater(() ->
            {
                printerToUse.reprintJob(Utils.cleanInboundJSONString(printJobID));
            });
        }

        Response response = Response.ok().build();
        return response;
    }

    @POST
    @Timed
    @Path("/executeGCode")
    public Response executeGCode(@PathParam("printerID") String printerID, String gcode)
    {
        if (PrinterRegistry.getInstance() != null)
        {
            String[] gcodeParts = Utils.cleanInboundJSONString(gcode).split(":");
            Printer printerToUse = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
            for (String gcodePart : gcodeParts)
            {
                printerToUse.sendRawGCode(gcodePart, false);
            }
        }

        Response response = Response.ok().build();
        return response;
    }

    @POST
    @Timed
    @Path("/runMacro")
    public Response runMacro(@PathParam("printerID") String printerID, String macroName)
    {
        Response response = Response.serverError().build();

        //We should either just get a plain macro name or the macro|<T|F>|<T|F>|<T|F>
        //This represents Requires N1, Requires N2, Require safety features
        if (PrinterRegistry.getInstance() != null)
        {
            String inputString = Utils.cleanInboundJSONString(macroName);
            String[] parts = inputString.split("\\|");
            Macro macroToRun = null;
            Printer printerToUse = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);

            if (parts.length != 4)
            {
                macroToRun = Macro.valueOf(Utils.cleanInboundJSONString(macroName));
                try
                {
                    printerToUse.executeMacroWithoutPurgeCheck(macroToRun);
                    response = Response.ok().build();
                } catch (PrinterException ex)
                {
                    steno.exception("Exception whilst attempting to run macro with name " + macroName, ex);
                }
            } else
            {
                macroToRun = Macro.valueOf(parts[0]);
                boolean requiresN1 = parts[1].toLowerCase().equals("T");
                boolean requiresN2 = parts[2].toLowerCase().equals("T");
                boolean requiresSafeties = parts[3].toLowerCase().equals("T");
                try
                {
                    printerToUse.executeMacroWithoutPurgeCheck(macroToRun, requiresN1, requiresN2, requiresSafeties);
                    response = Response.ok().build();
                } catch (PrinterException ex)
                {
                    steno.exception("Exception whilst attempting to run macro with name " + macroName, ex);
                }
            }
        }

        return response;
    }

    @POST
    @Timed
    @Path("/renamePrinter")
    public Response renamePrinter(@PathParam("printerID") String printerID, String newName)
    {
        boolean success = false;
        if (PrinterRegistry.getInstance() != null)
        {
            Printer printerToUse = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
            try
            {
                printerToUse.updatePrinterName(Utils.cleanInboundJSONString(newName));
                success = true;
            } catch (PrinterException ex)
            {

            }
        }

        Response response = Response.ok().build();
        if (!success)
        {
            response = Response.status(Response.Status.NOT_ACCEPTABLE).build();
        }
        return response;
    }

    @POST
    @Timed
    @Path("/changePrinterColour")
    public Response changePrinterColour(@PathParam("printerID") String printerID, String newWebColour)
    {
        boolean success = false;
        if (PrinterRegistry.getInstance() != null)
        {
            Printer printerToUse = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
            try
            {
                printerToUse.updatePrinterDisplayColour(Color.web(Utils.cleanInboundJSONString(newWebColour)));
                success = true;
            } catch (PrinterException ex)
            {

            }
        }

        Response response = Response.ok().build();
        if (!success)
        {
            response = Response.status(Response.Status.NOT_ACCEPTABLE).build();
        }
        return response;
    }
}
