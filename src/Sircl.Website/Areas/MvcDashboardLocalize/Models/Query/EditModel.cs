using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Models.Query
{
    public class EditModel : BaseEditModel<Data.Localize.Query>
    {
        public Data.Localize.Domain[] Domains { get; internal set; }
    }
}
