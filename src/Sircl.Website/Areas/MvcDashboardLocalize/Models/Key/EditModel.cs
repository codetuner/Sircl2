using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Models.Key
{
    public class EditModel : BaseEditModel<Data.Localize.Key>
    {
        public List<KeyValue> Values { get; set; } = new();

        public Data.Localize.Domain[] Domains { get; internal set; }
    }
}
