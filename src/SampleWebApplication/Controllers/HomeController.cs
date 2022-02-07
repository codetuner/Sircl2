using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SampleWebApplication.Data;
using SampleWebApplication.Models;

namespace SampleWebApplication.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext context;

        public HomeController(ILogger<HomeController> logger, ApplicationDbContext context)
        {
            _logger = logger;
            this.context = context;
        }

        public IActionResult Index()
        {
            ViewBag.IsDataSeeded = context.Country.Any(c => c.Name == "Belgium");

            return View();
        }

        public IActionResult IndexDelayed()
        {
            Thread.Sleep(2000);

            ViewBag.IsDataSeeded = context.Country.Any(c => c.Name == "Belgium");

            return View("Index");
        }

        public IActionResult DialogContent(string target)
        {
            Thread.Sleep(2000);

            if (target != null)
                Response.Headers["X-Sircl-Target"] = target;

            return View("DialogContent");
        }

        public IActionResult ModalContent(string target)
        {
            Thread.Sleep(2000);

            if (target != null)
                Response.Headers["X-Sircl-Target"] = target;

            return View("ModalContent");
        }

        [HttpPost]
        public IActionResult IndexPost()
        {
            Thread.Sleep(2000);

            ViewBag.IsDataSeeded = context.Country.Any(c => c.Name == "Belgium");

            return View("Index");
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult Action(string name, string[] value, bool fail = false, string newValue = null)
        {
            System.Threading.Thread.Sleep(600);

            if (fail)
            {
                Response.Headers.Add("X-Sircl-Alert-Message", "Failed to update value.");
                return this.StatusCode(500);
            }
            else if (newValue != null)
            {
                return Json(newValue);
            }
            else
            {
                return this.StatusCode(204);
            }
        }

        public IActionResult ActionArray(string name, string[] value, bool fail = false, string[] newValue = null)
        {
            System.Threading.Thread.Sleep(200);

            if (fail)
            {
                Response.Headers.Add("X-Sircl-Alert-Message", "Failed to update value.");
                return this.StatusCode(500);
            }
            else if (newValue != null)
            {
                return Json(newValue);
            }
            else
            {
                return this.StatusCode(204);
            }
        }

        public IActionResult Format(string name, string value, bool fail = false)
        {
            System.Threading.Thread.Sleep(200);

            if (fail)
            {
                //Response.Headers.Add("X-Sircl-Alert-Message", "Failed to format value.");
                return this.StatusCode(500);
            }
            else
            {
                return Json(Decimal.Parse(value).ToString("#,##0.00"));
            }
        }

        public IActionResult UnFormat(string name, string value, bool fail = false)
        {
            System.Threading.Thread.Sleep(200);

            if (fail)
            {
                //Response.Headers.Add("X-Sircl-Alert-Message", "Failed to format value.");
                return this.StatusCode(500);
            }
            else
            {
                return Json(Decimal.Parse(value).ToString());
            }
        }

        public IActionResult Playground()
        {
            return View("Playground");
        }

        public IActionResult PlaygroundBs5()
        {
            return View("PlaygroundBs5");
        }

        public IActionResult Infinite(int page)
        {
            return View("Infinite", page);
        }

        public IActionResult InfiniteRows(int page)
        {
            return View("InfiniteRows", page);
        }

        public IActionResult ConnectionMode(string[] cm)
        {
            var result = new List<string>(cm);

            if (result.Contains("FM"))
            {
                result.Remove("WIFI");
                result.Remove("BT");
            }

            return Json(result.ToArray());
        }

        public IActionResult ConnectionSpeed(string modes, int value)
        {
            if (modes != null && modes.Contains("FM"))
            {
                return View("ConnectionSpeedError");
            }
            else
            {
                return View(value);
            }
        }

        //[Route("/{**catchAll}")]
        //public IActionResult CatchAll(string catchAll)
        //{
        //    return new ContentResult() { Content = $"<h1>CatchAll: {catchAll}</h1>", ContentType = "text/html", StatusCode = 200 };
        //}

        [HttpPost]
        public IActionResult SeedData()
        {
            if (!context.Country.Any(c => c.Name == "Belgium"))
            {
                Country b, f, n, s, u;
                context.Country.Add(b = new Country() { Name = "Belgium" });
                context.Country.Add(f = new Country() { Name = "France" });
                context.Country.Add(n = new Country() { Name = "Netherlands" });
                context.Country.Add(s = new Country() { Name = "Spain" });
                context.Country.Add(u = new Country() { Name = "United Kingdom" });
                context.Country.Add(new Country() { Name = "United States" });
                context.Country.Add(new Country() { Name = "Russia" });

                Customer c1, c2, c3;
                context.Customer.Add(c1 = new Customer() { Name = "Ana Trujillo Emparedados y helados", Address = "Avda. de la Constitución 2222", ZipCode = "25012", Town = "Madrid", Country = s });
                context.Customer.Add(c2 = new Customer() { Name = "B's Beverages", Address = "Fauntleroy Circus", ZipCode = "EC2 5NT", Town = "London", Country = u });
                context.Customer.Add(c3 = new Customer() { Name = "Du monde entier", Address = "67, rue des Cinquante Otages", ZipCode = "44000", Town = "Nantes", Country = f });
                context.Customer.Add(new Customer() { Name = "Bólido Comidas preparadas", Address = "C/ Araquil, 67", ZipCode = "28023", Town = "Madrid", Country = s });
                context.Customer.Add(new Customer() { Name = "Consolidated Holdings", Address = "Berkeley Gardens 12  Brewery", ZipCode = "WX1 6LT", Town = "London", Country = u });
                context.Customer.Add(new Customer() { Name = "Folies gourmandes", Address = "184, chaussée de Tournai", ZipCode = "59000", Town = "Lille", Country = f });
                context.Customer.Add(new Customer() { Name = "Maison Dewey", Address = "Rue Joseph-Bens 532", ZipCode = "1180", Town = "Bruxelles", Country = b });

                Product p1, p2, p3;
                context.Product.Add(p1 = new Product() { Label = "Chai", Barcode = 581001, UnitPrice = 18.00m, Description = "10 boxes x 20 bags" });
                context.Product.Add(p2 = new Product() { Label = "Chang", Barcode = 581002, UnitPrice = 19.00m, Description = "24 - 12 oz bottles" });
                context.Product.Add(p3 = new Product() { Label = "Aniseed Syrup", Barcode = 581003, UnitPrice = 10.00m, Description = "12 - 550 ml bottles" });
                context.Product.Add(new Product() { Label = "Chef Anton's Cajun Seasoning", Barcode = 582004, UnitPrice = 22.00m, Description = "48 - 6 oz jars" });
                context.Product.Add(new Product() { Label = "Chef Anton's Gumbo Mix", Barcode = 582005, UnitPrice = 21.35m, Description = "36 boxes" });
                context.Product.Add(new Product() { Label = "Grandma's Boysenberry Spread", Barcode = 583006, UnitPrice = 25.00m, Description = "12 - 8 oz jars" });
                context.Product.Add(new Product() { Label = "Uncle Bob's Organic Dried Pears", Barcode = 583007, UnitPrice = 30.00m, Description = "12 - 1 lb pkgs." });
                context.Product.Add(new Product() { Label = "Northwoods Cranberry Sauce", Barcode = 583008, UnitPrice = 40.00m, Description = "12 - 12 oz jars" });
                context.Product.Add(new Product() { Label = "Mishi Kobe Niku", Barcode = 584009, UnitPrice = 97.00m, Description = "18 - 500 g pkgs." });
                context.Product.Add(new Product() { Label = "Ikura", Barcode = 584010, UnitPrice = 31.00m, Description = "12 - 200 ml jars" });
                context.Product.Add(new Product() { Label = "Queso Cabrales", Barcode = 585011, UnitPrice = 21.00m, Description = "1 kg pkg." });
                context.Product.Add(new Product() { Label = "Queso Manchego La Pastora", Barcode = 585012, UnitPrice = 38.00m, Description = "10 - 500 g pkgs." });
                context.Product.Add(new Product() { Label = "Konbu", Barcode = 586013, UnitPrice = 6.00m, Description = "2 kg box" });
                context.Product.Add(new Product() { Label = "Tofu", Barcode = 586014, UnitPrice = 23.25m, Description = "40 - 100 g pkgs." });
                context.Product.Add(new Product() { Label = "Genen Shouyu", Barcode = 586015, UnitPrice = 15.50m, Description = "24 - 250 ml bottles" });
                context.Product.Add(new Product() { Label = "Pavlova", Barcode = 587016, UnitPrice = 17.45m, Description = "32 - 500 g boxes" });
                context.Product.Add(new Product() { Label = "Alice Mutton", Barcode = 587017, UnitPrice = 39.00m, Description = "20 - 1 kg tins" });
                context.Product.Add(new Product() { Label = "Carnarvon Tigers", Barcode = 587018, UnitPrice = 62.50m, Description = "16 kg pkg." });
                context.Product.Add(new Product() { Label = "Teatime Chocolate Biscuits", Barcode = 588019, UnitPrice = 9.20m, Description = "10 boxes x 12 pieces" });
                context.Product.Add(new Product() { Label = "Sir Rodney's Marmalade", Barcode = 588020, UnitPrice = 81.00m, Description = "30 gift boxes" });
                context.Product.Add(new Product() { Label = "Sir Rodney's Scones", Barcode = 588021, UnitPrice = 10.00m, Description = "24 pkgs. x 4 pieces" });
                context.Product.Add(new Product() { Label = "Gustaf's Knäckebröd", Barcode = 589022, UnitPrice = 21.00m, Description = "24 - 500 g pkgs." });
                context.Product.Add(new Product() { Label = "Tunnbröd", Barcode = 589023, UnitPrice = 9.00m, Description = "12 - 250 g pkgs." });
                context.Product.Add(new Product() { Label = "Guaraná Fantástica", Barcode = 590024, UnitPrice = 4.50m, Description = "12 - 355 ml cans" });
                context.Product.Add(new Product() { Label = "NuNuCa Nuß-Nougat-Creme", Barcode = 591025, UnitPrice = 14.00m, Description = "20 - 450 g glasses" });

                context.SaveChanges();

                var inv1 = c1.NewInvoice()
                    .With(10, p1);
                inv1.Status = InvoiceStatus.Paid;

                context.SaveChanges();

                var inv2 = c1.NewInvoice()
                    .With(3, p1)
                    .With(5, p2);
                inv2.Status = InvoiceStatus.Paid;

                context.SaveChanges();

                var inv3 = c2.NewInvoice()
                    .With(1, p2)
                    .With(1, p3);
                inv3.Status = InvoiceStatus.AwaitingPayment;

                context.SaveChanges();

                var inv4 = c2.NewInvoice()
                    .With(1, p2)
                    .With(1, p3);
                inv4.Status = InvoiceStatus.AwaitingPayment;

                context.SaveChanges();

                var inv5 = c2.NewInvoice()
                    .With(25, p1)
                    .With(10, p2)
                    .With(50, p3);
                inv5.Status = InvoiceStatus.Pending;

                context.SaveChanges();
            }


            return RedirectToAction("Index");
        }
    }
}
