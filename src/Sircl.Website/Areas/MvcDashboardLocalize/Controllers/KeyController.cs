using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Sircl.Website.Areas.MvcDashboardLocalize.Models.Key;
using Sircl.Website.Data.Localize;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardLocalize.Controllers
{
    [Authorize(Roles = "Administrator,LocalizeAdministrator")]
    public class KeyController : BaseController
    {
        #region Construction

        private readonly LocalizeDbContext context;

        public KeyController(LocalizeDbContext context)
        {
            this.context = context;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            var count = context.LocalizeKeys
                .Where(i => i.DomainId == model.DomainId || model.DomainId == null)
                .Where(i => i.Name.Contains(model.Query ?? ""))
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = context.LocalizeKeys
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
            model.Item = new Data.Localize.Key() { DomainId = domainId ?? 0 };
            return EditView(model);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var model = new EditModel();
            model.Item = context.LocalizeKeys
                .Include(k => k.Domain)
                .Include(k => k.Values)
                .SingleOrDefault(k => k.Id == id);
            if (model.Item == null) return new NotFoundResult();
            model.Values = model.Item.Values.ToList();

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Submit(int id, EditModel model)
        {
            ModelState.Clear();
            model.HasChanges = true;

            // Handle update of Domain, resulting in new list of cultures!

            return EditView(model);
        }

        [HttpPost]
        public IActionResult Save(int id, EditModel model, bool apply = false)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    model.Item.Values = model.Values.Where(v => v.Reviewed || v.Value != null).ToList();
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
                    ModelState.AddModelError("", "An unexpected error occured.");
                    ViewBag.Exception = ex;
                }
            }

            Response.Headers.Add("X-Sircl-History-Replace", Url.Action("Edit", new { id = model.Item.Id }));
            return EditView(model);
        }

        [HttpPost]
        public IActionResult Delete(int id, EditModel model)
        {
            try
            {
                var item = context.LocalizeKeys.Find(id);
                context.Remove(item);
                context.SaveChanges();
                return Back(false);
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
            model.Domains = context.LocalizeDomains.OrderBy(d => d.Name).ToArray();

            var domain = model.Domains.SingleOrDefault(d => d.Id == model.Item.DomainId);
            if (domain != null)
            {
                var domainCultures = domain.Cultures.Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToList();
                var values = model.Values.ToList();
                model.Values.Clear();
                foreach (var c in domainCultures)
                {
                    model.Values.Add(values.SingleOrDefault(v => v.Culture == c) ?? new KeyValue() { Culture = c });
                }
                foreach (var value in values)
                {
                    if (!model.Values.Contains(value) && (value.Reviewed || value.Value != null)) model.Values.Add(value);
                }
            }

            return View("Edit", model);
        }

        #endregion
    }
}
