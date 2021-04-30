using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardIdentity.Models.Home
{
    public class TopMenuModel
    {
        public int RoleCount { get; internal set; }
        public int UserCount { get; internal set; }
    }
}
