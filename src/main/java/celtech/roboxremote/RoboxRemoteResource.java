package celtech.roboxremote;

import celtech.printerControl.comms.commands.tx.RoboxTxPacket;
import celtech.roboxremotelibrary.PrinterList;
import com.codahale.metrics.annotation.Timed;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

/**
 *
 * @author Ian
 */
@Path("/printerControl")
@Produces(MediaType.APPLICATION_JSON)
public class RoboxRemoteResource
{

    private final String template;
    private final String defaultName;
    private final AtomicLong counter;

    public RoboxRemoteResource(String template, String defaultName)
    {
        this.template = template;
        this.defaultName = defaultName;
        this.counter = new AtomicLong();
    }

//    @GET
//    @Timed
//    public Saying listPrinters(@QueryParam("listPrinters") String name) {
//        final String value = String.format(template, name);
//        return new Saying(counter.incrementAndGet(), value);
//    }
//
    @GET
    @Timed
    public PrinterList listPrinters()
    {
//        final String value = String.format(template, name);
        return new PrinterList();
    }

    @POST
    @Timed
    public void writeAndWaitForData(RoboxTxPacket messageToWrite)
    {
    }

    @POST
    @Timed
    public byte[] readData(int bytesToRead)
    {
        return new byte[3];
    }
}
