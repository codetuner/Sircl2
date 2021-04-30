using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Areas.MvcDashboardLocalize.Models.Translate;
using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Controllers
{
    [Authorize(Roles = "Administrator,LocalizeAdministrator,LocalizeTranslator")]
    public class TranslateController : BaseController
    {
        #region Construction

        private readonly LocalizeDbContext context;

        public TranslateController(LocalizeDbContext context)
        {
            this.context = context;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            return View("Index", model);
        }

        #endregion
    }
}
