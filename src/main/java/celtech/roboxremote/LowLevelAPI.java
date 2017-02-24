package celtech.roboxremote;

import celtech.roboxbase.comms.remote.Configuration;
import celtech.roboxbase.comms.rx.RoboxRxPacket;
import celtech.roboxbase.comms.tx.RoboxTxPacket;
import celtech.roboxbase.comms.exceptions.RoboxCommsException;
import celtech.roboxbase.comms.rx.RoboxRxPacketFactory;
import celtech.roboxbase.comms.rx.RxPacketTypeEnum;
import celtech.roboxbase.comms.tx.ReportErrors;
import celtech.roboxbase.comms.tx.StatusRequest;
import com.codahale.metrics.annotation.Timed;
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
                rxPacket = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getCommandInterface().getLastStatusResponse();
            } else if (remoteTx instanceof ReportErrors)
            {
                rxPacket = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getCommandInterface().getLastErrorResponse();
            } else
            {
                try
                {
                    rxPacket = PrinterRegistry.getInstance().getRemotePrinters().get(printerID).getCommandInterface().writeToPrinter(remoteTx, true);
                } catch (RoboxCommsException ex)
                {
                    steno.error("Failed whilst writing to local printer with ID" + printerID);
                }
            }
        }

        return rxPacket;
    }
}
