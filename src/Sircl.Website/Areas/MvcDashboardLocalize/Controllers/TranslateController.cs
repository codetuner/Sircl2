using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Sircl.Website.Areas.MvcDashboardLocalize.Models.Translate;
using Sircl.Website.Data.Localize;
using Sircl.Website.Localize;
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
        private readonly ILogger logger;
        private readonly ITranslationService translationService;

        public TranslateController(LocalizeDbContext context, ILogger<KeyController> logger, ITranslationService translationService = null)
        {
            this.context = context;
            this.logger = logger;
            this.translationService = translationService;
        }

        #endregion

        #region Index

        [HttpGet]
        public async Task<IActionResult> IndexAsync(IndexModel model)
        {
            try
            {
                if (translationService != null)
                {
                    var response = await translationService.TranslateAsync("en", "fr", "text/plain", new String[] { "Hello World", "See you next time!" });

                    model.TranslationResponse = response.ToList();
                }
                else
                {
                    model.TranslationResponse = new List<string>(new String[] { "No-translation-service" });
                }
            }
            catch (Exception ex)
            {
                model.Exception = ex;
            }

            return View("Index", model);
        }

        #endregion
    }
}
