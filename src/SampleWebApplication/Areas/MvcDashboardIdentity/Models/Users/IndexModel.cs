using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Areas.MvcDashboardIdentity.Models.Users
{
    public class IndexModel
    {
        public DataPage<IdentityUser> DataPage { get; set; }
    }
}
