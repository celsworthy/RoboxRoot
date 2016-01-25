package celtech.roboxremote;

import celtech.Lookup;
import celtech.printerControl.model.Head;
import celtech.printerControl.model.Printer;
import celtech.printerControl.model.Reel;
import celtech.roboxbase.utils.SystemUtils;
import celtech.utils.PrinterListChangesListener;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import libertysystems.stenographer.Stenographer;
import libertysystems.stenographer.StenographerFactory;

/**
 *
 * @author ianhudson
 */
public class PrinterRegistry implements PrinterListChangesListener
{

    private final Stenographer steno = StenographerFactory.getStenographer(PrinterRegistry.class.getName());
    private static PrinterRegistry instance = null;
    private final Map<String, Printer> remotePrinters = new HashMap<>();
    private final List<String> remotePrinterIDs = new ArrayList<>();

    private PrinterRegistry()
    {
        Lookup.getPrinterListChangesNotifier().addListener(this);
    }

    public static PrinterRegistry getInstance()
    {
        if (instance == null)
        {
            instance = new PrinterRegistry();
        }

        return instance;
    }

    public Map<String, Printer> getRemotePrinters()
    {
        return remotePrinters;
    }

    public List<String> getRemotePrinterIDs()
    {
        return remotePrinterIDs;
    }
    
    @Override
    public void whenPrinterAdded(Printer printer)
    {
        if (!remotePrinters.containsValue(printer))
        {

            String printerID = null;

            do
            {
                printerID = SystemUtils.generate16DigitID();
            } while (remotePrinters.containsKey(printerID));

            steno.info("New printer detected - id is " + printerID);
            remotePrinters.put(printerID, printer);
            remotePrinterIDs.add(printerID);
        }
    }

    @Override
    public void whenPrinterRemoved(Printer printer)
    {
        for (Entry<String, Printer> printerEntry : remotePrinters.entrySet())
        {
            if (printerEntry.getValue() == printer)
            {
                remotePrinters.remove(printerEntry.getKey());
                remotePrinterIDs.remove(printerEntry.getKey());
                steno.info("Printer with id " + printerEntry.getKey() + " removed");
                break;
            }
        }
    }

    @Override
    public void whenHeadAdded(Printer printer)
    {
    }

    @Override
    public void whenHeadRemoved(Printer printer, Head head)
    {
    }

    @Override
    public void whenReelAdded(Printer printer, int reelIndex)
    {
    }

    @Override
    public void whenReelRemoved(Printer printer, Reel reel, int reelIndex)
    {
    }

    @Override
    public void whenReelChanged(Printer printer, Reel reel)
    {
    }

    @Override
    public void whenExtruderAdded(Printer printer, int extruderIndex)
    {
    }

    @Override
    public void whenExtruderRemoved(Printer printer, int extruderIndex)
    {
    }
}
