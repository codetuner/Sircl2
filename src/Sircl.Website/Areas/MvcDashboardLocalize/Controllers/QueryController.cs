using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Sircl.Website.Areas.MvcDashboardLocalize.Models.Query;
using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Controllers
{
    [Authorize(Roles = "Administrator,LocalizeAdministrator")]
    public class QueryController : BaseController
    {
        #region Construction

        private readonly LocalizeDbContext context;
        private readonly ILogger logger;

        public QueryController(LocalizeDbContext context, ILogger<KeyController> logger)
        {
            this.context = context;
            this.logger = logger;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            var count = context.LocalizeQueries
                .Where(i => i.DomainId == model.DomainId || model.DomainId == null)
                .Where(i => i.Name.Contains(model.Query ?? ""))
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = context.LocalizeQueries
                .Include(i => i.Domain)
                .Where(i => i.DomainId == model.DomainId || model.DomainId == null)
                .Where(i => i.Name.Contains(model.Query ?? ""))
                .OrderBy(model.Order ?? "Name ASC")
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();
            model.Domains = context.LocalizeDomains
                .OrderBy(d => d.Name)
                .Select(d => new SelectListItem() { Value = d.Id.ToString(), Text = d.Name, Selected = (model.DomainId == d.Id) })
                .ToList();

            return View("Index", model);
        }

        #endregion

        #region Edit

        [HttpGet]
        public IActionResult New(int? domainId)
        {
            var model = new EditModel();
            model.Item = new Data.Localize.Query() { DomainId = domainId ?? 0 };
            return EditView(model);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var model = new EditModel();
            model.Item = context.LocalizeQueries
                .Include(q => q.Domain)
                .SingleOrDefault(q => q.Id == id);
            if (model.Item == null) return new NotFoundResult();

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Save(int id, EditModel model, bool apply = false)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    context.Update(model.Item);
                    context.SaveChanges();
                    if (!apply) return Back(false);
                    else
                    {
                        ModelState.Clear();
                        model.HasChanges = false;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Unexpected error saving query {0}", id);
                    ModelState.AddModelError("", "An unexpected error occured.");
                    ViewBag.Exception = ex;
                }
            }
            else
            {
                SetToastrMessage("error", "Failed to save the query.<br/>See validation messages for more information.");
            }

            Response.Headers.Add("X-Sircl-History-Replace", Url.Action("Edit", new { id = model.Item.Id }));
            return EditView(model);
        }

        [HttpPost]
        public IActionResult Delete(int id, EditModel model)
        {
            try
            {
                var item = context.LocalizeQueries.Find(id);
                context.Remove(item);
                context.SaveChanges();
                return Back(false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error deleting query {0}", id);
                ModelState.AddModelError("", "An unexpected error occured.");
                ViewBag.Exception = ex;
            }

            return EditView(model);
        }

        private IActionResult EditView(EditModel model)
        {
            model.Domains = context.LocalizeDomains.OrderBy(d => d.Name).ToArray();
            model.ConnectionNames = context.LocalizeQueries.Select(q => q.ConnectionName).Distinct().OrderBy(n => n).ToArray();

            return View("Edit", model);
        }

        #endregion
    }
}
