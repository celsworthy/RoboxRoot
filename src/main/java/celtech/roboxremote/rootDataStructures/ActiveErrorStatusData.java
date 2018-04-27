package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.comms.rx.FirmwareError;
import celtech.roboxbase.printerControl.PrinterStatus;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;

/**
 *
 * @author taldhous
 */
public class ActiveErrorStatusData
{

    private String printerID;
    //Errors
    private ArrayList<ErrorDetails> activeErrors;

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
            activeErrors = new ArrayList<>();
            for (int errorCounter = 0; errorCounter < printer.getActiveErrors().size(); errorCounter++)
            {
                FirmwareError currentError = printer.getActiveErrors().get(errorCounter);
                if (currentError == FirmwareError.NOZZLE_FLUSH_NEEDED &&
                    printer.printerStatusProperty().get() == PrinterStatus.IDLE)
                {
                    //Suppress NOZZLE_FLUSH if the printer is idle.
                }
                else
                {
                    activeErrors.add(new ErrorDetails(BaseLookup.i18n(currentError.getErrorTitleKey()),
                                                      BaseLookup.i18n(currentError.getErrorMessageKey()),
                                                      currentError.isRequireUserToClear(),
                                                      currentError.getOptions()
                                                                  .stream()
                                                                  .mapToInt((o) -> o.getFlag())
                                                                  .reduce(0, (a, b) -> a & b)));
                }
            }
            if (activeErrors.isEmpty())
                activeErrors = null;
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

    @JsonProperty
    public ArrayList<ErrorDetails> getActiveErrors()
    {
        return activeErrors;
    }

    @JsonProperty
    public void setActiveErrors(ArrayList<ErrorDetails> activeErrors)
    {
        this.activeErrors = activeErrors;
    }
}
