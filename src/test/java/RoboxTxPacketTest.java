import celtech.comms.remote.tx.AbortPrint;
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
public class RoboxTxPacketTest
{
    private final ObjectMapper mapper = new ObjectMapper();
    
    public RoboxTxPacketTest()
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
    public void serializesToJSON() throws Exception {
        mapper.enableDefaultTyping();
        final RoboxTxPacket fw =new AbortPrint();
        String mappedValue = mapper.writeValueAsString(fw);
        assertEquals(fixture("fixtures/AbortPrint.json"),
                mappedValue);
    }
}
