using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWebApplication.Data;
using SampleWebApplication.Models.Products;

namespace SampleWebApplication.Controllers
{
    public class ProductsController : BaseController
    {
        public ProductsController(ApplicationDbContext context)
        {
            this.Context = context;
        }

        public ApplicationDbContext Context { get; set; }

        [HttpGet]
        public IActionResult AutoComplete(string value, string listid = null)
        {
            // Retrieve list of items:
            var model = Context.Product.Where(p => p.Label.Contains(value)).Select(p => p.Label).OrderBy(l => l).ToList();
            if (model.Count == 1 && model[0] == value) model.Clear();

            // Return datalist:
            var html = new StringBuilder();
            if (listid != null) html.Append($"<datalist id=\"{listid}\">");
            foreach (var item in model)
            {
                html.Append("<option value=\"");
                html.Append(HttpUtility.HtmlEncode(item));
                html.Append("\">");
            }
            if (listid != null) html.Append("</datalist>");
            return Content(html.ToString(), "text/html");
        }

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            model.ItemCount = Context.Product
                .Where(p => p.Label.Contains(model.Query ?? ""))
                .Count();

            model.Items = Context.Product
                .Where(p => p.Label.Contains(model.Query ?? ""))
                .OrderBy(c => c.Id)
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();

            return View("Index", model);
        }

        [HttpGet]
        public IActionResult Update(int id)
        {
            var model = new UpdateModel();
            model.Item = Context.Product
                .SingleOrDefault(c => c.Id == id)
                ?? new Product();

            return UpdateView(model);
        }

        [HttpPost]
        public IActionResult Update(UpdateModel model)
        {
            if (ModelState.IsValid)
            {
                Context.Update(model.Item);
                Context.SaveChanges();

                Response.Headers["X-Sircl-Toastr"] = $"success|Your changes to <i>{HttpUtility.HtmlEncode(model.Item.Label)}</i> have now been saved.|Product changes saved";

                return Back(false);
            }
            else
            {
                return UpdateView(model);
            }
        }

        [NonAction]
        private IActionResult UpdateView(UpdateModel model)
        {
            return View("Update", model);
        }

        [HttpPost]
        public IActionResult Delete(UpdateModel model)
        {
            Context.Remove(model.Item);
            Context.SaveChanges();

            return Back(false);
        }

        public IActionResult List()
        {
            Thread.Sleep(300);

            var model = new ListModel();
            model.Products.AddRange(Context.Product);

            return Json(model);
        }
    }
}