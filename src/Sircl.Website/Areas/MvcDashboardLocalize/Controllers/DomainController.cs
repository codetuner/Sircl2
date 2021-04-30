using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Data.Localize;
using Sircl.Website.Areas.MvcDashboardLocalize.Models.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Options;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Controllers
{
    [Authorize(Roles = "Administrator,LocalizeAdministrator")]
    public class DomainController : BaseController
    {
        #region Construction

        private readonly LocalizeDbContext context;

        public DomainController(LocalizeDbContext context)
        {
            this.context = context;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            model.MaxPage = 1;
            model.Items = context.LocalizeDomains
                .OrderBy(i => i.Name)
                .ToArray();

            return View("Index", model);
        }

        #endregion

        #region Edit

        public IActionResult New([FromServices] IOptions<RequestLocalizationOptions> requestLocalizationOptions)
        {
            var model = new EditModel();
            model.Item = new Domain()
            {
                Cultures = String.Join(',', requestLocalizationOptions.Value.SupportedUICultures.Select(c => c.TwoLetterISOLanguageName).Distinct())
            };

            return EditView(model);
        }

        public IActionResult Edit(int id)
        {
            var model = new EditModel();
            model.Item = context.LocalizeDomains.Find(id);
            if (model.Item == null) return new NotFoundResult();

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Save(int id, EditModel model)
        {
            // Validate cultures:
            if (model.Item.Cultures != null)
            {
                var cultures = model.Item.Cultures.Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToArray();
                if (cultures.Distinct().Count() != cultures.Count())
                {
                    ModelState.AddModelError("Item.Cultures", "Value should not contain duplicates!");
                }
                else if (cultures.Length == 0)
                {
                    ModelState.AddModelError("Item.Cultures", "Value is required!");
                }
            }
            else
            {
                ModelState.AddModelError("Item.Cultures", "Value is required!");
            }

            // Validate modelstate and save:
            if (ModelState.IsValid)
            {
                try
                {
                    context.Update(model.Item);
                    context.SaveChanges();
                    return this.Close(true);
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "An unexpected error occured.");
                    ViewBag.Exception = ex;
                }
            }

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Delete(int id, EditModel model)
        {
            try
            {
                var item = context.LocalizeDomains.Find(id);
                context.Remove(item);
                context.SaveChanges();
                return this.Close(true);
            }
            catch (Exception ex)
            {
                ModelState.AddModelError("", "An unexpected error occured.");
                ViewBag.Exception = ex;
            }

            return EditView(model);
        }

        private IActionResult EditView(EditModel model)
        {
            return View("Edit", model);
        }

        #endregion
    }
}
