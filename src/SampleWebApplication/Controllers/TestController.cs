using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Controllers
{
    public class TestController : Controller
    {
        public IActionResult ChangeSucceed()
        {
            Debug.WriteLine($"{DateTime.Now:HH:mm:ss} ChangeSucceeded: {Request.QueryString}");
            return Ok();
        }

        public IActionResult ChangeFailed()
        {
            Debug.WriteLine($"{DateTime.Now:HH:mm:ss} ChangeFailed: {Request.QueryString}");
            return StatusCode(500);
        }
    }
}
