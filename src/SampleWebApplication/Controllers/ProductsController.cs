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
                // A complex serverside confirmation dialogue where multiple questions are asked.
                // When confirmed, ShortName and Price=0 just proceed,
                // When confirmed the BarCode=0, a code is generated and the updated view is rendered, the user has to save again.

                // For a simple confirmation dialogue (single question), see the CustomersController.Update method.

                var confirmShortName = "Name is very short. Proceed anyway ?";
                var confirmPrice = "Price is 0. Proceed anyway ?";
                var confirmBarcode = "Barcode is 0. Autogenerate a new barcode ?";
                var confirms = new List<string>();
                confirms.Add(confirmShortName);
                confirms.Add(confirmPrice);
                confirms.Add(confirmBarcode);

                // If name is very short, ask confirmation:
                {
                    if (model.Item.Id == 0 && model.Item.Label != null && model.Item.Label.Length < 2 && !confirms.Contains(Request.Headers["X-Sircl-Confirmed"]))
                    {
                        Response.Headers["X-Sircl-Confirm"] = confirmShortName;
                        return NoContent();
                    }
                    confirms.Remove(confirmShortName);
                }

                // If price is 0, ask cofirmation:
                {
                    if (model.Item.Id == 0 && model.Item.UnitPrice == 0m && !confirms.Contains(Request.Headers["X-Sircl-Confirmed"]))
                    {
                        Response.Headers["X-Sircl-Confirm"] = confirmPrice;
                        return NoContent();
                        // When confirmation is rejected, nocontent leaves the content, but you could also return an updated view to render when rejected:
                        //ModelState.Clear();
                        //model.Item.UnitPrice = 1.0m;
                        //return UpdateView(model);
                    }
                    confirms.Remove(confirmPrice);
                }

                // If barcode is 0, ask cofirmation:
                {
                    confirms.Add(confirmBarcode);
                    if (model.Item.Id == 0 && model.Item.Barcode == 0m && !confirms.Contains(Request.Headers["X-Sircl-Confirmed"]))
                    {
                        Response.Headers["X-Sircl-Confirm"] = confirmBarcode;
                        return NoContent();
                        // When confirmation is rejected, nocontent leaves the content, but you could also return an updated view to render when rejected:
                        //ModelState.Clear();
                        //model.Item.Barcode = 123.0m;
                        //return UpdateView(model);
                    }
                    else if (Request.Headers["X-Sircl-Confirmed"] == confirmBarcode)
                    {
                        // When confirmation accepted (to generate a new code), generate a new barcode and render updated view:
                        ModelState.Clear();
                        model.Item.Barcode = new Random().Next();
                        return UpdateView(model);
                    }
                    confirms.Remove(confirmBarcode);
                }

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