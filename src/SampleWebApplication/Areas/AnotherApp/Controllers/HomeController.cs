using Microsoft.AspNetCore.Mvc;

namespace SampleWebApplication.Areas.AnotherApp.Controllers
{
    [Area("AnotherApp")]
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Page1()
        {
            return View();
        }

        public IActionResult Page2()
        {
            return View();
        }
    }
}
