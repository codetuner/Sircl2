using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWebApplication.Data;
using SampleWebApplication.Models.Customers;

namespace SampleWebApplication.Controllers
{
    public class CustomersController : BaseController
    {
        public CustomersController(ApplicationDbContext context)
        {
            this.Context = context;
        }

        public ApplicationDbContext Context { get; set; }

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            model.ItemCount = Context.Customer.Count();

            model.Items = Context.Customer
                .Include(c => c.Country)
                .OrderBy(c => c.Id)
                .Skip((model.Page - 1) * model.PageSize)
                .Take(model.PageSize)
                .ToArray();

            return View(model);
        }

        [HttpGet]
        public IActionResult Update(int id)
        {
            var model = new UpdateModel();
            model.Item = Context.Customer
                .Include(c => c.Country)
                .SingleOrDefault(c => c.Id == id)
                ?? new Customer();

            return UpdateView(model);
        }

        [HttpPost]
        public IActionResult Update(UpdateModel model)
        {
            if (ModelState.IsValid)
            {
                // A simple serverside confirmation dialogue with a single question:
                // For a complex confirmation dialogue (multiple questions), see the ProductsController.Update method.
                if (model.Item.Id == 0 && model.Item.Name != null && model.Item.Name.Length <= 2 && "".Equals(Request.Headers["X-Sircl-Confirmed"].ToString()))
                {
                    Response.Headers["X-Sircl-Confirm"] = "The name is very short. Are you sure you want to save this name ?";
                    return NoContent();
                }

                // Update & save:
                Context.Update(model.Item);
                Context.SaveChanges();

                // Return back:
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
            model.Countries = Context.Country.OrderBy(c => c.Name).ToArray();

            return View("Update", model);
        }
        
        [HttpPost]
        public IActionResult Delete(UpdateModel model)
        {
            Context.Remove(model.Item);
            Context.SaveChanges();

            return Back(false);
        }
    }
}