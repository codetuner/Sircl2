using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models
{
    public class ToDoListModel
    {
        public List<List<ToDoItem>> Items { get; set; }

        public ToDoItem NewItem { get; set; }
    }
}
