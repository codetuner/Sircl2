using Microsoft.AspNetCore.Mvc;
using SampleWebApplication.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Controllers
{
    public class ToDoController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            var model = new ToDoListModel();
            model.Items = Program.ToDoLanes;

            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Submit(ToDoListModel model)
        {
            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Add(ToDoListModel model)
        {
            model.Items[0].Add(model.NewItem);
            model.NewItem = null;

            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Save(ToDoListModel model)
        {
            if (ModelState.IsValid)
            {
                Program.ToDoLanes = model.Items;
            }

            return ViewIndex(model, false);
        }

        private IActionResult ViewIndex(ToDoListModel model, bool clearModelstate)
        {
            if (clearModelstate) ModelState.Clear();
            return View("Index", model);
        }
    }
}
