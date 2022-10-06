using Sircl.Website.Logging;
using System.Reflection.Metadata.Ecma335;

namespace Sircl.Website.Areas.MvcDashboardLogging.Models.Home
{
    public class ChartModel
    {
        public ChartModel(string grain, string[] labels, ChartDataSet[] dataSets)
        {
            this.Grain = grain;
            this.Labels = labels;
            this.DataSets = dataSets;
        }

        public string Grain { get; set; }

        public string ChartType { get; set; } = "bar";

        public string[] Labels { get; set; }

        public ChartDataSet[] DataSets { get; set; }
    }

    public class ChartDataSet
    {
        public ChartDataSet(LogAspect forAspect, int[] data)
        {
            this.Label = forAspect.Name;
            this.Color = forAspect.HtmlColor;
            this.Data = data;
        }

        public string Label { get; set; }
        
        public string Color { get; set; }

        public int[] Data { get; set; }
    }
}
