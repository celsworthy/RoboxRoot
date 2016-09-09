package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.printerControl.model.Printer;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 *
 * @author ianhudson
 */
public class StatusData
{

    private String printerName;
    private String printerWebColourString;
    private String printerStatusString;
    private boolean canPrint;
    private boolean canPause;
    private boolean canResume;
    private boolean canPurgeHead;
    private boolean canRemoveHead;
    private boolean canOpenDoor;
    private boolean canCancel;
    private boolean canCalibrateHead;
    private int[] nozzleTemperature;

    public StatusData()
    {
        // Jackson deserialization
    }

    public StatusData(Printer printer)
    {
        printerName = printer.getPrinterIdentity().printerFriendlyNameProperty().get();
        printerWebColourString = printer.getPrinterIdentity().printerColourProperty().get().toString();

        boolean statusProcessed = false;

        switch (printer.busyStatusProperty().get())
        {
            case LOADING_FILAMENT_D:
            case LOADING_FILAMENT_E:
            case UNLOADING_FILAMENT_D:
            case UNLOADING_FILAMENT_E:
                printerStatusString = BaseLookup.i18n(printer.busyStatusProperty().get().getI18nString());
                statusProcessed = true;
                break;
            default:
                break;
        }

        if (!statusProcessed)
        {
            switch (printer.pauseStatusProperty().get())
            {
                case PAUSED:
                case PAUSE_PENDING:
                case RESUME_PENDING:
                    printerStatusString = BaseLookup.i18n(printer.pauseStatusProperty().get().getI18nString());
                    break;
                default:
                    break;
            }
        }
        
        if (!statusProcessed)
        {
            printerStatusString = printer.printerStatusProperty().get().getI18nString();
        }

        if (printer.headProperty().get() != null)
        {
            nozzleTemperature = new int[printer.headProperty().get().getNozzleHeaters().size()];
            for (int heaterNumber = 0; heaterNumber < printer.headProperty().get().getNozzleHeaters().size(); heaterNumber++)
            {
                nozzleTemperature[heaterNumber] = printer.headProperty().get().getNozzleHeaters().get(heaterNumber).nozzleTemperatureProperty().get();
            }
        }
        
        canPrint = printer.canPrintProperty().get();
        canCalibrateHead = printer.canCalibrateHeadProperty().get();
        canCancel = printer.canCancelProperty().get();
        canOpenDoor = printer.canOpenDoorProperty().get();
        canPause = printer.canPauseProperty().get();
        canPurgeHead = printer.canPurgeHeadProperty().get();
        canRemoveHead = printer.canRemoveHeadProperty().get();
        canResume = printer.canResumeProperty().get();
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

    public boolean isCanPrint()
    {
        return canPrint;
    }

    public void setCanPrint(boolean canPrint)
    {
        this.canPrint = canPrint;
    }

    public boolean isCanCalibrateHead()
    {
        return canCalibrateHead;
    }

    public void setCanCalibrateHead(boolean canCalibrateHead)
    {
        this.canCalibrateHead = canCalibrateHead;
    }

    public boolean isCanCancel()
    {
        return canCancel;
    }

    public void setCanCancel(boolean canCancel)
    {
        this.canCancel = canCancel;
    }

    public boolean isCanOpenDoor()
    {
        return canOpenDoor;
    }

    public void setCanOpenDoor(boolean canOpenDoor)
    {
        this.canOpenDoor = canOpenDoor;
    }

    public boolean isCanPause()
    {
        return canPause;
    }

    public void setCanPause(boolean canPause)
    {
        this.canPause = canPause;
    }

    public boolean isCanPurgeHead()
    {
        return canPurgeHead;
    }

    public void setCanPurgeHead(boolean canPurgeHead)
    {
        this.canPurgeHead = canPurgeHead;
    }

    public boolean isCanRemoveHead()
    {
        return canRemoveHead;
    }

    public void setCanRemoveHead(boolean canRemoveHead)
    {
        this.canRemoveHead = canRemoveHead;
    }

    public boolean isCanResume()
    {
        return canResume;
    }

    public void setCanResume(boolean canResume)
    {
        this.canResume = canResume;
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
