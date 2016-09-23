package celtech.roboxremote;

import celtech.roboxbase.comms.remote.Configuration;
import com.codahale.metrics.annotation.Timed;
import java.io.IOException;
import java.io.InputStream;
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

    @POST
    @Timed
    @Path(Configuration.shutdown)
    public void shutdown()
    {
        new Runnable()
        {
            @Override
            public void run()
            {
                steno.info("Running shutdown thread");
                Root.getInstance().stop();
                steno.info("Shutdown thread finished");
            }
        }.run();
    }

    @POST
    @Timed
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/setServerName")
    public Response setServerName(String serverName)
    {
        PrinterRegistry.getInstance().setServerName(serverName);
        return Response.ok().build();
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("updateSystem")
    public Response updateSystem(
            @FormDataParam("file") InputStream uploadedInputStream,
            @FormDataParam("file") FormDataContentDisposition fileDetail) throws IOException
    {
        String uploadedFileLocation = System.getProperty("java.io.tmpdir") + fileDetail.getFileName();
        steno.info("Upgrade file " + uploadedFileLocation + " has been uploaded");
        // save it
        utils.writeToFile(uploadedInputStream, uploadedFileLocation);
        Root.getInstance().stop();
        return Response.ok().build();
    }
}
