package celtech.roboxremote;

import celtech.roboxbase.comms.remote.Configuration;
import celtech.roboxbase.comms.rx.RoboxRxPacket;
import celtech.roboxbase.comms.tx.RoboxTxPacket;
import celtech.roboxbase.comms.exceptions.RoboxCommsException;
import celtech.roboxbase.comms.rx.PrinterIDResponse;
import celtech.roboxbase.comms.rx.RoboxRxPacketFactory;
import celtech.roboxbase.comms.rx.RxPacketTypeEnum;
import celtech.roboxbase.comms.tx.ReadPrinterID;
import celtech.roboxbase.comms.tx.ReportErrors;
import celtech.roboxbase.comms.tx.SendDataFileChunk;
import celtech.roboxbase.comms.tx.SendDataFileEnd;
import celtech.roboxbase.comms.tx.SendDataFileStart;
import celtech.roboxbase.comms.tx.SendPrintFileStart;
import celtech.roboxbase.comms.tx.StatusRequest;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.Filament;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.postprocessor.PrintJobStatistics;
import com.codahale.metrics.annotation.Timed;
import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;
import javax.annotation.security.RolesAllowed;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author Ian
 */
@RolesAllowed("root")
@Path("/{printerID}" + Configuration.lowLevelAPIService)
@Produces(MediaType.APPLICATION_JSON)
public class LowLevelAPI
{

    private final Stenographer steno = StenographerFactory.getStenographer(LowLevelAPI.class.getName());

    public LowLevelAPI()
    {
    }

    @POST
    @Timed
    @Path(Configuration.connectService)
    public Response connect(@PathParam("printerID") String printerID)
    {
        steno.info("Was asked to connect to " + printerID);
        return Response.ok().build();
    }

    @POST
    @Timed
    @Path(Configuration.disconnectService)
    public Response disconnect(@PathParam("printerID") String printerID)
    {
        steno.info("Was asked to disconnect from " + printerID);
        return Response.ok().build();
    }

    @POST
    @Timed
    @Path(Configuration.writeDataService)
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public RoboxRxPacket writeToPrinter(@PathParam("printerID") String printerID,
            RoboxTxPacket remoteTx)
    {
        RoboxRxPacket rxPacket = null;

        if (PrinterRegistry.getInstance() != null
                && !PrinterRegistry.getInstance().getRemotePrinterIDs().contains(printerID))
        {
            rxPacket = RoboxRxPacketFactory.createPacket(RxPacketTypeEnum.PRINTER_NOT_FOUND);
        } else
        {
            if (remoteTx instanceof StatusRequest)
            {
                rxPacket = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getLastStatusResponse();
            } else if (remoteTx instanceof ReportErrors)
            {
                rxPacket = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getLastErrorResponse();
            } else
            {
                try
                {
                    rxPacket = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getCommandInterface().writeToPrinter(remoteTx, false);
                } catch (RoboxCommsException ex)
                {
                    steno.error("Failed whilst writing to local printer with ID" + printerID);
                }

                if (remoteTx instanceof SendPrintFileStart
                        || remoteTx instanceof SendDataFileStart)
                {
                    PrintJobPersister.getInstance().startFile(remoteTx.getMessagePayload());
                    PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getPrintEngine().takingItThroughTheBackDoor(true);
                } else if (remoteTx instanceof SendDataFileChunk)
                {
                    String payload = remoteTx.getMessagePayload();
                    PrintJobPersister.getInstance().writeSegment(payload);
                } else if (remoteTx instanceof SendDataFileEnd)
                {
                    PrintJobPersister.getInstance().closeFile(remoteTx.getMessagePayload());
                    PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getPrintEngine().takingItThroughTheBackDoor(false);
                }
            }
        }

        return rxPacket;
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Path(Configuration.sendStatisticsService)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response provideStatistics(@PathParam("printerID") String printerID,
            PrintJobStatistics statistics)
    {
        Response response;
        String statsFileLocation = BaseConfiguration.getPrintSpoolDirectory() + statistics.getPrintJobID() + File.separator + statistics.getPrintJobID() + BaseConfiguration.statisticsFileExtension;
        try
        {
            statistics.writeStatisticsToFile(statsFileLocation);
            response = Response.ok().build();
        } catch (IOException ex)
        {
            response = Response.serverError().build();
        }
        return response;
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Path(Configuration.retrieveStatisticsService)
    @Produces(MediaType.APPLICATION_JSON)
    public PrintJobStatistics retrieveStatistics(@PathParam("printerID") String printerID,
            String printJobID)
    {
        PrintJobStatistics statistics = null;
        try
        {
            statistics = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getPrintEngine().printJobProperty().get().getStatistics();
        } catch (IOException ex)
        {

        }

        return statistics;
    }

    @RolesAllowed("root")
    @POST
    @Timed
    @Path(Configuration.overrideFilamentService)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response overrideFilament(@PathParam("printerID") String printerID,
            Map<Integer, String> filamentMap)
    {
        Response response;
        Entry<Integer, String> filamentEntry = filamentMap.entrySet().iterator().next();
        Filament chosenFilament = FilamentContainer.getInstance().getFilamentByID(filamentEntry.getValue());
        if (chosenFilament != null)
        {
            PrinterRegistry.getInstance().getRemotePrinters().get(printerID).overrideFilament(filamentEntry.getKey(), chosenFilament);
            response = Response.ok().build();
        } else
        {
            response = Response.serverError().build();
        }
        return response;
    }
}
