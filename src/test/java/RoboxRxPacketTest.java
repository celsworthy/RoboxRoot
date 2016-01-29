import celtech.comms.remote.rx.PrinterIDResponse;
import celtech.comms.remote.rx.RoboxRxPacket;
import celtech.comms.remote.tx.RoboxTxPacket;
import com.fasterxml.jackson.databind.ObjectMapper;
import static io.dropwizard.testing.FixtureHelpers.fixture;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author Ian
 */
public class RoboxRxPacketTest
{
    private final ObjectMapper mapper = new ObjectMapper();
    
    public RoboxRxPacketTest()
    {
    }
    
    @BeforeClass
    public static void setUpClass()
    {
    }
    
    @AfterClass
    public static void tearDownClass()
    {
    }
    
    @Before
    public void setUp()
    {
    }
    
    @After
    public void tearDown()
    {
    }

    @Test
    public void serializesAbortPrintToJSON() throws Exception {
        final RoboxRxPacket fw =new PrinterIDResponse();
        fw.setSequenceNumber(44);
        String mappedValue = mapper.writeValueAsString(fw);
        assertEquals(fixture("fixtures/PrinterIDResponse.json"),
                mappedValue);
    }
    
       @Test
    public void deserializesFromJSON() throws Exception {
        final RoboxRxPacket abort = new PrinterIDResponse();
        abort.setSequenceNumber(44);
        try
        {
            RoboxRxPacket packetRec = mapper.readValue(fixture("fixtures/PrinterIDResponse.json"), RoboxRxPacket.class);
        assertEquals(abort, packetRec);
        }
        catch (Exception e)
        {
            System.out.println(e.getCause().getMessage());
            fail();
        }
    }
}
