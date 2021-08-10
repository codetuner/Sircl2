using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLogging.Models
{
    public class BaseEditModel<TItem>
    {
        public TItem Item { get; set; }

        public bool HasChanges { get; set; }
    }
}
