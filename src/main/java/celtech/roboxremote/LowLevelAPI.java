package celtech.roboxremote;

import celtech.roboxbase.comms.RoboxCommsManager;
import celtech.roboxbase.comms.remote.Configuration;
import celtech.roboxbase.comms.rx.RoboxRxPacket;
import celtech.roboxbase.comms.tx.RoboxTxPacket;
import celtech.roboxbase.comms.exceptions.RoboxCommsException;
import celtech.roboxbase.comms.tx.ReportErrors;
import celtech.roboxbase.comms.tx.StatusRequest;
import com.codahale.metrics.annotation.Timed;
import javax.ws.rs.Consumes;
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
@Path("/{printerID}" + Configuration.lowLevelAPIService)
@Produces(MediaType.APPLICATION_JSON)
public class LowLevelAPI
{

    private final Stenographer steno = StenographerFactory.getStenographer(LowLevelAPI.class.getName());
    private final PrinterRegistry printerRegistry;
    private final RoboxCommsManager commsManager;

    public LowLevelAPI()
    {
        this.printerRegistry = null;
        this.commsManager = null;
    }

    public LowLevelAPI(String template, String defaultName)
    {
        printerRegistry = PrinterRegistry.getInstance();
        commsManager = RoboxCommsManager.getInstance();
    }

    @POST
    @Timed
    @Path(Configuration.connectService)
    public boolean connect(@PathParam("printerID") String printerID)
    {
//        printerRegistry.getRemotePrinters().get(printerID).getCommandInterface().operateRemotely(true);
        steno.info("Was asked to connect to " + printerID);
        return true;
    }

    @POST
    @Timed
    @Path(Configuration.disconnectService)
    public void disconnect(@PathParam("printerID") String printerID)
    {
        steno.info("Was asked to disconnect from " + printerID);
//        printerRegistry.getRemotePrinters().get(printerID).getCommandInterface().operateRemotely(false);
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

        if (remoteTx instanceof StatusRequest)
        {
            rxPacket = printerRegistry.getRemotePrinters().get(printerID).getCommandInterface().getLastStatusResponse();
        } else if (remoteTx instanceof ReportErrors)
        {
            rxPacket = printerRegistry.getRemotePrinters().get(printerID).getCommandInterface().getLastErrorResponse();
        } else
        {
            try
            {
                rxPacket = printerRegistry.getRemotePrinters().get(printerID).getCommandInterface().writeToPrinter(remoteTx, true);
            } catch (RoboxCommsException ex)
            {
                steno.error("Failed whilst writing to local printer with ID" + printerID);
            }
        }

        return rxPacket;
    }

//    @POST
//    @Timed
//    public void writeAndWaitForData(String remotePrinterID, RoboxTxPacket messageToWrite)
//    {
//        printerRegistry.getRemotePrinters().get(remotePrinterID).getCommandInterface().wr
//    }
//
//    @POST
//    @Timed
//    public byte[] readData(String remotePrinterID, int bytesToRead)
//    {
//        return new byte[3];
//    }
}
