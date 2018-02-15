package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author taldhous
 */
public class ActiveErrorStatusData
{

    private String printerID;
    //Errors
    private String[] activeErrors;

    public ActiveErrorStatusData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);

        if (!printer.getActiveErrors().isEmpty())
        {
            activeErrors = new String[printer.getActiveErrors().size()];
            for (int errorCounter = 0; errorCounter < printer.getActiveErrors().size(); errorCounter++)
            {
                activeErrors[errorCounter] = BaseLookup.i18n(printer.getActiveErrors().get(errorCounter).getErrorTitleKey());
            }
        }
    }

    @JsonProperty
    public String getPrinterID()
    {
        return printerID;
    }

    @JsonProperty
    public void setPrinterID(String printerID)
    {
        this.printerID = printerID;
    }

    public String[] getActiveErrors()
    {
        return activeErrors;
    }

    public void setActiveErrors(String[] activeErrors)
    {
        this.activeErrors = activeErrors;
    }
}
