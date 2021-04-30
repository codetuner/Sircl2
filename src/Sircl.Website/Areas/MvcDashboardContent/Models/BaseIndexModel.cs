using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Models
{
    public class BaseIndexModel<TItem>
    {
        public TItem[] Items { get; internal set; }

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public int MaxPage { get; set; } = 1;

        public string Query { get; set; }
    }
}
