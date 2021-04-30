using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Areas.MvcDashboardIdentity.Models.Home;
using Sircl.Website.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardIdentity.Controllers
{
    public class HomeController : BaseController
    {
        #region Construction

        private readonly ApplicationDbContext context;

        public HomeController(ApplicationDbContext context)
        {
            this.context = context;
        }

        #endregion

        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult TopMenu()
        {
            var model = new TopMenuModel();
            model.UserCount = context.Users.Count();
            model.RoleCount = context.Roles.Count();
            return View(model);
        }

        [HttpGet]
        public IActionResult GetStarted()
        {
            return View();
        }
    }
}
