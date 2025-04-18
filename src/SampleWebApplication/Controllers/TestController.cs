﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Controllers
{
    public class TestController : Controller
    {
        public IActionResult Echo(string msg)
        {
            msg = msg.Replace("{time}", DateTime.Now.ToString("HH:mm:ss"));
            msg = msg.Replace("{url}", Request.Path);
            return Content(msg);
        }

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

        [HttpGet, HttpPost]
        public IActionResult RequestInfo(List<IFormFile> files)
        {
            ViewBag.Files = files;
            return View();
        }

        [HttpGet, HttpPost]
        public IActionResult BackOrClose()
        {
            Response.Headers["X-Sircl-History-AllowClose"] = "True";
            Response.Headers["X-Sircl-History"] = "back-uncached";
            return NoContent();
        }

    }
}
