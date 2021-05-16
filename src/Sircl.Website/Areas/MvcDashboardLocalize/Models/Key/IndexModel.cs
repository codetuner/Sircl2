using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Models.Key
{
    public class IndexModel : BaseIndexModel<Data.Localize.Key>
    {
        public int? DomainId { get; set; }

        public List<SelectListItem> Domains { get; internal set; }
    }
}
