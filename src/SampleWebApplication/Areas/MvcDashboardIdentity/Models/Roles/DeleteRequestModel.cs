using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Areas.MvcDashboardIdentity.Models.Roles
{
    public class DeleteRequestModel
    {
        public IdentityRole Item { get; set; }
    }
}
