using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using SampleWebApplication.Models.Sortable;
using System.Diagnostics;

namespace SampleWebApplication.Controllers
{
    public class SortableController : BaseController
    {
        private static List<string> items = new List<string>(new string[] { "Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel" });

        private static List<string> screen = new List<string>();

        private static List<KeyValuePair<string, string>> controls = new List<KeyValuePair<string, string>>();

        static SortableController()
        {
            controls.Add(new KeyValuePair<string, string>("Heading", "<p><b>HEADING</b></p>"));
            controls.Add(new KeyValuePair<string, string>("Paragraph", "<p>Paragraph</p>"));
            controls.Add(new KeyValuePair<string, string>("Textfield", "<div class='form-group'><label>Text input:</label><input type='text' class='form-control'></div>"));
            controls.Add(new KeyValuePair<string, string>("Checkbox", "<div class='form-group form-check'><label><input type='checkbox' class='form-check-input'> Checkbox</label></div>"));
            controls.Add(new KeyValuePair<string, string>("Button", "<div class='form-group'><button type='button' class='btn btn-primary'>Button</button></div>"));
        }

        public IActionResult Index()
        {
            return IndexView();
        }

        public IActionResult Reorder(string fromlist, int fromindex, string tolist, int toindex)
        {
            Debug.WriteLine($"Reorder From {fromlist}:{fromindex} To {tolist}:{toindex}");

            var item = items[fromindex];
            items.RemoveAt(fromindex);
            items.Insert(toindex, item);

            return IndexView();
        }

        public IActionResult Noop(string fromlist, int fromindex, string tolist, int toindex)
        {
            Debug.WriteLine($"Noop From {fromlist}:{fromindex} To {tolist}:{toindex}");
            return this.StatusCode(204);
        }

        public IActionResult AddControl(string fromlist, int fromindex, string tolist, int toindex)
        {
            Debug.WriteLine($"AddControl From {fromlist}:{fromindex} To {tolist}:{toindex}");

            screen.Insert(toindex, controls[fromindex].Value);

            return IndexView();
        }

        public IActionResult UpdateScreen(string fromlist, int fromindex, string tolist, int toindex)
        {
            Debug.WriteLine($"UpdateScreen From {fromlist}:{fromindex} To {tolist}:{toindex}");

            var item = screen[fromindex];
            screen.RemoveAt(fromindex);
            screen.Insert(toindex, item);

            return IndexView();
        }

        public IActionResult DeleteControl(int index)
        {
            screen.RemoveAt(index);

            return IndexView();
        }

        private IActionResult IndexView()
        {
            var model = new IndexModel();
            model.Items = items;
            model.Controls = controls;
            model.Screen = screen;

            return View("Index", model);
        }
    }
}
