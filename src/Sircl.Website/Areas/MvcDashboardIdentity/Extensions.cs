using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardIdentity
{
    public static class Extensions
    {
        public static bool IsLockedout(this IdentityUser user)
        {
            return (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow);
        }
    }
}
