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
            model.NewItems = Program.ToDoLanes[0];
            model.BusyItems = Program.ToDoLanes[1];
            model.DoneItems = Program.ToDoLanes[2];

            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Submit(ToDoListModel model)
        {
            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Drop(ToDoListModel model, int targetZone)
        {
            var dropdata = model.DropData.Split(',');
            var sourceZone = Int32.Parse(dropdata[0]);
            var sourceIndex = Int32.Parse(dropdata[1]);

            ToDoItem item = null;
            switch (sourceZone)
            {
                case 0:
                    item = model.NewItems[sourceIndex];
                    model.NewItems.RemoveAt(sourceIndex);
                    break;
                case 1:
                    item = model.BusyItems[sourceIndex];
                    model.BusyItems.RemoveAt(sourceIndex);
                    break;
                case 2:
                    item = model.DoneItems[sourceIndex];
                    model.DoneItems.RemoveAt(sourceIndex);
                    break;
            }

            switch (targetZone)
            {
                case 0:
                    model.NewItems.Add(item);
                    break;
                case 1:
                    model.BusyItems.Add(item);
                    break;
                case 2:
                    model.DoneItems.Add(item);
                    break;
            }

            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Add(ToDoListModel model)
        {
            model.NewItems.Add(model.NewItem);
            model.NewItem = null;

            return ViewIndex(model, true);
        }

        [HttpPost]
        public IActionResult Save(ToDoListModel model)
        {
            if (ModelState.IsValid)
            {
                Program.ToDoLanes = new List<List<ToDoItem>>() 
                {
                    model.NewItems,
                    model.BusyItems,
                    model.DoneItems
                };
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
