using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardIdentity.Controllers
{
    [Area("MvcDashboardIdentity")]
    [Authorize(Roles = "Administrator,IdentityAdministrator")]
    public abstract class BaseController : Controller
    {
        [HttpGet]
        public IActionResult MvcDashboardsDropdown()
        {
            var model = new List<string>();
            foreach (var type in this.GetType().Assembly.GetTypes().Where(t => t.Name == "BaseController" && (t.Namespace?.Contains(".Areas.MvcDashboard") ?? false)))
            {
                var accessible = true;
                var aatributes = type.GetCustomAttributes(typeof(AuthorizeAttribute), false);
                foreach (AuthorizeAttribute aatr in aatributes)
                {
                    if (aatr.Roles != null && !aatr.Roles.Split(',').Select(s => s.Trim()).Any(r => User.IsInRole(r))) accessible = false;
                }

                if (accessible)
                {
                    var nsparts = type.Namespace.Split('.');
                    model.Add(nsparts[nsparts.Length - 2]);
                }
            }

            return View(model);
        }

        protected IActionResult Back(bool allowCaching = true)
        {
            Response.Headers["X-Sircl-History"] = (allowCaching) ? "back" : "back-uncached";
            return this.StatusCode(204);
        }

        protected IActionResult Forward(string url)
        {
            Response.Headers["Location"] = url;
            return this.StatusCode(204);
        }

        protected IActionResult ForwardToAction(string action, string controller = null, object values = null)
        {
            return this.Forward(Url.Action(action, controller, values));
        }

        protected IActionResult DialogClose()
        {
            return this.StatusCode(204);
        }

        protected IActionResult DialogOk()
        {
            Response.Headers["X-Sircl-History"] = "reload-main";
            return this.StatusCode(204);
        }
    }
}
