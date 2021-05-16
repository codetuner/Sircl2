using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Models
{
    public class BaseEditModel<TItem>
    {
        public TItem Item { get; set; }
        
        public string ItemState { get; set; }

        public bool HasChanges { get; set; }

        public bool RequestPublication { get; set; }
        
        public bool Publish { get; set; }
        
        public bool Unpublish { get; set; }
    }
}
