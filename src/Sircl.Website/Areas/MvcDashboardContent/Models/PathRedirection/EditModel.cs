using System.Collections.Generic;

namespace Sircl.Website.Areas.MvcDashboardContent.Models.PathRedirection
{
    public class EditModel : BaseEditModel<Data.Content.PathRedirection>
    {
        public List<string> PathsList { get; internal set; }
    }
}
