using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sircl.Website.Areas.MvcDashboardContent.Models.SecuredPath;
using Sircl.Website.Data;
using Sircl.Website.Data.Content;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Areas.MvcDashboardContent.Controllers
{
    [Authorize(Roles = "Administrator,ContentAdministrator")]
    public class SecuredPathController : BaseController
    {
        #region Construction

        private readonly ContentDbContext context;

        public SecuredPathController(ContentDbContext context)
        {
            this.context = context;
        }

        #endregion

        #region Index

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            var count = context.ContentSecuredPaths
                .Where(i => i.Path.Contains(model.Query ?? "") || i.Roles.Contains(model.Query ?? ""))
                .Count();
            model.MaxPage = (count + model.PageSize - 1) / model.PageSize;
            model.Items = context.ContentSecuredPaths
                .Where(i => i.Path.Contains(model.Query ?? "") || i.Roles.Contains(model.Query ?? ""))
                .OrderBy(model.Order ?? "Path ASC")
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();

            return View("Index", model);
        }

        #endregion

        #region Edit

        [HttpGet]
        public IActionResult New()
        {
            var model = new EditModel();
            model.Item = new Data.Content.SecuredPath();
            return EditView(model);
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var model = new EditModel();
            model.Item = context.ContentSecuredPaths.Find(id);
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
                var item = context.ContentSecuredPaths.Find(id);
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
            model.PathsList = context.ContentDocuments.Select(d => d.Path).Distinct().OrderBy(p => p).ToList();
            return View("Edit", model);
        }

        #endregion
    }
}
