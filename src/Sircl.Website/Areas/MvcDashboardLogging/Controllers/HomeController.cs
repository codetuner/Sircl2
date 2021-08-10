using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLogging.Controllers
{
    [Authorize(Roles = "Administrator,LoggingAdministrator")]
    public class HomeController : BaseController
    {
        #region Construction

        private readonly ContentDbContext context;

        public HomeController(ContentDbContext context)
        {
            this.context = context;
        }

        #endregion

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult GetStarted()
        {
            return View();
        }
    }
}
