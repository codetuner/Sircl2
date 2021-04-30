using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sircl.Website.Controllers
{
    public class TestController : Controller
    {
        public TestController(IStringLocalizer stringLocalizer)
        {
            this.Localizer = stringLocalizer;
        }

        public IStringLocalizer Localizer { get; private set; }

        public IActionResult Index(string id)
        {
            var s = Localizer["How are you ?"];

            return View("Index", s);
        }
    }
}
