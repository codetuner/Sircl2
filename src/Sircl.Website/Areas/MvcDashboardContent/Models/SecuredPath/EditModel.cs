using Sircl.Website.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Models.SecuredPath
{
    public class EditModel : BaseEditModel<Data.Content.SecuredPath>
    {
        public List<string> PathsList { get; internal set; }
    }
}
