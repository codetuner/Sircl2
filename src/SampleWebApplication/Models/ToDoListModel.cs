using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SampleWebApplication.Models
{
    public class ToDoListModel
    {
        public ToDoItem NewItem { get; set; }

        public List<ToDoItem> NewItems { get; set; } = new List<ToDoItem>();

        public List<ToDoItem> BusyItems { get; set; } = new List<ToDoItem>();

        public List<ToDoItem> DoneItems { get; set; } = new List<ToDoItem>();

        public string DropData { get; set; }
    }
}
