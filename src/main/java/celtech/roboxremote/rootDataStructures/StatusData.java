package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.printerControl.model.PrinterException;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ianhudson
 */
public class StatusData
{

    private String printerName;
    private String printerWebColourString;
    private String printerStatusString;
    private int[] nozzleTemperature;

    public StatusData()
    {
        // Jackson deserialization
    }

    public StatusData(Printer printer)
    {
        printerName = printer.getPrinterIdentity().printerFriendlyNameProperty().get();
        printerWebColourString = printer.getPrinterIdentity().printerColourProperty().get().toString();
        printerStatusString = printer.printerStatusProperty().get().name();

        if (printer.headProperty().get() != null)
        {
            nozzleTemperature = new int[printer.headProperty().get().getNozzleHeaters().size()];
            for (int heaterNumber = 0; heaterNumber < printer.headProperty().get().getNozzleHeaters().size(); heaterNumber++)
            {
                nozzleTemperature[heaterNumber] = printer.headProperty().get().getNozzleHeaters().get(heaterNumber).nozzleTemperatureProperty().get();
            }
        }
    }

    @JsonProperty
    public String getPrinterName()
    {
        return printerName;
    }

    @JsonProperty
    public void setPrinterName(String printerName)
    {
        this.printerName = printerName;
    }

    @JsonProperty
    public String getPrinterWebColourString()
    {
        return printerWebColourString;
    }

    @JsonProperty
    public void setPrinterWebColourString(String printerWebColourString)
    {
        this.printerWebColourString = printerWebColourString;
    }

    @JsonProperty
    public String getPrinterStatusString()
    {
        return printerStatusString;
    }

    @JsonProperty
    public void setPrinterStatusString(String printerStatusString)
    {
        this.printerStatusString = printerStatusString;
    }

    @JsonProperty
    public int[] getNozzleTemperature()
    {
        return nozzleTemperature;
    }

    @JsonProperty
    public void setNozzleTemperature(int[] nozzleTemperature)
    {
        this.nozzleTemperature = nozzleTemperature;
    }

    @JsonIgnore
    public void setNozzleTemperature(int nozzleIndex, int newNozzleTemperature)
    {
        if (nozzleIndex >= 0
                && nozzleIndex < nozzleTemperature.length)
        {
            nozzleTemperature[nozzleIndex] = newNozzleTemperature;
        }
    }
}
