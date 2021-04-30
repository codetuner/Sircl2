using Arebis.Core.AspNet.Localization;
using Arebis.Core.Localization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Controllers
{
    [Authorize(Roles = "Administrator,LocalizeAdministrator,LocalizeTranslator")]
    public class HomeController : BaseController
    {
        #region Construction

        private readonly LocalizeDbContext context;

        public HomeController(LocalizeDbContext context)
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

        [HttpGet]
        [Authorize(Roles = "Administrator,LocalizeAdministrator")]
        public IActionResult ReloadFromSource([FromServices] LocalizationService localizationService, [FromServices] ILocalizationSource localizationSource)
        {
            localizationService.ReloadFromSource(localizationSource);

            return ForwardToAction("Index", target: "_self");
        }
    }
}
