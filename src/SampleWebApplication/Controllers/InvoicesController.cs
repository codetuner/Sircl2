using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SampleWebApplication.Data;
using SampleWebApplication.Models.Invoices;

namespace SampleWebApplication.Controllers
{
    public class InvoicesController : BaseController
    {
        public InvoicesController(ApplicationDbContext context)
        {
            this.Context = context;
        }

        public ApplicationDbContext Context { get; set; }

        [HttpGet]
        public IActionResult Index(IndexModel model)
        {
            if (model.CustomerId.HasValue)
            {
                model.ItemCount = Context.Invoice.Where(i => i.CustomerId == model.CustomerId).Count();

                model.Items = Context.Invoice
                    .Include(i => i.Customer)
                    .Where(i => i.CustomerId == model.CustomerId)
                    .OrderBy(c => c.Id)
                    .Skip((model.Page - 1) * model.PageSize)
                    .Take(model.PageSize)
                    .ToArray();
            }
            else
            {
                model.ItemCount = Context.Invoice.Count();

                model.Items = Context.Invoice
                    .Include(i => i.Customer)
                    .OrderBy(c => c.Id)
                    .Skip((model.Page - 1) * model.PageSize)
                    .Take(model.PageSize)
                    .ToArray();
            }

            return View("Index", model);
        }

        [HttpPost]
        public IActionResult SetPaid(IndexModel model)
        {
            ModelState.Clear();
            System.Threading.Thread.Sleep(200);
            foreach (var item in Context.Invoice.Where(i => model.Selection.Contains(i.Id)))
            {
                item.Status = InvoiceStatus.Paid;
            }
            Context.SaveChanges();

            return Index(model);
        }

        [HttpPost]
        public IActionResult SetAwaiting(IndexModel model)
        {
            ModelState.Clear();
            System.Threading.Thread.Sleep(200);
            foreach (var item in Context.Invoice.Where(i => model.Selection.Contains(i.Id)))
            {
                item.Status = InvoiceStatus.AwaitingPayment;
            }
            Context.SaveChanges();

            return Index(model);
        }

        [HttpGet]
        public IActionResult Update(int id, int customerId = 0)
        {
            var model = new UpdateModel();
            model.Item = Context.Invoice
                .Include(c => c.Customer).ThenInclude(c => c.Country)
                .Include(c => c.Lines).ThenInclude(l => l.Product)
                .SingleOrDefault(c => c.Id == id)
                ?? new Invoice() { CustomerId = customerId, Date = DateTime.Now.Date };

            return UpdateView(model);
        }

        [HttpPost]
        public IActionResult AddLine(UpdateModel model)
        {
            ModelState.Clear();

            model.Item.With(model.NewLine.Quantity, Context.Product.Find(model.NewLine.ProductId));

            return UpdateView(model);
        }

        [HttpPost]
        public IActionResult RemoveLine(UpdateModel model, int index)
        {
            ModelState.Clear();

            model.Item.Lines.RemoveAt(index);

            return UpdateView(model);
        }

        [HttpPost]
        public IActionResult Update(UpdateModel model)
        {
            if (ModelState.IsValid)
            {
                var persistedInvoice = Context.Invoice
                    .Include(i => i.Lines)
                    .SingleOrDefault(i => i.Id == model.Item.Id);
                if (persistedInvoice == null)
                {
                    persistedInvoice = new Invoice();
                    Context.Invoice.Add(persistedInvoice);
                }
                Context.Entry(persistedInvoice).CurrentValues.SetValues(model.Item);
                foreach (var line in model.Item.Lines)
                {
                    line.InvoiceId = persistedInvoice.Id;
                    var persistedInvoiceLine = persistedInvoice.Lines.SingleOrDefault(l => l.Id == line.Id && line.Id != 0);
                    if (persistedInvoiceLine == null)
                    {
                        persistedInvoiceLine = new InvoiceLine() { Invoice = persistedInvoice };
                        Context.InvoiceLine.Add(persistedInvoiceLine);
                    }
                    Context.Entry(persistedInvoiceLine).CurrentValues.SetValues(line);
                }
                foreach (var line in persistedInvoice.Lines.Where(l => !model.Item.Lines.Select(ll => ll.Id).Contains(l.Id)))
                {
                    Context.Remove(line);
                }
                Context.SaveChanges();

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
            model.Item.Customer = Context.Customer.Include(c => c.Country).SingleOrDefault(c => c.Id == model.Item.CustomerId);
            model.NewLine = new InvoiceLine();
            model.Customers = Context.Customer.OrderBy(p => p.Name).ToArray();
            model.Products = Context.Product.OrderBy(p => p.Label).ToArray();

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