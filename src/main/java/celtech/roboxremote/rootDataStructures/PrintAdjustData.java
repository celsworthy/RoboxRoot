package celtech.roboxremote.rootDataStructures;

import celtech.roboxbase.BaseLookup;
import celtech.roboxbase.PrinterColourMap;
import celtech.roboxbase.configuration.BaseConfiguration;
import celtech.roboxbase.configuration.Filament;
import celtech.roboxbase.configuration.datafileaccessors.FilamentContainer;
import celtech.roboxbase.postprocessor.PrintJobStatistics;
import celtech.roboxbase.printerControl.PrintJob;
import celtech.roboxbase.printerControl.PrinterStatus;
import celtech.roboxbase.printerControl.model.Head;
import celtech.roboxbase.printerControl.model.HeaterMode;
import celtech.roboxbase.printerControl.model.Printer;
import celtech.roboxbase.utils.ColourStringConverter;
import celtech.roboxremote.PrinterRegistry;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.IOException;
import javafx.scene.paint.Color;

/**
 *
 * @author ianhudson
 */
public class PrintAdjustData
{
    private String printerID;

    // Head
    private boolean dualMaterialHead = false;
    private boolean printingFirstLayer = false;
    
    private int nNozzleHeaters = 0;
    private float nozzle0TargetTemp = 0.0F;
    private float nozzle1TargetTemp = 0.0F;

    // Bed
    private float bedTargetTemp = 0.0F;

    // Material
    private int nMaterials = 0;
    private boolean usingMaterial0 = true;
    private boolean usingMaterial1 = true;
    private String material0Name = "";
    private String material1Name = "";
    private float flowRate0Multiplier = 0.0F;
    private float flowRate1Multiplier = 0.0F;
    private float extrusionRate0Multiplier = 0.0F;
    private float extrusionRate1Multiplier = 0.0F;
    
    public PrintAdjustData()
    {
        // Jackson deserialization
    }

    public void updateFromPrinterData(String printerID)
    {
        this.printerID = printerID;
        Printer printer = PrinterRegistry.getInstance().getRemotePrinters().get(printerID);
        PrintJob currentPrintJob = printer.getPrintEngine().printJobProperty().get();
        PrintJobStatistics currentPrintJobStatistics = null;
        try
        {
            currentPrintJobStatistics = currentPrintJob.getStatistics();
            if (currentPrintJobStatistics != null)
            {
                usingMaterial0 = (currentPrintJobStatistics.geteVolumeUsed() > 0);
                usingMaterial1 = (currentPrintJobStatistics.getdVolumeUsed() > 0);
            }
        } catch (Exception ex)
        {
//            steno.error("Failed to get print job statistics for tweaks page");
        }
        
        nMaterials = 1;
        if (printer.extrudersProperty().size() == 2
                && printer.extrudersProperty().get(1) != null
                && printer.extrudersProperty().get(1).isFittedProperty().get())
        {
            nMaterials = 2;
        }
        
        if (nMaterials > 0 && usingMaterial0)
        {
            if (printer.effectiveFilamentsProperty().get(0) != FilamentContainer.UNKNOWN_FILAMENT)
            {
                Filament filament = printer.effectiveFilamentsProperty().get(0);
                material0Name = filament.getFriendlyFilamentName();
            }
            if (printer.extrudersProperty().get(0).isFittedProperty().get())
            {
                extrusionRate0Multiplier = printer.extrudersProperty().get(0).extrusionMultiplierProperty().floatValue() * 100.0F;
                flowRate0Multiplier = printer.getPrinterAncillarySystems().feedRateDMultiplierProperty().floatValue() * 100.0F;
            }
        }
        if (nMaterials > 1)
        {
            if (printer.effectiveFilamentsProperty().get(1) != FilamentContainer.UNKNOWN_FILAMENT)
            {
                Filament filament = printer.effectiveFilamentsProperty().get(1);
                material1Name = filament.getFriendlyFilamentName();
            }
            if (printer.extrudersProperty().get(1).isFittedProperty().get())
            {
                extrusionRate1Multiplier = printer.extrudersProperty().get(1).extrusionMultiplierProperty().floatValue() * 100.0F;
                flowRate1Multiplier = printer.getPrinterAncillarySystems().feedRateEMultiplierProperty().floatValue() * 100.0F;
            }
        }

        //Head
        Head head = printer.headProperty().get();
        if (head != null)
        {
            printingFirstLayer = (head.getNozzleHeaters().get(0).heaterModeProperty().get() == HeaterMode.FIRST_LAYER);

            dualMaterialHead = head.headTypeProperty().get() == Head.HeadType.DUAL_MATERIAL_HEAD;
            nNozzleHeaters = head.getNozzleHeaters().size();
            nozzle0TargetTemp = 0.0F;
            nozzle1TargetTemp = 0.0F;
            if (nNozzleHeaters == 1)
            {
                if (printingFirstLayer)
                    nozzle0TargetTemp = head.getNozzleHeaters().get(0).nozzleFirstLayerTargetTemperatureProperty().floatValue();
                else
                    nozzle0TargetTemp = head.getNozzleHeaters().get(0).nozzleTargetTemperatureProperty().floatValue();
            }
            if (nNozzleHeaters > 1)
            {
                if (printingFirstLayer)
                {
                    nozzle0TargetTemp = head.getNozzleHeaters().get(1).nozzleFirstLayerTargetTemperatureProperty().floatValue();
                    nozzle1TargetTemp = head.getNozzleHeaters().get(0).nozzleFirstLayerTargetTemperatureProperty().floatValue();
                }
                else
                {
                    nozzle0TargetTemp = head.getNozzleHeaters().get(1).nozzleTargetTemperatureProperty().floatValue();
                    nozzle1TargetTemp = head.getNozzleHeaters().get(0).nozzleTargetTemperatureProperty().floatValue();
                }
            }
        }
        
        bedTargetTemp = printer.getPrinterAncillarySystems().bedTemperatureProperty().get();
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
    public boolean getDualMaterialHead()
    {
        return dualMaterialHead;
    }

    @JsonProperty
    public void setDualMaterialHead(boolean dualMaterialHead)
    {
        this.dualMaterialHead = dualMaterialHead;
    }

    @JsonProperty
    public boolean getUsingMaterial0()
    {
        return usingMaterial0;
    }

    @JsonProperty
    public void getUsingMaterial0(boolean usingMaterial)
    {
        this.usingMaterial0 = usingMaterial;
    }

    @JsonProperty
    public boolean getUsingMaterial1()
    {
        return usingMaterial1;
    }

    @JsonProperty
    public void getUsingMaterial1(boolean usingMaterial)
    {
        this.usingMaterial1 = usingMaterial;
    }

    @JsonProperty
    public boolean getPrintingFirstLayer()
    {
        return printingFirstLayer;
    }

    @JsonProperty
    public void setPrintingFirstLayer(boolean printingFirstLayer)
    {
        this.printingFirstLayer = printingFirstLayer;
    }

    @JsonProperty
    public float getBedTargetTemp()
    {
        return bedTargetTemp;
    }

    @JsonProperty
    public void setBedTargetTemp(float bedTargetTemp)
    {
        this.bedTargetTemp = bedTargetTemp;
    }

    @JsonProperty
    public float getNozzle0TargetTemp()
    {
        return nozzle0TargetTemp;
    }

    @JsonProperty
    public void setNozzle0TargetTemp(float targetTemp)
    {
        this.nozzle0TargetTemp = targetTemp;
    }
    
    @JsonProperty
    public float getNozzle1TargetTemp()
    {
        return nozzle1TargetTemp;
    }

    @JsonProperty
    public void setNozzle1TargetTemp(float targetTemp)
    {
        this.nozzle1TargetTemp = targetTemp;
    }

    @JsonProperty
    public String getMaterial0Name()
    {
        return material0Name;
    }

    @JsonProperty
    public void setMaterial0Name(String materialName)
    {
        this.material0Name = materialName;
    }

    @JsonProperty
    public String getMaterial1Name()
    {
        return material1Name;
    }

    @JsonProperty
    public void setMaterial1Name(String materialName)
    {
        this.material1Name = materialName;
    }
    
    @JsonProperty
    public float getExtrusionRate0Multiplier()
    {
        return extrusionRate0Multiplier;
    }

    @JsonProperty
    public void setExtrusionRate0Multiplier(float extrusionRateMultiplier)
    {
        this.extrusionRate0Multiplier = extrusionRateMultiplier;
    }

    @JsonProperty
    public float getExtrusionRate1Multiplier()
    {
        return extrusionRate1Multiplier;
    }

    @JsonProperty
    public void setExtrusionRate1Multiplier(float extrusionRateMultiplier)
    {
        this.extrusionRate1Multiplier = extrusionRateMultiplier;
    }

    @JsonProperty
    public float getFlowRate0Multiplier()
    {
        return flowRate0Multiplier;
    }

    @JsonProperty
    public void setFlowRate0Multiplier(float flowRateMultiplier)
    {
        this.flowRate0Multiplier = flowRateMultiplier;
    }

    @JsonProperty
    public float getFlowRate1Multiplier()
    {
        return flowRate1Multiplier;
    }

    @JsonProperty
    public void setFlowRate1Multiplier(float flowRateMultiplier)
    {
        this.flowRate1Multiplier = flowRateMultiplier;
    }
}
