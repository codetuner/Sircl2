using Microsoft.AspNetCore.Mvc;

namespace SampleWebApplication.Areas.AnApp.Controllers
{
    [Area("AnApp")]
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
