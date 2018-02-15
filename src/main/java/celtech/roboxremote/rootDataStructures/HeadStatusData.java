package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.PrinterColourMap;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.Filament;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.postprocessor.PrintJobStatistics;
import celtech.roboxbase.printerControl.PrinterStatus;
import celtech.roboxbase.printerControl.model.Head;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.utils.ColourStringConverter;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.IOException;
import javafx.scene.paint.Color;

/**
 *
 * @author taldhous
 */
public class HeadStatusData
{

    private String printerID;

    //Head
    private String headName;
    private boolean dualMaterialHead;
    private int[] nozzleTemperature;

    private boolean canCalibrateHead;
    private boolean canPurgeHead;
    private boolean canRemoveHead;
 
    //Bed
    private int bedTemperature;

    // Ambient
    private int ambientTemperature;

    public HeadStatusData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);

        canCalibrateHead = printer.canCalibrateHeadProperty().get();
        canPurgeHead = false;
        canRemoveHead = printer.canRemoveHeadProperty().get();
     
        //Head
        if (printer.headProperty().get() != null)
        {
            headName = printer.headProperty().get().nameProperty().get();
            dualMaterialHead = printer.headProperty().get().headTypeProperty().get() == Head.HeadType.DUAL_MATERIAL_HEAD;

            if (dualMaterialHead)
            {
                canPurgeHead = printer.reelsProperty().containsKey(0) && printer.reelsProperty().containsKey(1) && printer.canPurgeHeadProperty().get();
            } else
            {
                canPurgeHead = printer.reelsProperty().containsKey(0) && printer.canPurgeHeadProperty().get();
            }

            nozzleTemperature = new int[printer.headProperty().get().getNozzleHeaters().size()];
            for (int heaterNumber = 0; heaterNumber < printer.headProperty().get().getNozzleHeaters().size(); heaterNumber++)
            {
                nozzleTemperature[heaterNumber] = printer.headProperty().get().getNozzleHeaters().get(heaterNumber).nozzleTemperatureProperty().get();
            }
        } else
        {
            headName = "";
        }

        bedTemperature = printer.getPrinterAncillarySystems().bedTemperatureProperty().get();

        ambientTemperature = printer.getPrinterAncillarySystems().ambientTemperatureProperty().get();
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

    public boolean isCanCalibrateHead()
    {
        return canCalibrateHead;
    }

    public void setCanCalibrateHead(boolean canCalibrateHead)
    {
        this.canCalibrateHead = canCalibrateHead;
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

    public String getHeadName()
    {
        return headName;
    }

    public void setHeadName(String headName)
    {
        this.headName = headName;
    }

    public boolean isDualMaterialHead()
    {
        return dualMaterialHead;
    }

    public void setDualMaterialHead(boolean dualMaterialHead)
    {
        this.dualMaterialHead = dualMaterialHead;
    }

    public int getBedTemperature()
    {
        return bedTemperature;
    }

    public void setBedTemperature(int bedTemperature)
    {
        this.bedTemperature = bedTemperature;
    }

    public int getAmbientTemperature()
    {
        return ambientTemperature;
    }

    public void setAmbientTemperature(int ambientTemperature)
    {
        this.ambientTemperature = ambientTemperature;
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
